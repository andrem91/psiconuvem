-- ============================================
-- MIGRAÇÃO: Refatoração Plataforma Integrada
-- Criado: 2024-12-07
-- Descrição: Adiciona campos e tabelas para o PsicoNuvem OS
-- ============================================

-- ============================================
-- 1. STATUS DO PACIENTE (Ciclo de Vida)
-- ============================================

-- Criar ENUM para status do paciente
DO $$ BEGIN
    CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar campos de status e cache de datas
ALTER TABLE "Patient"
ADD COLUMN IF NOT EXISTS "status" "PatientStatus" DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS "lastAppointmentAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "nextAppointmentAt" TIMESTAMPTZ;

-- Índice para filtrar por status rapidamente
CREATE INDEX IF NOT EXISTS idx_patient_status ON "Patient"("psychologistId", "status")
WHERE "deletedAt" IS NULL;

COMMENT ON COLUMN "Patient"."status" IS 'Ciclo de vida: ACTIVE (em atendimento), INACTIVE (sumiu), ARCHIVED (alta/encerrado)';
COMMENT ON COLUMN "Patient"."lastAppointmentAt" IS 'Cache: Data da última sessão realizada (para ordenação)';
COMMENT ON COLUMN "Patient"."nextAppointmentAt" IS 'Cache: Data da próxima sessão agendada';

-- ============================================
-- 2. PERFIL PROFISSIONAL (Site Público)
-- ============================================

CREATE TABLE IF NOT EXISTS "ProfessionalProfile" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "psychologistId" TEXT NOT NULL REFERENCES "Psychologist"("id") ON DELETE CASCADE,
    "slug" TEXT NOT NULL,
    "heroTitle" TEXT,
    "bio" TEXT,
    "themeColor" TEXT DEFAULT 'indigo',
    "whatsapp" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "address" TEXT,
    "mapUrl" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT "ProfessionalProfile_psychologistId_key" UNIQUE ("psychologistId"),
    CONSTRAINT "ProfessionalProfile_slug_key" UNIQUE ("slug")
);

-- RLS para ProfessionalProfile
ALTER TABLE "ProfessionalProfile" ENABLE ROW LEVEL SECURITY;

-- Psicólogos podem gerenciar seu próprio perfil
CREATE POLICY "Psicólogos podem ver seu próprio perfil"
    ON "ProfessionalProfile" FOR SELECT
    USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem criar seu próprio perfil"
    ON "ProfessionalProfile" FOR INSERT
    WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "Psicólogos podem atualizar seu próprio perfil"
    ON "ProfessionalProfile" FOR UPDATE
    USING ("psychologistId" = get_current_psychologist_id());

-- Perfil público pode ser lido por qualquer um (para a landing page)
CREATE POLICY "Perfil público é visível para todos"
    ON "ProfessionalProfile" FOR SELECT
    USING (true);

-- Índice para busca por slug (público)
CREATE INDEX IF NOT EXISTS idx_professional_profile_slug ON "ProfessionalProfile"("slug");

COMMENT ON TABLE "ProfessionalProfile" IS 'Dados do site público do psicólogo (/p/[slug])';
COMMENT ON COLUMN "ProfessionalProfile"."slug" IS 'URL amigável única (ex: dra-maria-silva)';
COMMENT ON COLUMN "ProfessionalProfile"."heroTitle" IS 'Título de destaque no site (ex: Psicóloga Clínica)';
COMMENT ON COLUMN "ProfessionalProfile"."themeColor" IS 'Cor tema do site (indigo, emerald, rose, etc)';

-- ============================================
-- 3. LINK FINANCEIRO -> AGENDAMENTO (Opcional)
-- ============================================

-- Adiciona referência opcional do FinancialRecord ao Appointment de origem
ALTER TABLE "FinancialRecord"
ADD COLUMN IF NOT EXISTS "appointmentId" TEXT REFERENCES "Appointment"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_financial_record_appointment 
ON "FinancialRecord"("appointmentId")
WHERE "appointmentId" IS NOT NULL;

COMMENT ON COLUMN "FinancialRecord"."appointmentId" IS 'Agendamento de origem (quando o lançamento veio de uma sessão)';

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
