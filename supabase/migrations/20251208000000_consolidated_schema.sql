-- ============================================
-- PSICONUVEM OS - SCHEMA CONSOLIDADO
-- Criado: 2024-12-08
-- Descrição: Schema completo da plataforma
-- ============================================

-- ============================================
-- 1. FUNÇÕES AUXILIARES
-- ============================================

-- Função para obter o psychologistId do usuário atual (cached)
CREATE OR REPLACE FUNCTION get_current_psychologist_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  psych_id TEXT;
BEGIN
  SELECT id INTO psych_id 
  FROM "public"."Psychologist" 
  WHERE "userId" = auth.uid()
  LIMIT 1;
  
  RETURN psych_id;
END;
$$;

-- Função para verificar conflitos de agendamento (FIX: search_path)
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_psychologist_id TEXT,
    p_scheduled_at TIMESTAMPTZ,
    p_duration INTEGER,
    p_exclude_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    p_end_time TIMESTAMPTZ;
    conflict_count INTEGER;
BEGIN
    p_end_time := p_scheduled_at + (p_duration || ' minutes')::INTERVAL;
    
    SELECT COUNT(*) INTO conflict_count
    FROM "public"."Appointment"
    WHERE "psychologistId" = p_psychologist_id
      AND status != 'CANCELLED'
      AND (p_exclude_id IS NULL OR id != p_exclude_id)
      AND "scheduledAt" < p_end_time
      AND ("scheduledAt" + (duration || ' minutes')::INTERVAL) > p_scheduled_at;
    
    RETURN conflict_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION check_appointment_conflict TO authenticated;

-- ============================================
-- 2. TIPOS ENUM
-- ============================================

DO $$ BEGIN
    CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 3. TABELA: Psychologist
-- ============================================

CREATE TABLE "Psychologist" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "crp" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "photo" TEXT,
    "phone" TEXT,
    "specialties" TEXT[],
    "plan" TEXT NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMPTZ,
    "asaasCustomerId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Psychologist_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Psychologist_userId_fkey" FOREIGN KEY ("userId") REFERENCES auth.users("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Psychologist_userId_key" ON "Psychologist"("userId");
CREATE UNIQUE INDEX "Psychologist_crp_key" ON "Psychologist"("crp");
CREATE UNIQUE INDEX "Psychologist_slug_key" ON "Psychologist"("slug");
CREATE UNIQUE INDEX "Psychologist_asaasCustomerId_key" ON "Psychologist"("asaasCustomerId");
CREATE INDEX "Psychologist_userId_idx" ON "Psychologist"("userId");

-- ============================================
-- 4. TABELA: Patient
-- ============================================

CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "psychologistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "birthdate" TIMESTAMPTZ,
    "lgpdConsent" BOOLEAN NOT NULL DEFAULT false,
    "lgpdConsentDate" TIMESTAMPTZ,
    "lgpdConsentIp" TEXT,
    -- Campos financeiros
    "paymentModel" TEXT DEFAULT 'PER_SESSION' CHECK ("paymentModel" IN ('PER_SESSION', 'MONTHLY_PLAN')),
    "monthlyPlanPrice" DECIMAL(10,2),
    "paymentDueDay" INTEGER CHECK ("paymentDueDay" BETWEEN 1 AND 31),
    "sessionsPerMonth" INTEGER DEFAULT 4,
    "financialNotes" TEXT,
    "planStartDate" DATE,
    -- Status e cache
    "status" "PatientStatus" DEFAULT 'ACTIVE',
    "lastAppointmentAt" TIMESTAMPTZ,
    "nextAppointmentAt" TIMESTAMPTZ,
    -- Timestamps
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Patient_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "Psychologist"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Patient_psychologistId_idx" ON "Patient"("psychologistId");
CREATE INDEX idx_patient_status ON "Patient"("psychologistId", "status") WHERE "deletedAt" IS NULL;
CREATE INDEX idx_patient_payment_model ON "Patient"("psychologistId", "paymentModel") WHERE "deletedAt" IS NULL;

-- ============================================
-- 5. TABELA: Appointment
-- ============================================

CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "psychologistId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMPTZ NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "type" TEXT NOT NULL DEFAULT 'presencial',
    "meetLink" TEXT,
    "notes" TEXT,
    "telepsyConsent" BOOLEAN NOT NULL DEFAULT false,
    -- Campos financeiros
    "sessionPrice" DECIMAL(10,2),
    "paymentStatus" TEXT DEFAULT 'PENDING' CHECK ("paymentStatus" IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    "paymentDate" TIMESTAMPTZ,
    "paymentMethod" TEXT CHECK ("paymentMethod" IN ('CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER')),
    "paymentNotes" TEXT,
    "billAsSession" BOOLEAN DEFAULT false,
    -- Timestamps
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Appointment_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "Psychologist"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Appointment_psychologistId_scheduledAt_idx" ON "Appointment"("psychologistId", "scheduledAt");
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");
CREATE INDEX idx_appointment_payment_status ON "Appointment"("psychologistId", "paymentStatus") WHERE "deletedAt" IS NULL;
CREATE INDEX idx_appointment_payment_date ON "Appointment"("psychologistId", "paymentDate") WHERE "deletedAt" IS NULL;

-- ============================================
-- 6. TABELA: ClinicalNote
-- ============================================

CREATE TABLE "ClinicalNote" (
    "id" TEXT NOT NULL,
    "psychologistId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "sessionDate" TIMESTAMPTZ NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "sessionType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "ClinicalNote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ClinicalNote_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "Psychologist"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClinicalNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ClinicalNote_psychologistId_patientId_idx" ON "ClinicalNote"("psychologistId", "patientId");
-- FIX: Adiciona índice para FK patientId
CREATE INDEX "ClinicalNote_patientId_idx" ON "ClinicalNote"("patientId");

-- ============================================
-- 7. TABELA: MonthlyInvoice
-- ============================================

CREATE TABLE "MonthlyInvoice" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "psychologistId" TEXT NOT NULL REFERENCES "Psychologist"("id") ON DELETE CASCADE,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "referenceMonth" DATE NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "dueDate" DATE NOT NULL,
  "status" TEXT DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
  "paidAt" TIMESTAMPTZ,
  "paymentMethod" TEXT CHECK ("paymentMethod" IN ('CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER')),
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ,
  
  CONSTRAINT "unique_monthly_invoice" UNIQUE ("patientId", "referenceMonth")
);

CREATE INDEX idx_monthly_invoice_status ON "MonthlyInvoice"("psychologistId", "status") WHERE "deletedAt" IS NULL;
CREATE INDEX idx_monthly_invoice_due_date ON "MonthlyInvoice"("dueDate") WHERE "deletedAt" IS NULL AND "status" != 'PAID';

-- ============================================
-- 8. TABELA: FinancialSettings
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
-- 9. TABELA: FinancialRecord
-- ============================================

CREATE TABLE "FinancialRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "psychologistId" TEXT NOT NULL REFERENCES "Psychologist"("id") ON DELETE CASCADE,
  "patientId" TEXT REFERENCES "Patient"("id") ON DELETE SET NULL,
  "appointmentId" TEXT REFERENCES "Appointment"("id") ON DELETE SET NULL,
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

CREATE INDEX idx_financial_record_date ON "FinancialRecord"("psychologistId", "date") WHERE "deletedAt" IS NULL;
-- FIX: Adiciona índice para FK patientId
CREATE INDEX "FinancialRecord_patientId_idx" ON "FinancialRecord"("patientId");
CREATE INDEX idx_financial_record_appointment ON "FinancialRecord"("appointmentId") WHERE "appointmentId" IS NOT NULL;

-- ============================================
-- 10. TABELA: ProfessionalProfile
-- ============================================

CREATE TABLE "ProfessionalProfile" (
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

CREATE INDEX idx_professional_profile_slug ON "ProfessionalProfile"("slug");

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE "Psychologist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicalNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MonthlyInvoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FinancialSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FinancialRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProfessionalProfile" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 12. POLICIES: Psychologist
-- ============================================

CREATE POLICY "psychologist_select_own" ON "Psychologist" FOR SELECT
USING ("userId" = (select auth.uid()));

CREATE POLICY "psychologist_insert_own" ON "Psychologist" FOR INSERT
WITH CHECK ("userId" = (select auth.uid()));

CREATE POLICY "psychologist_update_own" ON "Psychologist" FOR UPDATE
USING ("userId" = (select auth.uid()));

-- ============================================
-- 13. POLICIES: Patient
-- ============================================

CREATE POLICY "patient_select_own" ON "Patient" FOR SELECT
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "patient_insert_own" ON "Patient" FOR INSERT
WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "patient_update_own" ON "Patient" FOR UPDATE
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "patient_delete_own" ON "Patient" FOR DELETE
USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 14. POLICIES: Appointment
-- ============================================

CREATE POLICY "appointment_select_own" ON "Appointment" FOR SELECT
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "appointment_insert_own" ON "Appointment" FOR INSERT
WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "appointment_update_own" ON "Appointment" FOR UPDATE
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "appointment_delete_own" ON "Appointment" FOR DELETE
USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 15. POLICIES: ClinicalNote
-- ============================================

CREATE POLICY "clinicalnote_select_own" ON "ClinicalNote" FOR SELECT
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "clinicalnote_insert_own" ON "ClinicalNote" FOR INSERT
WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "clinicalnote_update_own" ON "ClinicalNote" FOR UPDATE
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "clinicalnote_delete_own" ON "ClinicalNote" FOR DELETE
USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 16. POLICIES: MonthlyInvoice
-- ============================================

CREATE POLICY "monthlyinvoice_select_own" ON "MonthlyInvoice" FOR SELECT
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "monthlyinvoice_insert_own" ON "MonthlyInvoice" FOR INSERT
WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "monthlyinvoice_update_own" ON "MonthlyInvoice" FOR UPDATE
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "monthlyinvoice_delete_own" ON "MonthlyInvoice" FOR DELETE
USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 17. POLICIES: FinancialSettings
-- ============================================

CREATE POLICY "financialsettings_select_own" ON "FinancialSettings" FOR SELECT
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "financialsettings_insert_own" ON "FinancialSettings" FOR INSERT
WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "financialsettings_update_own" ON "FinancialSettings" FOR UPDATE
USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 18. POLICIES: FinancialRecord
-- ============================================

CREATE POLICY "financialrecord_select_own" ON "FinancialRecord" FOR SELECT
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "financialrecord_insert_own" ON "FinancialRecord" FOR INSERT
WITH CHECK ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "financialrecord_update_own" ON "FinancialRecord" FOR UPDATE
USING ("psychologistId" = get_current_psychologist_id());

CREATE POLICY "financialrecord_delete_own" ON "FinancialRecord" FOR DELETE
USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 19. POLICIES: ProfessionalProfile (FIX: Única policy SELECT com OR)
-- ============================================

-- SELECT: Público OU proprietário (única policy para evitar warning)
CREATE POLICY "professionalprofile_select" ON "ProfessionalProfile"
FOR SELECT
USING (true); -- Perfis são públicos para landing pages

-- INSERT: Apenas proprietário
CREATE POLICY "professionalprofile_insert_own" ON "ProfessionalProfile"
FOR INSERT
WITH CHECK ("psychologistId" = get_current_psychologist_id());

-- UPDATE: Apenas proprietário
CREATE POLICY "professionalprofile_update_own" ON "ProfessionalProfile"
FOR UPDATE
USING ("psychologistId" = get_current_psychologist_id());

-- DELETE: Apenas proprietário (se necessário)
CREATE POLICY "professionalprofile_delete_own" ON "ProfessionalProfile"
FOR DELETE
USING ("psychologistId" = get_current_psychologist_id());

-- ============================================
-- 20. COMENTÁRIOS (Documentação)
-- ============================================

COMMENT ON TABLE "Psychologist" IS 'Psicólogos cadastrados na plataforma';
COMMENT ON TABLE "Patient" IS 'Pacientes de cada psicólogo';
COMMENT ON TABLE "Appointment" IS 'Agendamentos/sessões';
COMMENT ON TABLE "ClinicalNote" IS 'Prontuário eletrônico (criptografado no app)';
COMMENT ON TABLE "MonthlyInvoice" IS 'Faturas mensais para pacientes mensalistas';
COMMENT ON TABLE "FinancialSettings" IS 'Configurações financeiras do psicólogo';
COMMENT ON TABLE "FinancialRecord" IS 'Lançamentos financeiros manuais';
COMMENT ON TABLE "ProfessionalProfile" IS 'Dados do site público (/p/[slug])';

COMMENT ON FUNCTION check_appointment_conflict IS 'Verifica conflitos de horário entre agendamentos';
COMMENT ON FUNCTION get_current_psychologist_id IS 'Retorna o ID do psicólogo logado (cached para RLS)';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
