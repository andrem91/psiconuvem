-- ============================================
-- CONTROLE FINANCEIRO DE RECEBIMENTOS
-- Criado: 2024-12-05
-- Descrição: Adiciona controle de pagamentos por sessão e plano mensal
-- ============================================

-- ============================================
-- 1. CAMPOS FINANCEIROS EM APPOINTMENT
-- ============================================

ALTER TABLE "Appointment"
ADD COLUMN "sessionPrice" DECIMAL(10,2),
ADD COLUMN "paymentStatus" TEXT DEFAULT 'PENDING' CHECK (
  "paymentStatus" IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')
),
ADD COLUMN "paymentDate" TIMESTAMPTZ,
ADD COLUMN "paymentMethod" TEXT CHECK (
  "paymentMethod" IN ('CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER')
),
ADD COLUMN "paymentNotes" TEXT;

-- ============================================
-- 2. MODELO DE COBRANÇA POR PACIENTE
-- ============================================

ALTER TABLE "Patient"
ADD COLUMN "paymentModel" TEXT DEFAULT 'PER_SESSION' CHECK (
  "paymentModel" IN ('PER_SESSION', 'MONTHLY_PLAN')
),
ADD COLUMN "monthlyPlanPrice" DECIMAL(10,2),
ADD COLUMN "paymentDueDay" INTEGER CHECK ("paymentDueDay" BETWEEN 1 AND 31),
ADD COLUMN "sessionsPerMonth" INTEGER DEFAULT 4,
ADD COLUMN "financialNotes" TEXT;

-- ============================================
-- 3. TABELA DE MENSALIDADES
-- ============================================

CREATE TABLE "MonthlyInvoice" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "psychologistId" TEXT NOT NULL REFERENCES "Psychologist"("id") ON DELETE CASCADE,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "referenceMonth" DATE NOT NULL, -- Ex: 2024-12-01 (sempre primeiro dia do mês)
  "amount" DECIMAL(10,2) NOT NULL,
  "dueDate" DATE NOT NULL,
  "status" TEXT DEFAULT 'PENDING' CHECK (
    "status" IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')
  ),
  "paidAt" TIMESTAMPTZ,
  "paymentMethod" TEXT CHECK (
    "paymentMethod" IN ('CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER')
  ),
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  
  CONSTRAINT "unique_monthly_invoice" UNIQUE ("patientId", "referenceMonth")
);

-- ============================================
-- 4. CONFIGURAÇÕES FINANCEIRAS DO PSICÓLOGO
-- ============================================

CREATE TABLE "FinancialSettings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "psychologistId" TEXT NOT NULL REFERENCES "Psychologist"("id") ON DELETE CASCADE UNIQUE,
  "defaultSessionPrice" DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  "defaultMonthlyPrice" DECIMAL(10,2) DEFAULT 600.00,
  "defaultPaymentDueDay" INTEGER DEFAULT 5 CHECK ("defaultPaymentDueDay" BETWEEN 1 AND 31),
  "currency" TEXT DEFAULT 'BRL',
  "acceptedPaymentMethods" TEXT[] DEFAULT ARRAY['CASH', 'PIX'],
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- FinancialSettings
ALTER TABLE "FinancialSettings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psicólogos podem ver suas próprias configurações"
  ON "FinancialSettings" FOR SELECT
  USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem inserir suas próprias configurações"
  ON "FinancialSettings" FOR INSERT
  WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem atualizar suas próprias configurações"
  ON "FinancialSettings" FOR UPDATE
  USING ("psychologistId" = get_current_psychologist_id());

-- MonthlyInvoice
ALTER TABLE "MonthlyInvoice" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psicólogos podem ver suas próprias faturas"
  ON "MonthlyInvoice" FOR SELECT
  USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem criar suas próprias faturas"
  ON "MonthlyInvoice" FOR INSERT
  WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem atualizar suas próprias faturas"
  ON "MonthlyInvoice" FOR UPDATE
  USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem deletar suas próprias faturas"
  ON "MonthlyInvoice" FOR DELETE
  USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 6. ÍNDICES DE PERFORMANCE
-- ============================================

-- Buscar agendamentos por status de pagamento
CREATE INDEX idx_appointment_payment_status 
  ON "Appointment"("psychologistId", "paymentStatus") 
  WHERE "deletedAt" IS NULL;

-- Buscar agendamentos por data de pagamento
CREATE INDEX idx_appointment_payment_date 
  ON "Appointment"("psychologistId", "paymentDate") 
  WHERE "deletedAt" IS NULL;

-- Buscar faturas pendentes
CREATE INDEX idx_monthly_invoice_status
  ON "MonthlyInvoice"("psychologistId", "status")
  WHERE "deletedAt" IS NULL;

-- Buscar faturas vencidas (para auto-detecção)
CREATE INDEX idx_monthly_invoice_due_date
  ON "MonthlyInvoice"("dueDate")
  WHERE "deletedAt" IS NULL AND "status" != 'PAID';

-- Buscar pacientes por modelo de cobrança
CREATE INDEX idx_patient_payment_model
  ON "Patient"("psychologistId", "paymentModel")
  WHERE "deletedAt" IS NULL;

-- ============================================
-- 7. COMENTÁRIOS (Documentação)
-- ============================================

COMMENT ON COLUMN "Appointment"."sessionPrice" IS 'Valor cobrado por esta sessão específica';
COMMENT ON COLUMN "Appointment"."paymentStatus" IS 'Status do pagamento: PENDING, PAID, OVERDUE, CANCELLED';
COMMENT ON COLUMN "Appointment"."paymentDate" IS 'Data em que o pagamento foi recebido';
COMMENT ON COLUMN "Appointment"."paymentMethod" IS 'Forma de pagamento utilizada';

COMMENT ON COLUMN "Patient"."paymentModel" IS 'Modelo de cobrança: PER_SESSION (avulso) ou MONTHLY_PLAN (mensalidade)';
COMMENT ON COLUMN "Patient"."monthlyPlanPrice" IS 'Valor da mensalidade se paymentModel = MONTHLY_PLAN';
COMMENT ON COLUMN "Patient"."paymentDueDay" IS 'Dia do mês para vencimento (1-31)';
COMMENT ON COLUMN "Patient"."sessionsPerMonth" IS 'Quantidade de sessões incluídas no plano mensal';

COMMENT ON TABLE "MonthlyInvoice" IS 'Faturas mensais geradas para pacientes com plano mensal';
COMMENT ON COLUMN "MonthlyInvoice"."referenceMonth" IS 'Mês de referência da fatura (sempre dia 1)';
COMMENT ON COLUMN "MonthlyInvoice"."dueDate" IS 'Data de vencimento da fatura';
