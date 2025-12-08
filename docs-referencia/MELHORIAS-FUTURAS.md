# Melhorias Futuras - PsicoNuvem

> **Status**: Planejamento Pós-MVP
> 
> Este documento contém todas as ideias de melhorias e funcionalidades avançadas identificadas durante o desenvolvimento do MVP, organizadas por prioridade e esforço estimado.

---

## 👤 Pacientes - Melhorias Futuras

### 1. Timeline Unificada de Eventos

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (1 dia)

Visualização cronológica de todas as interações com o paciente (consultas + pagamentos + notas).

---

### 2. Sistema de Anexos/Documentos

**Prioridade**: 🟢 Baixa | **Esforço**: 🏋️ Grande (2-3 dias)

Upload e gestão de documentos do paciente (laudos, termos, encaminhamentos).

**Requisitos:**
- Integração com Supabase Storage
- Tipos permitidos: PDF, imagens
- Limite de tamanho por paciente

---

### 3. Campo de Anotações Gerais

**Prioridade**: 🟢 Baixa | **Esforço**: ⚡ Pequeno (2h)

Campo de texto livre para observações gerais sobre o paciente.

---

### 4. Busca e Filtros na Lista

**Prioridade**: 🟡 Média | **Esforço**: ⚡ Pequeno (4h)

- Busca por nome
- Filtro por modelo de pagamento
- Filtro por status LGPD
- Ordenação por nome/data

---

## 🎯 Agenda - Melhorias UX

### 0. Detalhes do Agendamento - Futuro

**Prioridade**: 🟡 Média | **Esforço**: ⚡ Pequeno a Médio

Features adicionais para página de detalhes:
- **Reagendar**: Criar novo agendamento a partir de um cancelado/não compareceu
- **Histórico de alterações**: Log de quem mudou o quê
- **Lembretes**: Enviar via WhatsApp/Email
- **Recibo PDF**: Gerar recibo da sessão

---

### 1. DayView Component (Google Calendar-like)

**Prioridade**: ✅ **IMPLEMENTADO** | **Esforço**: 🏋️ Grande (2-3 dias)

> **Status**: Implementado na Fase 4 do Refactor (07/12/2024)
> 
> Arquivos criados:
> - `src/lib/utils/time-grid.ts`
> - `src/components/agenda/DayTimeline.tsx`
> - `src/components/agenda/AppointmentBlock.tsx`
> - `src/components/agenda/DateNavigator.tsx`

---

### 1.1 Link "Marketing" no Menu Lateral

**Prioridade**: 🔥 Alta | **Esforço**: ⚡ Pequeno (30min)

Adicionar link para `/dashboard/marketing/pagina` no menu lateral do dashboard para acessar o editor do site profissional.

---

### 1.2 Popular Campos de Cache (lastAppointmentAt / nextAppointmentAt)

**Prioridade**: 🟡 Média | **Esforço**: ⚡ Pequeno (2h)

Criar trigger SQL ou job periódico para popular automaticamente os campos de cache no Patient:
- `lastAppointmentAt`: Última sessão realizada (status = COMPLETED)
- `nextAppointmentAt`: Próxima sessão agendada (status = SCHEDULED, data futura)

**Implementação sugerida:**
```sql
CREATE OR REPLACE FUNCTION update_patient_appointment_cache()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Patient" SET
    "lastAppointmentAt" = (
      SELECT MAX("scheduledAt") FROM "Appointment" 
      WHERE "patientId" = NEW."patientId" AND "status" = 'COMPLETED'
    ),
    "nextAppointmentAt" = (
      SELECT MIN("scheduledAt") FROM "Appointment" 
      WHERE "patientId" = NEW."patientId" AND "status" = 'SCHEDULED' 
      AND "scheduledAt" > NOW()
    )
  WHERE "id" = NEW."patientId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 1.3 Templates de Prontuário (SOAP, Anamnese)

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (1 dia)

Adicionar templates pré-definidos no editor de prontuário:
- **SOAP** (Subjetivo, Objetivo, Avaliação, Plano)
- **Anamnese** (primeira sessão)
- **Devolutiva** (feedback para paciente)
- **Alta** (encerramento de tratamento)

**Implementação:**
- Dropdown/botão "Usar Template" no NoteEditor
- Templates salvos em JSON ou como registros no banco

---

### 1.4 Link Agenda → Prontuário

**Prioridade**: 🔥 Alta | **Esforço**: ⚡ Pequeno (2h)

Após finalizar uma sessão na Agenda (marcar como COMPLETED), exibir botão "Escrever Prontuário" que redireciona para `/dashboard/pacientes/[id]/prontuario/nova` com contexto pré-preenchido.

---

### 1.5 CRM de Leads (Site Público)

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (1 dia)

Criar tabela `Lead` para capturar visitantes do site público que clicaram no WhatsApp:
- Origem (slug do psicólogo)
- Data/hora do clique
- Status (Novo, Contatado, Convertido, Perdido)
- Integração com dashboard para follow-up

---

#### Benefícios
- ✅ Visualização clara de horários livres/ocupados
- ✅ Criação rápida clicando nos espaços vazios
- ✅ Modal em vez de página separada (não perde contexto)
- ✅ Linha indicadora do tempo atual

#### Implementação Técnica

**Componentes Necessários:**
```
src/app/dashboard/agenda/
  _components/
    day-view.tsx           # Grid de horários com posicionamento absoluto
    agenda-client.tsx      # Estado e coordenação
    appointment-dialog.tsx # Modal para criar/editar
    mini-calendar.tsx      # Calendário lateral com marcadores
```

**Dependências:**
```bash
npm install date-fns @radix-ui/react-dialog
```

**Features:**
- Grid de 07:00 às 20:00 (configurável)
- Altura proporcional à duração do agendamento
- Cores por status (azul=agendado, verde=realizado, cinza=cancelado)
- Drag & drop para reagendar (fase 2)
- Conflito visual em vermelho

**Referência de Design**: Google Calendar Web

---

### 2. Gerador de Recibos Simples (PDF)

**Prioridade**: 🔥 Alta | **Esforço**: 🏋️ Médio (1 dia)

**Dor Resolvida**: Pacientes pedem recibo para reembolso no convênio constantemente. Psicólogos perdem tempo fazendo no Word.

**Solução**:
- Botão "Gerar Recibo" no histórico do paciente
- Template PDF simples (não é NFS-e)
- Campos: Nome, CPF, Valor, Data, Assinatura Digital

**Bibliotecas Sugeridas**:
```bash
npm install @react-pdf/renderer
# ou
npm install jspdf
```

**Template Básico**:
```
RECIBO DE PAGAMENTO

Recebi de: [Nome do Paciente]
CPF: [XXX.XXX.XXX-XX]
A quantia de: R$ [valor]
Referente a: Sessão de psicoterapia do dia [data]

[Cidade], [data por extenso]

_____________________________
[Nome do Psicólogo]
CRP: [número]
```

---

### 3. Visualização Semanal

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (1 dia)

Grid com 7 colunas (Segunda a Domingo), cada uma mostrando os agendamentos do dia.

**Features:**
- Toggle Dia/Semana/Mês
- Navegação por setas (< Semana Anterior | Próxima >)
- Indicador visual de dias com muitos agendamentos

---

### 3. Filtros Avançados

**Prioridade**: 🟢 Baixa | **Esforço**: ⚡ Pequeno (2h)

**Campos de Filtro:**
- Status (Agendado, Realizado, Cancelado, Faltou)
- Paciente (dropdown com busca)
- Tipo (Presencial, Online)
- Período (Hoje, Esta Semana, Este Mês, Customizado)

---

### 4. Integrações de Videochamada

**Prioridade**: 🔥 Alta | **Esforço**: 🏋️ Grande (3 dias)

**Opções:**
1. **Google Meet API** (requer OAuth)
2. **Whereby** (mais simples, sem instalação)
3. **Jitsi** (open-source, self-hosted)

**Implementação Sugerida:**
```typescript
// Gerar link automático ao criar consulta online
if (type === 'online') {
  meetLink = await generateMeetLink(appointmentId)
}
```

---

### 5. Notificações e Lembretes

**Prioridade**: 🔥 Alta | **Esforço**: 🏋️ Grande (2 dias)

**Canais:**
- Email (via Resend/SendGrid)
- SMS (via Twilio)
- WhatsApp (via Twilio/Meta API)

**Triggers:**
- 24h antes da consulta
- 1h antes da consulta
- Confirmação após agendamento

**Preferências do Paciente:**
```sql
ALTER TABLE "Patient" 
ADD COLUMN "notificationPreferences" JSONB DEFAULT '{"email": true, "sms": false, "whatsapp": false}';
```

---

## 📋 Pacientes - Melhorias

### 6. Campos Adicionais LGPD-Compliant

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (1 dia)

**Campos Sugeridos:**
---

## 📝 Prontuários - Melhorias Futuras

### 8. Templates de Prontuário

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (1-2 dias)

Templates pré-configurados por abordagem terapêutica:
- TCC (Terapia Cognitivo-Comportamental)
- Psicanálise
- Gestalt
- ABA (Autismo)

---

### 9. Editor Rich Text com IA

**Prioridade**: 🔥 Alta | **Esforço**: 🏋️ Grande (3 dias)

**Features:**
- Autocomplete de sintomas
- Sugestões de CID-10
- Resumo automático da sessão (IA)
- Transcrição de áudio → texto (Whisper API)

---

## 📊 Relatórios e Analytics

### 10. Dashboard Analítico

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Grande (2-3 dias)

**Métricas:**
- Taxa de no-show por paciente
- Receita mensal/anual
- Agendamentos por dia da semana
- Tempo médio de sessão
- Estatísticas de crescimento

**Ferramenta Sugerida**: Recharts ou Tremor

---

### 11. Exportação de Dados

**Prioridade**: 🟢 Baixa | **Esforço**: ⚡ Pequeno (4h)

**Formatos:**
- PDF (prontuários individuais)
- CSV (lista de pacientes)
- ICS (agenda para calendário externo)

---

## 🔐 Segurança e Compliance

### 12. Exportar Meus Dados (LGPD Portabilidade)

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (1-2 dias)

**Dor Resolvida**: Psicólogos têm medo de ficar "reféns" da plataforma. Gera confiança.

**Solução**:
- Botão "Exportar Meus Dados" em Configurações
- Gera ZIP com:
  - `pacientes.csv` - Lista de pacientes
  - `agendamentos.csv` - Histórico de agendamentos
  - `prontuarios/` - Pasta com prontuários descriptografados (TXT ou PDF)

**Implementação**:
```typescript
// Descriptografar todos os prontuários
const notes = await getAllNotes(psychologistId)
const decrypted = notes.map(note => ({
  ...note,
  content: decrypt(note.content)
}))

// Gerar ZIP
const zip = new JSZip()
zip.file('pacientes.csv', generateCSV(patients))
zip.file('agendamentos.csv', generateCSV(appointments))
notes.forEach(note => {
  zip.file(`prontuarios/${note.patientName}-${note.date}.txt`, note.content)
})

return zip.generateAsync({ type: 'blob' })
```

**Compliance LGPD**: Art. 18, Inciso V (Portabilidade de Dados)

---

### 13. Auditoria de Acessos

**Prioridade**: 🔥 Alta | **Esforço**: 🏋️ Médio (1 dia)

Registrar todos os acessos a dados sensíveis:
```sql
CREATE TABLE "AuditLog" (
  id UUID PRIMARY KEY,
  userId UUID,
  action TEXT, -- 'VIEW', 'CREATE', 'UPDATE', 'DELETE'
  resourceType TEXT, -- 'Patient', 'Appointment', 'Record'
  resourceId UUID,
  ipAddress TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 13. 2FA (Two-Factor Authentication)

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (1 dia)

Via Supabase Auth MFA (já suporta nativamente) ou TOTP (Google Authenticator).

---

### 14. Backup Automático

**Prioridade**: 🔥 Alta | **Esforço**: ⚡ Pequeno (2h)

Configurar rotina de backup do Supabase:
- Diário às 03:00
- Retenção de 30 dias
- Exportação para S3

---

## 💳 Financeiro

### 15. Gestão de Pagamentos

**Prioridade**: 🔥 Alta | **Esforço**: 🏋️ Grande (4-5 dias)

**Features:**
- Registro de pagamentos por sessão
- Emissão de recibos
- Integração com Stripe/Mercado Pago
- Controle de inadimplência

---

## 🌐 Integrações

### 16. Link Público de Agendamento

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Médio (2 dias)

Página pública `psiconuvem.com/agendar/:psychologistSlug` onde pacientes podem auto-agendar.

**Configurações:**
- Horários disponíveis
- Regras de antecedência mínima
- Confirmação manual vs automática

---

### 17. Integração com Google Calendar

**Prioridade**: 🟡 Média | **Esforço**: 🏋️ Grande (2-3 dias)

Sincronização bidirecional:
- Agendamentos no PsicoNuvem → Google Calendar
- Bloqueios no Google Calendar → PsicoNuvem

---

## 🚀 Performance

### 18. Otimizações de Performance

**Prioridade**: 🟢 Baixa | **Esforço**: 🏋️ Médio (1 dia)

**Ações:**
- Implementar paginação na lista de pacientes
- Cache de queries frequentes (React Query Offline)
- Lazy loading de imagens
- Code splitting por rota

---

### 19. PWA (Progressive Web App)

**Prioridade**: 🟢 Baixa | **Esforço**: ⚡ Pequeno (3h)

Permitir instalação como app no celular:
- Manifest JSON
- Service Worker
- Offline-first para visualização de dados já carregados

---

## 📱 Mobile

### 20. App Nativo (React Native)

**Prioridade**: 🟢 Baixa | **Esforço**: 🏋️‍♀️ Muito Grande (2-3 semanas)

App mobile nativo para iOS e Android com Expo.

---

## Priorização Sugerida (Pós-MVP)

### Sprint 1 (Semana 5-6):
1. ✅ DayView Component
2. ✅ Notificações Email
3. ✅ Auditoria de Acessos

### Sprint 2 (Semana 7-8):
4. ✅ Dashboard Analítico
5. ✅ Integração Videochamada
6. ✅ Templates de Prontuário

### Sprint 3 (Semana 9-10):
7. ✅ Gestão Financeira
8. ✅ Link Público de Agendamento
9. ✅ Backup Automático

---

## 🛡️ Dashboard Administrativo (Super Admin)

**Prioridade**: 🔥 Alta | **Esforço**: 🏋️ Grande (3-5 dias)

Painel exclusivo para administradores da plataforma com visão completa do negócio.

### Métricas Principais

| Categoria | Métrica | Descrição |
|-----------|---------|-----------|
| **Usuários** | Psicólogos cadastrados | Total e ativos no mês |
| **Usuários** | Pacientes cadastrados | Total geral na plataforma |
| **Financeiro** | MRR (Monthly Recurring Revenue) | Receita mensal recorrente |
| **Financeiro** | Ticket médio por plano | Valor médio pago |
| **Financeiro** | LTV (Lifetime Value) | Valor total por cliente |
| **Retenção** | Churn rate | % de cancelamentos/mês |
| **Engajamento** | Sessões agendadas/mês | Por psicólogo (média) |
| **Crescimento** | Novos cadastros/semana | Velocidade de aquisição |

### Funcionalidades

#### Gestão de Planos
- Criar/editar planos e preços
- Ativar/desativar planos
- Configurar período de trial

#### Sistema de Cupons
- Cupons de desconto (% ou valor fixo)
- Validade e limite de usos
- Cupons para programa de afiliados
- Relatório de uso de cupons

#### Comunicação
- Enviar avisos para todos os usuários
- Notificações de manutenção programada
- Changelog de novidades (in-app)

#### Suporte
- Lista de tickets/feedbacks recebidos
- Status de bugs reportados
- Tempo médio de resolução

### Controle de Acesso

```
Roles:
- SUPER_ADMIN: acesso total
- ADMIN: acesso a métricas e suporte
- SUPPORT: apenas tickets
```

### Estrutura de Arquivos

```
src/app/admin/
  layout.tsx              # Layout com sidebar admin
  page.tsx                # Dashboard com métricas
  planos/page.tsx         # Gestão de planos
  cupons/page.tsx         # Gestão de cupons
  usuarios/page.tsx       # Lista de psicólogos
  comunicacao/page.tsx    # Envio de avisos
  suporte/page.tsx        # Tickets e feedbacks
```

---

## Referências Técnicas

- [Google Calendar API](https://developers.google.com/calendar)
- [Whereby Embedded](https://whereby.com/information/embedded/)
- [Resend Email API](https://resend.com/docs)
- [Recharts](https://recharts.org/)
- [React Query Offline](https://tanstack.com/query/latest/docs/react/guides/offline)

