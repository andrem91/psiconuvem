# 📅 PsicoNuvem - Roadmap MVP Integrado

**Estratégia:** "Do Caos à Ordem" | Foco em Fluxos Integrados | UX Sistêmica

> **✅ REFATORAÇÃO CONCLUÍDA (08/12/2024):**
> O projeto evoluiu de "Módulos Isolados" para uma **Plataforma Integrada** ("PsicoNuvem OS").
> Todas as 6 fases do refactor foram implementadas com sucesso.
>
> **Nota de Ambiente**: Todo o desenvolvimento é feito em **Supabase Local (Docker)**.

---

## 🎯 Filosofia

> **"Não basta ter a feature. Tem que ter o flow."**

- **Dashboard Cockpit**: O centro de comando, não apenas um resumo.
- **Auto-pilot**: O sistema sugere ações (cobrar, escrever, agendar).
- **Flywheel**: Site -> Agenda -> Prontuário -> Financeiro -> Site.

---

## ✅ Progresso Realizado

### Fundação Inicial (Concluído)
- [x] Setup Next.js 16 + Supabase + Auth
- [x] Multi-tenancy (RLS)
- [x] CRUD básico de Pacientes
- [x] CRUD básico de Agendamentos (Lista)
- [x] Financeiro "Contábil" (Tabelas e Lançamentos)

### Refatoração PsicoNuvem OS (Concluído - 07-08/12/2024)

#### Fase 1: Fundação de Dados ✅
- [x] Migração SQL: PatientStatus enum, ProfessionalProfile table
- [x] Campos lastAppointmentAt, nextAppointmentAt em Patient
- [x] Link appointmentId em FinancialRecord

#### Fase 2: Dashboard Unificado ✅
- [x] Server Action `getDashboardOverview()`
- [x] Home com Stats Cards, Action Center, Timeline do Dia

#### Fase 3: Conector Financeiro ✅
- [x] Lista de Devedores (Patient-Centric)
- [x] Health Cards (Recebido, Pendente, Atrasado)
- [x] Botão "WhatsApp de Cobrança" integrado

#### Fase 4: Conector Agenda ✅
- [x] Day View (Timeline 07:00-22:00)
- [x] Blocos coloridos por status
- [x] Linha do "agora" em tempo real
- [x] Navegação Ontem/Hoje/Amanhã

#### Fase 5: Prontuário Seguro ✅
- [x] Criptografia AES-256-GCM
- [x] Editor com auto-save (debounce 2s)
- [x] Badge de segurança visual
- [x] Histórico lateral de sessões

#### Fase 6: Site Profissional ✅
- [x] Rota pública `/p/[slug]`
- [x] Landing page com Hero, Bio, Especialidades
- [x] WhatsApp CTA otimizado
- [x] 5 temas de cores
- [x] SEO automático via generateMetadata()
- [x] Editor de perfil no dashboard

---

## 🚀 Próximas Melhorias (Pós-Refactor)

### Prioridade Alta
- [ ] Link "Marketing" no menu lateral
- [ ] Link Agenda → Prontuário (após COMPLETED)
- [ ] Recibos PDF para sessões

### Prioridade Média
- [ ] Popular campos de cache via Trigger SQL
- [ ] Templates de prontuário (SOAP, Anamnese)
- [ ] CRM de Leads do site público
- [ ] Visualização semanal da Agenda

### Prioridade Baixa
- [ ] Dashboard analítico com gráficos
- [ ] Integração Google Calendar
- [ ] PWA para mobile

---

## 📊 Métricas de Sucesso (Alcançadas)

| Métrica | Meta | Status |
|---------|------|--------|
| Tempo para Cobrar | < 5 seg (2 cliques) | ✅ WhatsApp 1-click |
| Tempo para Prontuário | < 10 seg | ✅ Acesso direto |
| Zero Dados Perdidos | 100% | ✅ AES-256 + Auto-save |

---

## 🔗 Design System

- **Cores**: Indigo (Ação), Slate (Texto), Rose (Débito), Emerald (Sucesso)
- **Ícones**: Lucide React
- **Componentes**: Shadcn/UI

---

**Status:** ✅ Plataforma Integrada Operacional!
