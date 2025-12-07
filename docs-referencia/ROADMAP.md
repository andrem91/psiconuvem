# 📅 PsicoNuvem - Roadmap MVP

**Estratégia:** Aprender fazendo | 6-8 semanas | Deploy incremental

---

## 🎯 Filosofia

> **"Lançar em 8 semanas > Produto perfeito em 14 semanas"**

- Validar se psicólogos pagariam
- Aprender com feedback real
- Deploy gratuito inicial
- Segurança desde o dia 1

---

## ✅ Progresso Atual

### Concluído ✅

**Semanas 1-2: Fundação**
- [x] Setup Next.js 16 + TypeScript + Tailwind
- [x] Supabase configurado (Auth + Database + RLS)
- [x] Multi-tenancy com Row Level Security
- [x] Função SQL `get_current_psychologist_id()` otimizada
- [x] Autenticação completa (registro, login, logout, confirmação email)
- [x] Middleware de proteção de rotas
- [x] Dashboard base com estatísticas
- [x] ESLint + Prettier + Husky (git hooks)
- [x] Conventional Commits configurado

**CRUD Pacientes**
- [x] Schema com soft delete (`deletedAt`)
- [x] Criar, listar, editar, deletar (soft)
- [x] Validação robusta com Zod (birthdate, phone, email)
- [x] Consentimento LGPD com IP tracking
- [x] Criptografia AES-256-GCM para dados sensíveis
- [x] Rate limiting (10 criações/minuto)

**CRUD Agendamentos**
- [x] Schema `Appointment` com `TIMESTAMPTZ`
- [x] Soft delete (`deletedAt`) para auditoria
- [x] Listagem com estatísticas do dia
- [x] Formulário de criação com validação Zod
- [x] Status: `SCHEDULED` → `COMPLETED` → `CANCELLED` → `NO_SHOW`
- [x] Detecção de conflitos (função SQL otimizada)
- [x] Timezone handling correto (UTC no banco, local no front)
- [x] Geração automática de link Google Meet (consultas online)
- [x] Consentimento telepsicologia (CFP 09/2024)
- [x] Validação de data futura com tolerância de 5min
- [x] Utils de formatação: `formatDate()`, `formatTime()`, `parseUTCDate()`
- [x] Componente `AppointmentStatusBadge` reutilizável

**Qualidade de Código**
- [x] Testes unitários configurados (Vitest)
- [x] Type-check sem erros
- [x] Lint sem warnings críticos
- [x] Auditoria de código completa (8 melhorias implementadas)

**Conceitos Aplicados:**
- App Router, Server Components, Server Actions
- Supabase Client (Server-side)
- RLS (Row Level Security)
- Soft Delete Pattern
- Rate Limiting
- Timezone Handling (UTC ↔ Local)

---

### Concluído ✅

**Semana 3-4: Controle Financeiro** ✅
- [x] Schema financeiro completo (4 tabelas)
- [x] Server Actions financeiras (8 funções)
- [x] Modelos de cobrança (por sessão + plano mensal)
- [x] Geração automática de faturas
- [x] Resumo financeiro e lista de devedores
- [x] Dashboard Financeiro UI
- [x] Navegação por mês
- [x] CRUD de lançamentos (receitas/despesas)
- [x] Sessão avulsa para mensalistas
- [x] Controle manual de plano (planStartDate)

**Semana 3-4: Melhorias UX** ✅
- [x] Página de detalhes do paciente (cards, históricos, ações)
- [x] Página de detalhes do agendamento (ações, edição)
- [x] Badge de pagamento na agenda
- [x] Configuração de modelo de cobrança no paciente

### Em Progresso ⏳

**Semana 5: Prontuários Clínicos** 🔄
- [ ] Prontuários Clínicos
- [ ] Criptografia AES-256-GCM obrigatória
- [ ] Compliance CFP 001/2009 (5 anos de retenção)

---

## 📆 Cronograma Restante

### Semana 3.5: Controle Financeiro ✅ (Completo!)

**Backend** ✅
- [x] Migration: Campos financeiros em Appointment
- [x] Migration: Campos de cobrança em Patient (paymentModel, monthlyPlanPrice, etc)
- [x] Migration: Tabela MonthlyInvoice
- [x] Migration: Tabela FinancialSettings
- [x] Migration: Tabela FinancialRecord (lançamentos manuais)
- [x] Migration: billAsSession (sessão avulsa)
- [x] Migration: planStartDate (controle de plano)
- [x] Server Actions completas (8+ funções)

**Frontend** ✅
- [x] Página `/dashboard/financeiro`
- [x] Cards de resumo (sessões + mensalidades + total)
- [x] Abas: Sessões | Mensalidades | Extrato
- [x] Lista de devedores
- [x] Navegação por mês
- [x] Modal "Marcar como Pago"
- [x] CRUD de lançamentos (receitas/despesas)

**Integrações** ✅
- [x] Badge de status de pagamento na agenda
- [x] Configuração de modelo de cobrança no paciente
- [x] Botão gerar fatura no perfil do paciente

**Entregas:**
- ✅ Backend completo (DB + Server Actions)
- ✅ Dashboard financeiro funcional
- ✅ Controle de recebimentos por sessão/mensal

---

### Semana 3-4: Prontuário Clínico

**Dia 14-15:**
- [ ] Schema `ClinicalNote`:
  ```sql
  - id (UUID)
  - patientId (UUID, FK)
  - psychologistId (UUID, FK)
  - appointmentId (UUID, FK, nullable)
  - content (TEXT, AES-256-GCM encrypted)
  - createdAt (TIMESTAMPTZ)
  - updatedAt (TIMESTAMPTZ)
  - deletedAt (TIMESTAMPTZ, nullable)
  ```
- [ ] **Adicionar controle financeiro em Appointment**: 🆕
  ```sql
  ALTER TABLE "Appointment"
  ADD COLUMN "sessionPrice" DECIMAL(10,2),
  ADD COLUMN "isPaid" BOOLEAN DEFAULT false;
  ```
- [ ] Server Actions: `createNote`, `updateNote`, `getNotes`, `deleteNote`
- [ ] Editor de notas (textarea com autosave)
- [ ] Listagem por paciente
- [ ] Badge visual "Pagamento Pendente" nos agendamentos não pagos
- [ ] Criptografia antes de salvar, descriptografia ao exibir

**Dia 16-17: Testes e Refinamento**
- [ ] Testes de criptografia/descriptografia
- [ ] Validação de performance
- [ ] UX refinamento

**Entregas:**
- ✅ Prontuário funcionando
- ✅ Dados sensíveis protegidos (AES-256-GCM)
- ✅ Compliance CFP 001/2009

---

### Semana 4: Site Público + Link de Cadastro

**Dia 18-19: Perfil Público**
- [ ] Schema `ProfessionalProfile`:
  ```sql
  - psychologistId (UUID, FK)
  - slug (TEXT, unique)
  - bio (TEXT)
  - photo (TEXT, URL)
  - specialties (TEXT[])
  - acceptsOnline (BOOLEAN)
  - acceptsInPerson (BOOLEAN)
  ```
- [ ] Rota pública `/p/[slug]` (SSG - Static Site Generation)
- [ ] Design responsivo
- [ ] Meta tags SEO (title, description, OG)
- [ ] **Footer com "Powered by PsicoNuvem" + UTM tracking** 🆕
  ```tsx
  ?utm_source=site&utm_medium=footer&utm_campaign=psi_{slug}
  ```

**Dia 19: WhatsApp Integration**
- [ ] Botão WhatsApp click-to-chat
- [ ] Formatação de mensagem template
- [ ] Deep link para aplicativo

**Dia 20-21: Link de Cadastro do Paciente** ⭐
- [ ] Página `/cadastro/[token]` pública
- [ ] Geração de token JWT (expira em 7 dias)
- [ ] Formulário público com validação
- [ ] Consentimento LGPD obrigatório
- [ ] Dados salvos vinculados ao psicólogo
- [ ] Email de confirmação (opcional)

**Entregas:**
- ✅ Site público do psicólogo
- ✅ Integração WhatsApp
- ✅ Sistema de auto-cadastro de pacientes

---

### Semana 5: Pagamentos + Trial

**Dia 22-24: Integração Asaas (Gateway de Pagamento)**
- [ ] Configurar conta Asaas (sandbox → produção)
- [ ] Criar cliente no Asaas
- [ ] Criar assinatura:
  - PIX (instantâneo)
  - Boleto (D+2)
  - Cartão de Crédito
- [ ] Configurar webhook (`/api/webhooks/asaas`)
- [ ] Processar eventos:
  - `PAYMENT_RECEIVED` → ativar psicólogo
  - `PAYMENT_OVERDUE` → bloquear acesso
  - `PAYMENT_REFUNDED` → pausar conta
- [ ] Atualizar status do psicólogo

**Dia 25-26: Sistema de Trial (30 dias)**
- [ ] Campo `trialEndsAt` em `Psychologist`
- [ ] Middleware verifica trial ativo
- [ ] Banner "X dias restantes" no dashboard
- [ ] Bloqueio suave após trial expirado
- [ ] Página `/upgrade` com planos
- [ ] Email 7 dias antes do fim do trial

**Entregas:**
- ✅ Pagamentos funcionando (3 métodos)
- ✅ Sistema de trial completo
- ✅ Webhook processando eventos

---

### Semana 6: Polimento e UX

**Dia 27-28: UX + Estados**
- [ ] Loading states (skeletons)
- [ ] Error boundaries globais
- [ ] Toast notifications (sucesso, erro, info)
- [ ] Responsividade mobile (todos os breakpoints)
- [ ] Acessibilidade (ARIA labels, contraste)
- [ ] Empty states (listas vazias, "Sem pacientes cadastrados")
- [ ] **Onboarding Checklist "Zero to One"** 🆕
  ```tsx
  - ✅ Complete seu perfil
  - 📝 Cadastre seu primeiro paciente  
  - 📅 Crie um agendamento
  ```

> ⚠️ **Alerta Crítico**: A Semana 6 (Polimento) historicamente consome 80% do tempo previsto devido aos "detalhes" (telas vazias, mensagens de erro, loadings). **Mantenha o escopo rigidamente fechado aqui.**

**Dia 29-30: SEO + Performance**
- [ ] Metadata dinâmico (Next.js Metadata API)
- [ ] Sitemap automático (`/sitemap.xml`)
- [ ] `robots.txt`
- [ ] Image optimization (next/image)
- [ ] Lazy loading de componentes pesados
- [ ] Code splitting por rota
- [ ] Análise Lighthouse (> 90 Performance)
- [ ] Otimização de queries Supabase

**Entregas:**
- ✅ UX profissional
- ✅ SEO otimizado
- ✅ Performance > 90 Lighthouse
- ✅ Acessibilidade nível AA

---

### Semana 7: Deploy + Preparação Beta

**Dia 31-32: Deploy Vercel (Produção)**
- [ ] Conectar GitHub ao Vercel
- [ ] Configurar environment variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ENCRYPTION_KEY
  ASAAS_API_KEY
  ```
- [ ] Deploy de produção
- [ ] Domínio customizado (psiconuvem.com)
- [ ] HTTPS automático (Vercel)
- [ ] Configurar DNS

**Dia 33: Preparação Beta**
- [ ] Criar landing page beta (/beta)
- [ ] Formulário de inscrição
- [ ] Checklist de onboarding
- [ ] Materiais de suporte (FAQ, tutoriais)
- [ ] Email de boas-vindas

**Entregas:**
- ✅ Aplicação em produção
- ✅ Domínio configurado
- ✅ Infraestrutura pronta para beta

---

### Semana 8: Beta Testing + Feedback

**Dia 34-35: Onboarding Beta Testers**
- [ ] Recrutar 5 psicólogos (rede pessoal, LinkedIn)
- [ ] Onboarding 1-a-1 (videochamada)
- [ ] Ativação de trial extendido (60 dias)
- [ ] Criar canal de suporte (WhatsApp group)

**Dia 36-38: Coleta de Feedback**
- [ ] Survey semanal (NPS, CSAT)
- [ ] Acompanhamento de métricas:
  - Tempo médio de uso
  - Features mais usadas
  - Pontos de abandono
- [ ] Identificar bugs críticos
- [ ] Priorizar correções

**Dia 39-40: Iteração Rápida**
- [ ] Corrigir bugs críticos
- [ ] Ajustes de UX baseados em feedback
- [ ] Refinar onboarding
- [ ] Preparar roadmap Fase 2

**Entregas:**
- ✅ 5 beta testers ativos
- ✅ Feedback estruturado coletado
- ✅ Bugs críticos corrigidos
- ✅ NPS inicial medido

---

## 📊 Métricas de Sucesso MVP

| Métrica | Meta | Status |
|---------|------|--------|
| Beta Testers Ativos | 5 psicólogos | ⏳ Não iniciado |
| Uso Semanal | 3+ agendamentos/usuário | ⏳ Não iniciado |
| NPS (Net Promoter Score) | > 30 | ⏳ Não iniciado |
| Bugs Críticos | 0 | ✅ **Atingido** |
| Taxa Trial → Paid | > 20% | ⏳ Não iniciado |
| Test Coverage | > 60% | 🔄 Parcial (~30%) |
| Linting Errors | 0 | ✅ **Atingido** |
| Performance (Lighthouse) | > 85 | 🔄 Parcial |

---

## 🚀 Fases Futuras (Pós-MVP)

> **📘 Veja detalhes completos em**: [MELHORIAS-FUTURAS.md](./MELHORIAS-FUTURAS.md)

### Fase 2 (Meses 2-3): Product-Market Fit
- 100 usuários pagantes
- **DayView Component** (Google Calendar-like) 🔥
- **Notificações** Email/SMS/WhatsApp 🔥
- **Dashboard Analítico** com métricas 📊
- WhatsApp API oficial (automação)
- Blog integrado (MDX + SEO)
- Múltiplos temas de site
- Relatórios básicos (PDF export)

### Fase 3 (Meses 6-12): Escala
- 1.000+ usuários
- **Portal do Paciente** (agendamento online)
- Integração convênios (TISS)
- **IA**: resumo de sessões, transcrição de áudio
- Apps mobile (React Native + Expo)
- Auditoria de acessos (LGPD compliance)
- Gestão financeira completa

---

## 📋 Checklist Diário

### ☀️ Manhã
- [ ] `git pull origin main`
- [ ] `npx supabase start`
- [ ] `npm run dev`
- [ ] Revisar notificações do Vercel/Supabase

### 💻 Durante
- [ ] TypeScript sem erros (`npm run type-check`)
- [ ] Lint sem warnings (`npm run lint`)
- [ ] Testar manualmente cada feature
- [ ] Commit frequente (conventional commits)
  - `feat:`, `fix:`, `refactor:`, `docs:`, `test:`

### 📝 Antes de Parar
- [ ] Push para branch de feature
- [ ] Criar/atualizar PR se necessário
- [ ] Atualizar este roadmap
- [ ] Documentar descobertas/decisões

---

## 🔗 Recursos Essenciais

### Documentação Oficial
- **Next.js 16:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Supabase + Next.js:** https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **shadcn/ui:** https://ui.shadcn.com
- **Zod:** https://zod.dev
- **Vitest:** https://vitest.dev

### CFP (Conselho Federal de Psicologia)
- **Resolução CFP 001/2009** - Prontuários Psicológicos
- **Resolução CFP 09/2024** - Telepsicologia

### Projeto
- **Repositório:** https://github.com/andrem91/psiconuvem
- **Dashboard Vercel:** (em breve)
- **Supabase Dashboard:** (configurado localmente)

---

## 🎓 Aprendizados e Decisões

### Arquiteturais
- **Why Supabase?** Auth + DB + RLS out-of-the-box
- **Why Server Components?** SEO + Performance
- **Why Zod?** Type-safe validation (runtime + compile-time)
- **Why AES-256-GCM?** Authenticated encryption (LGPD compliance)

### Patterns Implementados
- ✅ Soft Delete (auditoria)
- ✅ Optimistic UI (melhor UX)
- ✅ Server Actions (menos boilerplate)
- ✅ RLS (security by default)
- ✅ Rate Limiting (proteção anti-spam)

---

**Versão:** 10.0 (Agenda Concluída + Sistema de Qualidade)  
**Atualizado:** 5 de Dezembro de 2025  
**Status:** 🚀 Semana 3 - Prontuários Clínicos (Próximo)  
**Progresso MVP:** ~60% ✅
