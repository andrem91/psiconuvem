# 🧠 PsicoNuvem OS

> SaaS de gestão clínica integrada para psicólogos brasileiros

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%2B%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Sobre o Projeto

**PsicoNuvem OS** é uma plataforma integrada para psicólogos gerenciarem suas clínicas de forma segura e eficiente. O sistema foi desenvolvido com foco em:

- 🔒 **Segurança** - Criptografia AES-256-GCM, RLS, LGPD compliance
- 🏢 **Multi-tenancy** - Isolamento total de dados entre profissionais
- 🇧🇷 **Brasil** - Validação de CRP, normas CFP
- ⚡ **Performance** - Next.js 16, React Server Components
- 🔄 **Integração** - Fluxo contínuo: Agenda → Prontuário → Financeiro

---

## ✨ Features

### Dashboard Unificado (Cockpit) ✅
- Home com estatísticas em tempo real
- Action Center (alertas de pendências)
- Timeline do dia (agenda visual)

### Gestão de Pacientes ✅
- CRUD completo com soft delete
- **Busca por nome** em tempo real
- Consentimento LGPD com registro de IP
- Status: Ativo/Inativo/Arquivado
- Histórico de consultas e pagamentos

### Agenda (Day View) ✅
- Timeline visual (07:00 - 22:00)
- Navegação dia-a-dia com "Hoje"
- Blocos coloridos por status
- Linha do "agora" em tempo real
- Geração automática de link Google Meet

### Controle Financeiro (Patient-Centric) ✅
- Health Cards (Recebido, Pendente, Em Atraso)
- Lista inteligente de devedores
- Botão "WhatsApp de Cobrança" integrado
- Modelos: Por Sessão e Plano Mensal

### Prontuário Eletrônico Seguro ✅
- Criptografia AES-256-GCM ponta-a-ponta
- Auto-save com debounce (2s)
- Badge visual "🔒 Criptografia Ativa"
- Histórico de sessões na sidebar

### Site Profissional ✅
- Landing page pública `/p/[slug]`
- 5 temas de cores
- WhatsApp CTA otimizado
- SEO automático
- Editor no dashboard

### Segurança Enterprise ✅
- Row Level Security (RLS) em todas tabelas
- Multi-tenancy (isolamento de dados)
- Criptografia AES-256-GCM para prontuários
- Soft delete para auditoria

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript 5.x |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Styling** | Tailwind CSS 4 |
| **Validação** | Zod |
| **Ícones** | Lucide React |
| **Testes** | Vitest + Testing Library |

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Docker (para Supabase local)
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/andrem91/psiconuvem.git
cd psiconuvem
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase local

```bash
# Iniciar Supabase (Docker)
npx supabase start

# Aplicar migrations
npx supabase db reset
```

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com as credenciais do Supabase local:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=sua_chave_hex_64_caracteres
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

```
psiconuvem/
├── src/
│   ├── app/                     # App Router (páginas)
│   │   ├── dashboard/           # Área autenticada
│   │   │   ├── page.tsx         # Dashboard Cockpit
│   │   │   ├── pacientes/       # Pacientes + Prontuário
│   │   │   ├── agenda/          # Day View Timeline
│   │   │   ├── financeiro/      # Devedores + Cobrança
│   │   │   └── marketing/       # Editor do Site
│   │   ├── p/[slug]/            # Site público do psicólogo
│   │   ├── login/               # Login
│   │   └── registro/            # Cadastro
│   │
│   ├── components/              # Componentes reutilizáveis
│   │   ├── agenda/              # DayTimeline, AppointmentBlock
│   │   ├── clinical/            # NoteEditor, HistorySidebar
│   │   ├── financeiro/          # PaymentBadge, FinancialTabs
│   │   └── marketing/           # ProfileEditor
│   │
│   ├── lib/                     # Lógica de negócio
│   │   ├── actions/             # Server Actions
│   │   │   ├── dashboard-context.ts  # getDashboardOverview
│   │   │   ├── financial-context.ts  # getDebtorsList
│   │   │   ├── clinical-notes.ts     # Prontuário (encrypted)
│   │   │   └── professional-profile.ts
│   │   ├── utils/               # Utilidades
│   │   │   ├── time-grid.ts     # Cálculos da timeline
│   │   │   └── whatsapp.ts      # Mensagens de cobrança
│   │   └── encryption.ts        # AES-256-GCM
│   │
│   └── middleware.ts            # Proteção de rotas
│
├── supabase/
│   └── migrations/              # SQL migrations
│
└── docs-referencia/             # Documentação
    ├── ROADMAP.md               # Status do projeto
    └── MELHORIAS-FUTURAS.md     # Backlog
```

---

## 🔒 Segurança

### Criptografia de Prontuários

Os prontuários clínicos são criptografados com **AES-256-GCM** antes de serem salvos no banco de dados. A chave de criptografia é armazenada apenas no servidor via `ENCRYPTION_KEY`.

```typescript
// Formato: iv:authTag:ciphertext (hex)
const encrypted = encrypt(prontuarioContent)
const decrypted = decrypt(encrypted)
```

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS que garantem:
- Psicólogo só acessa **seus próprios dados**
- Isolamento completo entre tenants

### LGPD & CFP Compliance

- ✅ Consentimento explícito com registro de data/IP
- ✅ Soft delete (dados mantidos por 5 anos - CFP)
- ✅ Criptografia de dados sensíveis
- ✅ Validação de CRP no cadastro

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint` | Verificar linting |
| `npm test` | Rodar testes |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**André Marques**
- GitHub: [@andrem91](https://github.com/andrem91)

---

<p align="center">
  Feito com ❤️ para psicólogos brasileiros
</p>