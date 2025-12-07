-- ============================================
-- CONTROLE FINANCEIRO MANUAL
-- Criado: 2024-12-06
-- Descrição: Adiciona tabela FinancialRecord para lançamentos manuais
-- ============================================

-- ============================================
-- 1. TABELA DE LANÇAMENTOS FINANCEIROS
-- ============================================

CREATE TABLE "FinancialRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "psychologistId" TEXT NOT NULL REFERENCES "Psychologist"("id") ON DELETE CASCADE,
  "patientId" TEXT REFERENCES "Patient"("id") ON DELETE SET NULL,
  
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('INCOME', 'EXPENSE')),
  "category" TEXT NOT NULL CHECK ("category" IN ('SESSION', 'MONTHLY', 'OTHER')),
  "amount" DECIMAL(10,2) NOT NULL,
  "date" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'PAID', 'OVERDUE')),
  
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

-- ============================================
-- 2. RLS POLICIES
-- ============================================

ALTER TABLE "FinancialRecord" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psicólogos podem ver seus próprios lançamentos"
  ON "FinancialRecord" FOR SELECT
  USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem inserir seus próprios lançamentos"
  ON "FinancialRecord" FOR INSERT
  WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem atualizar seus próprios lançamentos"
  ON "FinancialRecord" FOR UPDATE
  USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem deletar seus próprios lançamentos"
  ON "FinancialRecord" FOR DELETE
  USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 3. ÍNDICES DE PERFORMANCE
-- ============================================

-- Buscar lançamentos por mês/data
CREATE INDEX idx_financial_record_date
  ON "FinancialRecord"("psychologistId", "date")
  WHERE "deletedAt" IS NULL;

-- Buscar lançamentos por paciente
CREATE INDEX idx_financial_record_patient
  ON "FinancialRecord"("psychologistId", "patientId")
  WHERE "deletedAt" IS NULL;

-- ============================================
-- 4. COMENTÁRIOS
-- ============================================

COMMENT ON TABLE "FinancialRecord" IS 'Tabela unificada para lançamentos financeiros manuais (receitas e despesas)';
COMMENT ON COLUMN "FinancialRecord"."type" IS 'INCOME (Receita) ou EXPENSE (Despesa)';
COMMENT ON COLUMN "FinancialRecord"."category" IS 'Categoria do lançamento: SESSION, MONTHLY, OTHER';
