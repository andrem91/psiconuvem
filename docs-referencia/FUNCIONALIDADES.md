# 📋 PsicoNuvem - Funcionalidades

**Especificação detalhada de cada feature do MVP**

---

## 🔐 1. Autenticação

### Cadastro de Psicólogo

**Rota:** `/registro`

**Campos:**
- Nome completo (obrigatório)
- Email (obrigatório, único)
- Senha (mínimo 6 caracteres)
- CRP (obrigatório, único, validar formato)
- Telefone (obrigatório)

**Fluxo:**
1. Preenche formulário
2. Cria usuário no Supabase Auth
3. Cria registro na tabela `Psychologist`
4. Gera slug único a partir do nome
5. Define `trialEndsAt` = hoje + 30 dias
6. Redireciona para `/dashboard`

**Validações:**
- Email formato válido
- CRP formato: XX/NNNNNN
- Senha mínimo 6 caracteres
- Email e CRP únicos

---

### Login

**Rota:** `/login`

**Campos:**
- Email
- Senha

**Fluxo:**
1. Valida credenciais (Supabase Auth)
2. Cria sessão
3. Redireciona para `/dashboard`

**Extras:**
- Opção "Esqueci minha senha"
- Link para cadastro

---

### Proteção de Rotas

**Middleware:** Verifica sessão ativa

**Rotas protegidas:** `/dashboard/*`, `/pacientes/*`, `/agenda/*`, `/prontuarios/*`

**Rotas públicas:** `/`, `/login`, `/registro`, `/p/[slug]`, `/cadastro/[token]`

---

## 👥 2. Gestão de Pacientes

### Listagem

**Rota:** `/pacientes`

**Funcionalidades:**
- Lista todos os pacientes (soft delete filtrado)
- Busca por nome/telefone
- Ordenação por nome/data de cadastro
- Paginação (20 por página)

**Informações exibidas:**
- Nome
- Telefone
- Email
- Data de cadastro
- Última consulta (se houver)

---

### Cadastro Manual

**Rota:** `/pacientes/novo`

**Campos:**
- Nome (obrigatório)
- Telefone (obrigatório)
- Email (opcional)
- Data de nascimento (opcional)
- Observações gerais (opcional)

**Validações:**
- Nome mínimo 3 caracteres
- Telefone formato válido
- Email formato válido (se preenchido)

---

### Cadastro via Link ⭐ NOVA FEATURE

**Objetivo:** Facilitar cadastro - paciente preenche próprios dados

**Fluxo do Psicólogo:**
1. Acessa `/pacientes`
2. Clica em "Gerar link de cadastro"
3. Sistema gera token JWT (expira em 7 dias)
4. Copia link: `https://app.psiconuvem.com/cadastro/abc123...`
5. Envia para paciente (WhatsApp, email)

**Fluxo do Paciente:**
1. Acessa link recebido
2. Vê formulário com dados do psicólogo (nome, CRP)
3. Preenche seus dados:
   - Nome completo
   - Telefone
   - Email
   - Data de nascimento
4. Aceita termos de privacidade (checkbox obrigatório)
5. Clica "Confirmar cadastro"
6. Vê mensagem de sucesso
7. Paciente é criado vinculado ao psicólogo

**Rota:** `/cadastro/[token]` (pública)

**Token JWT contém:**
- `psychologistId`
- `expiresAt`
- `signature`

**Validações:**
- Token válido (não expirado)
- Token não usado anteriormente
- Campos obrigatórios preenchidos

**Tabela:** `PatientRegistrationToken`
- `id`: UUID
- `psychologistId`: FK
- `token`: string único
- `expiresAt`: timestamp (default: 7 dias)
- `usedAt`: timestamp (null até ser usado)
- `createdAt`: timestamp

---

### Edição

**Rota:** `/pacientes/[id]/editar`

**Campos editáveis:** Todos

**Validações:** Mesmas do cadastro

---

### Soft Delete

**Ação:** Marca `deletedAt` com timestamp atual

**Motivo:** LGPD + CFP exigem retenção mínima de 5 anos

**Comportamento:**
- Paciente some das listagens
- Dados mantidos no banco
- Pode ser reativado se necessário

---

## 📅 3. Agenda

### Listagem

**Rota:** `/agenda`

**Visualizações:**
- Dia (padrão)
- Semana

**Informações por agendamento:**
- Horário
- Paciente (nome)
- Status (badge colorido)
- Duração

---

### Criar Agendamento

**Campos:**
- Paciente (select dos cadastrados)
- Data (date picker)
- Horário (time picker)
- Duração (select: 50min, 1h, 1h30)
- Observações (opcional)

**Validações:**
- Data/hora futuras
- Sem conflito com outro agendamento
- Paciente ativo

**Ao salvar:**
- Gera link Google Meet automaticamente
- Status inicial: SCHEDULED

---

### Status de Agendamento

| Status | Descrição | Cor |
|--------|-----------|-----|
| SCHEDULED | Agendado | Azul |
| COMPLETED | Realizado | Verde |
| CANCELLED | Cancelado | Cinza |
| NO_SHOW | Não compareceu | Vermelho |

**Transições permitidas:**
- SCHEDULED → COMPLETED (marcar como realizado)
- SCHEDULED → CANCELLED (cancelar)
- SCHEDULED → NO_SHOW (paciente faltou)

---

### Integração Google Meet

**Fluxo:**
1. Ao criar agendamento, gera link no formato:
   `https://meet.google.com/xxx-xxxx-xxx`
2. Link salvo no campo `meetLink`
3. Exibido no card do agendamento
4. Botão "Iniciar consulta" abre o Meet

**Observação:** MVP usa links genéricos. Fase 2 pode integrar Google Calendar API.

---

## 💰 4. Controle Financeiro

### Modelos de Cobrança

**Configuração por Paciente:**

Cada paciente pode ter um dos dois modelos:

1. **Por Sessão (Avulso)**
   - Cada sessão tem seu próprio valor
   - Pagamento registrado individualmente
   - Ideal para: pacientes esporádicos, atendimento eventual

2. **Plano Mensal**
   - Valor fixo mensal (ex: R$ 600)
   - Dia de vencimento personalizado (1-31)
   - Quantidade de sessões incluídas (padrão: 4)
   - Ideal para: pacientes regulares, terapia contínua

**Rota:** `/pacientes/[id]/financeiro`

---

### Registrar Pagamento de Sessão

**Ação:** Marcar sessão como paga

**Campos:**
- Forma de pagamento (PIX, Dinheiro, Cartão, etc)
- Observações (opcional)

**Status de Pagamento:**
| Status | Descrição | Cor |
|--------|-----------|-----|
| PENDING | Aguardando pagamento | Amarelo |
| PAID | Pago | Verde |
| OVERDUE | Atrasado (>3 dias) | Vermelho |
| CANCELLED | Cancelado | Cinza |

---

### Faturas Mensais

**Fluxo Automático:**
1. Todo dia 1º do mês, sistema gera faturas
2. Para cada paciente com plano mensal:
   - Cria fatura com valor da mensalidade
   - Define vencimento conforme dia configurado
   - Status inicial: PENDING

**Geração Manual:**
- Botão "Gerar Faturas do Mês" em `/dashboard/financeiro`
- Útil se novos pacientes forem adicionados durante o mês

---

### Dashboard Financeiro

**Rota:** `/dashboard/financeiro`

**Cards de Resumo:**
- Sessões Avulsas: Recebido / Pendente / Atrasado
- Mensalidades: Recebido / Pendente / Atrasado
- Total Geral do Mês

**Abas:**
1. **Sessões** - Lista todas as sessões com status de pagamento
2. **Mensalidades** - Lista faturas mensais geradas

**Lista de Devedores:**
- Destaque vermelho para pagamentos atrasados
- Mostra: Paciente, Valor, Data, Dias de atraso
- Ação rápida: "Marcar como Pago"

**Filtro por Mês:**
- Dropdown para selecionar mês/ano
- Atualiza todos os cards e listas

---

### Configurações Financeiras

**Valores Padrão:**
- Valor padrão por sessão (ex: R$ 150)
- Valor padrão plano mensal (ex: R$ 600)
- Dia de vencimento padrão (ex: dia 5)
- Formas de pagamento aceitas

**Rota:** `/dashboard/financeiro/configuracoes`

---

### Server Actions Disponíveis

```typescript
// Configurar modelo de cobrança do paciente
setPatientPaymentModel(patientId, {
  paymentModel: 'MONTHLY_PLAN',
  monthlyPlanPrice: 600,
  paymentDueDay: 5,
  sessionsPerMonth: 4
})

// Gerar faturas do mês
generateMonthlyInvoices(new Date('2024-12-01'))

// Marcar sessão como paga
markSessionAsPaid(appointmentId, {
  paymentMethod: 'PIX',
  paymentNotes: 'Pago via PIX'
})

// Marcar mensalidade como paga
markMonthlyInvoiceAsPaid(invoiceId, {
  paymentMethod: 'CREDIT_CARD'
})

// Buscar resumo financeiro
getFinancialSummary(new Date()) // Mês atual

// Listar devedores
getOverduePayments()
```

---

## 📝 5. Prontuário Clínico

### Listagem por Paciente

**Rota:** `/pacientes/[id]/prontuario`

**Informações:**
- Número da sessão
- Data
- Preview do conteúdo (primeiros 100 caracteres, descriptografado)

**Ordenação:** Mais recente primeiro

---

### Criar Nota Clínica

**Campos:**
- Conteúdo (textarea, obrigatório)
- Metadados opcionais:
  - Duração da sessão
  - Tipo (individual, casal, família)
  - Modalidade (presencial, online)

**Fluxo:**
1. Psicólogo escreve nota
2. Ao salvar:
   - `sessionNumber` = último + 1
   - `content` = encrypt(texto)
   - Salva no Supabase
3. Exibe confirmação

**Criptografia:** Obrigatória (AES-256-GCM)

---

### Visualizar Nota

**Fluxo:**
1. Busca nota no Supabase
2. Descriptografa `content`
3. Exibe para o psicólogo

**Segurança:**
- Apenas o psicólogo dono pode ver
- RLS garante isolamento

---

### Compliance CFP 001/2009

**Campos obrigatórios:**
- Data da sessão (automático)
- Número da sessão (automático)
- Conteúdo (preenchido pelo psicólogo)

**Retenção:** Mínimo 5 anos (soft delete)

---

## 🌐 6. Site Público

### Perfil do Psicólogo

**Rota:** `/p/[slug]` (pública, SSG)

**Informações exibidas:**
- Nome
- CRP
- Foto (se configurada)
- Bio/Descrição
- Especialidades (tags)
- Telefone (opcional)
- Email (opcional)

**Ações:**
- Botão WhatsApp (click-to-chat)
- Botão Email (mailto:)

---

### WhatsApp Click-to-Chat

**Formato do link:**
```
https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20agendar%20uma%20consulta
```

**Configurável:** Texto inicial customizável nas configurações

---

### SEO

**Meta tags dinâmicas:**
- `title`: "Nome do Psicólogo | Psicólogo em Cidade"
- `description`: Bio resumida
- `og:image`: Foto do profissional

**Sitemap:** Gerado automaticamente com todos os slugs públicos

---

## 💳 7. Pagamentos (Asaas)

### Planos

| Plano | Preço | Limites |
|-------|-------|---------|
| Trial | R$ 0 | 30 dias, 50 pacientes, 100 agendamentos |
| Essencial | R$ 79/mês | 100 pacientes |
| Profissional | R$ 149/mês | 500 pacientes, telemedicina |
| Premium | R$ 249/mês | Ilimitado, white-label |

---

### Trial 30 Dias

**Início:** Data de cadastro

**Durante o trial:**
- Acesso a todas as funcionalidades
- Banner "X dias restantes" no dashboard
- Sem necessidade de cartão

**Após expirar:**
- Bloqueia acesso ao dashboard
- Redireciona para página de upgrade
- Dados preservados (pode acessar após pagar)

---

### Fluxo de Assinatura

1. **Criar cliente no Asaas** (no cadastro)
2. **Usuário escolhe plano** (página de upgrade)
3. **Escolhe método:**
   - PIX (instantâneo)
   - Boleto (1-2 dias úteis)
   - Cartão de crédito (instantâneo)
4. **Webhook confirma pagamento**
5. **Sistema atualiza:**
   - `plan` = plano escolhido
   - `trialEndsAt` = null

---

### Webhook Asaas

**Rota:** `/api/webhooks/asaas`

**Eventos tratados:**
- `PAYMENT_CONFIRMED`: Ativa plano
- `PAYMENT_OVERDUE`: Notifica usuário
- `SUBSCRIPTION_CANCELLED`: Reverte para trial expirado

---

## ⚙️ 8. Configurações

### Perfil Profissional

**Rota:** `/configuracoes`

**Editáveis:**
- Nome
- Telefone
- Bio/Descrição
- Foto de perfil
- Especialidades
- Slug (URL pública)

---

### Preferências

**Configurações:**
- Duração padrão de consulta
- Texto padrão WhatsApp
- Notificações por email

---

## 🔔 9. Notificações (Fase 2)

**Tipos planejados:**
- Lembrete de consulta (1 dia antes)
- Novo paciente cadastrado via link
- Pagamento confirmado
- Trial expirando (7 dias, 3 dias, 1 dia)

**Canais:**
- Email (Resend)
- WhatsApp API (Fase 2)

---

## 📊 Resumo de Rotas

### Públicas
| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Login |
| `/registro` | Cadastro |
| `/p/[slug]` | Perfil público |
| `/cadastro/[token]` | Cadastro paciente via link |

### Protegidas
| Rota | Descrição |
|------|-----------|
| `/dashboard` | Dashboard principal |
| `/pacientes` | Lista de pacientes |
| `/pacientes/novo` | Novo paciente |
| `/pacientes/[id]` | Detalhes do paciente |
| `/pacientes/[id]/editar` | Editar paciente |
| `/pacientes/[id]/prontuario` | Prontuário do paciente |
| `/pacientes/[id]/financeiro` | Configuração financeira do paciente |
| `/agenda` | Agenda de consultas |
| `/financeiro` | Dashboard financeiro |
| `/financeiro/configuracoes` | Configurações financeiras |
| `/configuracoes` | Configurações |

### API
| Rota | Descrição |
|------|-----------|
| `/api/webhooks/asaas` | Webhook pagamentos |
| `/auth/callback` | Callback OAuth |

---

**Versão:** 8.0  
**Atualizado:** Dezembro 2025
