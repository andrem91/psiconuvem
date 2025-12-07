# 🏗️ PsicoNuvem - Arquitetura Técnica

**Documentação técnica para implementação**

---

## 📁 Estrutura do Projeto

```
psiconuvem/
├── src/
│   ├── app/                    # App Router (Next.js)
│   │   ├── (auth)/             # Rotas públicas de autenticação
│   │   │   ├── login/
│   │   │   └── registro/
│   │   ├── (dashboard)/        # Rotas protegidas
│   │   │   ├── dashboard/
│   │   │   ├── pacientes/
│   │   │   ├── agenda/
│   │   │   └── prontuarios/
│   │   ├── (public)/           # Rotas públicas
│   │   │   ├── p/[slug]/       # Perfil público do psicólogo
│   │   │   └── cadastro/[token]/ # Cadastro paciente via link
│   │   ├── api/                # API Routes
│   │   │   └── webhooks/       # Webhooks (Asaas)
│   │   └── auth/
│   │       └── callback/       # OAuth callback
│   ├── components/             # Componentes React
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # Formulários
│   │   └── layout/             # Layout components
│   ├── lib/                    # Bibliotecas e utilitários
│   │   ├── supabase/           # Clients Supabase
│   │   ├── actions/            # Server Actions
│   │   ├── utils/              # Utilitários gerais
│   │   └── encryption.ts       # Criptografia AES-256
│   └── types/                  # TypeScript types
│       └── supabase.ts         # Tipos gerados (Supabase CLI)
├── supabase/
│   ├── config.toml             # Configuração Supabase
│   ├── migrations/             # Migrations SQL
│   └── seed.sql                # Dados de seed
├── public/                     # Assets estáticos
└── tests/                      # Testes
```

---

## 🗄️ Modelo de Dados

### Entidades Principais

**Psychologist** (Psicólogo)
- `id`: UUID (PK)
- `userId`: UUID (FK → auth.users)
- `email`: string (unique)
- `name`: string
- `crp`: string (unique) - Registro profissional
- `slug`: string (unique) - URL pública
- `phone`: string?
- `plan`: enum (TRIAL, ESSENTIAL, PROFESSIONAL, PREMIUM)
- `trialEndsAt`: timestamp?
- `asaasCustomerId`: string? (unique)
- `createdAt`, `updatedAt`

**Patient** (Paciente)
- `id`: UUID (PK)
- `psychologistId`: UUID (FK → Psychologist)
- `name`: string
- `email`: string?
- `phone`: string
- `birthDate`: date?
- `notes`: text? - Observações gerais
- `createdAt`, `updatedAt`, `deletedAt` (soft delete)

**Appointment** (Agendamento)
- `id`: UUID (PK)
- `psychologistId`: UUID (FK)
- `patientId`: UUID (FK)
- `scheduledAt`: timestamp
- `duration`: int (minutos)
- `status`: enum (SCHEDULED, COMPLETED, CANCELLED, NO_SHOW)
- `meetLink`: string? - Link Google Meet
- `notes`: text?
- `createdAt`, `updatedAt`, `deletedAt`

**ClinicalNote** (Prontuário)
- `id`: UUID (PK)
- `psychologistId`: UUID (FK)
- `patientId`: UUID (FK)
- `sessionNumber`: int
- `content`: text (CRIPTOGRAFADO)
- `metadata`: jsonb? - Dados extras (duração, tipo)
- `createdAt`, `updatedAt`, `deletedAt`

**PatientRegistrationToken** (Link de Cadastro) ⭐ NOVO
- `id`: UUID (PK)
- `psychologistId`: UUID (FK)
- `token`: string (unique)
- `expiresAt`: timestamp
- `usedAt`: timestamp?
- `createdAt`

---

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Cada psicólogo só acessa seus próprios dados.

**Função auxiliar (performance):**
```sql
CREATE OR REPLACE FUNCTION get_current_psychologist_id()
RETURNS TEXT AS $$
  SELECT id FROM "Psychologist" 
  WHERE "userId" = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**Pattern das Policies:**
```sql
-- SELECT
CREATE POLICY "patient_select_own" ON "Patient" FOR SELECT
USING ("psychologistId" = get_current_psychologist_id());

-- INSERT
CREATE POLICY "patient_insert_own" ON "Patient" FOR INSERT
WITH CHECK ("psychologistId" = get_current_psychologist_id());

-- UPDATE/DELETE seguem o mesmo padrão
```

### Criptografia de Prontuários

**Algoritmo:** AES-256-GCM  
**Formato:** `iv:authTag:ciphertext` (hex)

**Regras:**
1. Criptografar ANTES de salvar no banco
2. Descriptografar APÓS ler do banco
3. Chave em variável de ambiente (`ENCRYPTION_KEY`)
4. Nunca logar conteúdo descriptografado
5. Backup da chave em cofre seguro

**Fluxo:**
```
[Frontend] → texto claro
     ↓
[Server Action] → encrypt(texto) → "iv:authTag:cipher"
     ↓
[Supabase] → salva criptografado
     ↓
[Server Action] → decrypt(cipher) → texto claro
     ↓
[Frontend] → exibe
```

### Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Criptografia
ENCRYPTION_KEY=  # 64 caracteres hex (32 bytes)

# Asaas
ASAAS_API_KEY=
ASAAS_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔄 Padrões de Código

### Server Actions

Toda mutação de dados usa Server Actions:

```typescript
// lib/actions/patients.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPatient(formData: FormData) {
  const supabase = await createClient()
  
  // Validação com Zod
  const validated = patientSchema.parse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    // ...
  })
  
  // RLS garante psychologistId automaticamente
  const { data, error } = await supabase
    .from('Patient')
    .insert(validated)
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/pacientes')
  return data
}
```

### Queries no Servidor

```typescript
// app/pacientes/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PacientesPage() {
  const supabase = await createClient()
  
  const { data: patients } = await supabase
    .from('Patient')
    .select('*')
    .is('deletedAt', null)
    .order('createdAt', { ascending: false })
  
  return <PatientList patients={patients} />
}
```

### Client Components

Usados apenas quando necessário (interatividade):

```typescript
// components/forms/PatientForm.tsx
'use client'

import { useFormStatus } from 'react-dom'
import { createPatient } from '@/lib/actions/patients'

export function PatientForm() {
  return (
    <form action={createPatient}>
      {/* campos */}
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending}>
      {pending ? 'Salvando...' : 'Salvar'}
    </button>
  )
}
```

---

## 🧪 Testes

### Estrutura

```
tests/
├── unit/           # Testes unitários (Vitest)
│   ├── encryption.test.ts
│   └── utils.test.ts
├── integration/    # Testes de integração
│   └── actions.test.ts
└── e2e/            # Testes E2E (Playwright)
    ├── auth.spec.ts
    └── patients.spec.ts
```

### Executar

```bash
# Unitários
npm run test

# E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🚀 Deploy

### Vercel

1. Conectar repositório GitHub
2. Configurar environment variables
3. Deploy automático em push para `main`

### Supabase Production

1. Criar projeto em supabase.com
2. Rodar migrations: `npx supabase db push`
3. Configurar Edge Functions (se necessário)

### Checklist Pre-Deploy

- [ ] Todas as env vars configuradas
- [ ] Migrations aplicadas
- [ ] RLS testado (tentar vazar dados)
- [ ] Criptografia funcionando
- [ ] Testes passando
- [ ] Build sem erros

---

## 📊 Monitoramento

### Ferramentas Recomendadas

| Ferramenta | Função | Custo |
|------------|--------|-------|
| Vercel Analytics | Performance | Grátis |
| Sentry | Error tracking | Grátis (10k/mês) |
| Supabase Dashboard | Logs + Métricas | Incluído |

### Métricas Importantes

- Tempo de resposta API (< 200ms)
- Taxa de erros (< 0.1%)
- Uptime (> 99.9%)
- Uso de banco (< 500MB no free tier)

---

## 🔗 Referências

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **shadcn/ui:** https://ui.shadcn.com

---

**Versão:** 8.0  
**Atualizado:** Dezembro 2025
