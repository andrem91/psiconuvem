-- ============================================
-- ROW LEVEL SECURITY (RLS) - OTIMIZADO
-- ============================================
-- Habilita RLS e cria policies otimizadas
-- usando (select auth.uid()) para performance.
-- ============================================

-- 1. HABILITAR RLS
ALTER TABLE "Psychologist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicalNote" ENABLE ROW LEVEL SECURITY;

-- 2. INDEX PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS "Psychologist_userId_idx" ON "Psychologist"("userId");


-- ============================================
-- POLICIES: PSYCHOLOGIST
-- ============================================

CREATE POLICY "psychologist_select_own" ON "Psychologist" FOR SELECT
USING ("userId" = (select auth.uid()));

CREATE POLICY "psychologist_insert_own" ON "Psychologist" FOR INSERT
WITH CHECK ("userId" = (select auth.uid()));

CREATE POLICY "psychologist_update_own" ON "Psychologist" FOR UPDATE
USING ("userId" = (select auth.uid()));


-- ============================================
-- POLICIES: PATIENT
-- ============================================

CREATE POLICY "patient_select_own" ON "Patient" FOR SELECT
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "patient_insert_own" ON "Patient" FOR INSERT
WITH CHECK ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "patient_update_own" ON "Patient" FOR UPDATE
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "patient_delete_own" ON "Patient" FOR DELETE
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );


-- ============================================
-- POLICIES: APPOINTMENT
-- ============================================

CREATE POLICY "appointment_select_own" ON "Appointment" FOR SELECT
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "appointment_insert_own" ON "Appointment" FOR INSERT
WITH CHECK ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "appointment_update_own" ON "Appointment" FOR UPDATE
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "appointment_delete_own" ON "Appointment" FOR DELETE
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );


-- ============================================
-- POLICIES: CLINICALNOTE
-- ============================================

CREATE POLICY "clinicalnote_select_own" ON "ClinicalNote" FOR SELECT
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "clinicalnote_insert_own" ON "ClinicalNote" FOR INSERT
WITH CHECK ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "clinicalnote_update_own" ON "ClinicalNote" FOR UPDATE
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );

CREATE POLICY "clinicalnote_delete_own" ON "ClinicalNote" FOR DELETE
USING ( "psychologistId" IN (SELECT id FROM "Psychologist" WHERE "userId" = (select auth.uid())) );