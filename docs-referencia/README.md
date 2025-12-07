# 🧠 PsicoNuvem

**SaaS de Gestão Clínica + Presença Digital para Psicólogos no Brasil**

---

## 🎯 Missão

Criar plataforma profissional de gestão clínica para **547 mil psicólogos brasileiros**, com foco em simplicidade, segurança e conformidade regulatória.

**Value Proposition:** "Seu consultório completo na nuvem: gestão profissional + site próprio + telepsicologia"

---

## 📊 Stack Técnica

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| **Framework** | Next.js 15+ (App Router) | Full-stack React |
| **Language** | TypeScript 5.x | Type safety total |
| **UI** | Tailwind CSS + shadcn/ui | Componentes + styling |
| **Database** | PostgreSQL (Supabase) | Banco + Auth + Storage + Realtime |
| **Auth** | Supabase Auth | Login/signup integrado |
| **Payments** | Asaas | Assinaturas + PIX + Boleto |
| **Hosting** | Vercel | Deploy gratuito |
| **Email** | Resend | Transacionais |

**Custo inicial:** R$ 0 (tiers gratuitos)

---

## 🔐 Segurança

A segurança é prioridade máxima dado o tipo de dados tratados.

### Principais Medidas

- **Row Level Security (RLS):** Isolamento database-level por psicólogo
- **Criptografia AES-256-GCM:** Prontuários clínicos criptografados em repouso
- **Multi-tenancy nativo:** Impossível vazar dados entre contas
- **LGPD compliance:** Dados sensíveis tratados conforme legislação
- **CFP compliance:** Prontuário conforme CFP 001/2009

### Regulamentações Atendidas

| Regulamentação | Requisito | Status |
|----------------|-----------|--------|
| **LGPD** | Dados de saúde = sensíveis | ✅ Criptografia + consentimento |
| **CFP 001/2009** | Prontuário obrigatório 5 anos | ✅ Soft delete + retenção |
| **CFP 09/2024** | Telepsicologia criptografada | ✅ Google Meet E2E |

---

## 🚀 Funcionalidades MVP

### Essenciais (Fase 1)

| Feature | Descrição | Prioridade |
|---------|-----------|------------|
| **Multi-tenancy + Auth** | Cadastro/login com isolamento total | CRÍTICO |
| **CRUD Pacientes** | Cadastro, edição, soft delete | ALTO |
| **Link de Cadastro** | Paciente preenche próprios dados via link | ALTO |
| **Agenda Manual** | Agendamentos com status | ALTO |
| **Prontuário** | Notas clínicas criptografadas | ALTO |
| **Site Público Básico** | Perfil `/p/[slug]` do psicólogo | ALTO |
| **WhatsApp Click-to-Chat** | Botão para contato | MÉDIO |
| **Google Meet Links** | Integração para teleconsultas | ALTO |
| **Trial 30 dias** | Período de teste sem cartão | ALTO |
| **Pagamentos Asaas** | Assinaturas PIX/Boleto/Cartão | ALTO |

### Excluídas do MVP (Fase 2+)

- Agenda pública automática
- Blog integrado
- Múltiplos temas de site
- NFS-e automático
- WhatsApp API oficial
- Vídeo chamada própria (LiveKit)
- Apps mobile

---

## 📁 Estrutura de Documentação

Esta documentação está organizada em **5 arquivos**:

| Arquivo | Conteúdo | Quando Usar |
|---------|----------|-------------|
| **README.md** | Visão geral, stack, segurança | Primeiro contato |
| **ROADMAP.md** | Cronograma de desenvolvimento | Planejamento diário |
| **ARQUITETURA.md** | Detalhes técnicos e padrões | Implementação |
| **FUNCIONALIDADES.md** | Especificação de features | Desenvolvimento |
| **NEGOCIO.md** | Modelo de negócio e métricas | Estratégia |

---

## ⚡ Quick Start

```bash
# 1. Clonar repositório
git clone https://github.com/andrem91/psiconuvem.git
cd psiconuvem

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env.local
# Editar variáveis conforme necessário

# 4. Iniciar Supabase local
npx supabase start

# 5. Gerar tipos TypeScript
npx supabase gen types typescript --local > src/types/supabase.ts

# 6. Rodar aplicação
npm run dev
```

**Acesse:** http://localhost:3000

**Supabase Studio:** http://localhost:54323

---

## 📞 Links Úteis

- **Repositório:** https://github.com/andrem91/psiconuvem
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com

---

## 🎯 Filosofia

> **"Lançar em 6-8 semanas > Produto perfeito em 14 semanas"**

- ✅ Validar se psicólogos pagariam
- ✅ Aprender com feedback real
- ✅ Qualidade não atrasa, acelera
- ✅ Segurança desde o dia 1

---

**Versão:** 8.0 (Supabase)  
**Data:** Dezembro 2025  
**Status:** 🚀 Em Desenvolvimento
