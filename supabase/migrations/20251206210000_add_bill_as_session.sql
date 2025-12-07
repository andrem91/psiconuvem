-- ============================================
-- SESSÃO AVULSA PARA MENSALISTAS
-- Criado: 2024-12-06
-- Descrição: Adiciona coluna billAsSession para permitir cobrança 
--            de sessões extras para pacientes com plano mensal
-- ============================================

ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "billAsSession" BOOLEAN DEFAULT false;

COMMENT ON COLUMN "Appointment"."billAsSession" IS 'Quando true, cobra essa sessão separadamente mesmo para pacientes mensalistas';
