-- ============================================
-- CONTROLE DE PLANO MENSAL
-- Criado: 2024-12-06
-- Descrição: Adiciona data de início do plano para controle manual
-- ============================================

ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "planStartDate" DATE;

COMMENT ON COLUMN "Patient"."planStartDate" IS 'Data de início do plano mensal - faturas só são geradas a partir desta data';
