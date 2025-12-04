-- ============================================
-- OTIMIZAÇÃO DE PERFORMANCE - RLS
-- ============================================
-- Cria função PL/pgSQL para cachear o psychologistId
-- e atualiza todas as policies para usar a função.
-- Isso melhora significativamente a performance das queries.
-- ============================================

-- 1. CRIAR FUNÇÃO PARA OBTER PSYCHOLOGIST ID
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

-- 2. REMOVER POLICIES ANTIGAS
DROP POLICY IF EXISTS "patient_select_own" ON "Patient";
DROP POLICY IF EXISTS "patient_insert_own" ON "Patient";
DROP POLICY IF EXISTS "patient_update_own" ON "Patient";
DROP POLICY IF EXISTS "patient_delete_own" ON "Patient";

DROP POLICY IF EXISTS "appointment_select_own" ON "Appointment";
DROP POLICY IF EXISTS "appointment_insert_own" ON "Appointment";
DROP POLICY IF EXISTS "appointment_update_own" ON "Appointment";
DROP POLICY IF EXISTS "appointment_delete_own" ON "Appointment";

DROP POLICY IF EXISTS "clinicalnote_select_own" ON "ClinicalNote";
DROP POLICY IF EXISTS "clinicalnote_insert_own" ON "ClinicalNote";
DROP POLICY IF EXISTS "clinicalnote_update_own" ON "ClinicalNote";
DROP POLICY IF EXISTS "clinicalnote_delete_own" ON "ClinicalNote";


-- ============================================
-- POLICIES OTIMIZADAS: PATIENT
-- ============================================

CREATE POLICY "patient_select_own" ON "Patient" FOR SELECT
USING ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "patient_insert_own" ON "Patient" FOR INSERT
WITH CHECK ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "patient_update_own" ON "Patient" FOR UPDATE
USING ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "patient_delete_own" ON "Patient" FOR DELETE
USING ( "psychologistId" = get_current_psychologist_id() );


-- ============================================
-- POLICIES OTIMIZADAS: APPOINTMENT
-- ============================================

CREATE POLICY "appointment_select_own" ON "Appointment" FOR SELECT
USING ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "appointment_insert_own" ON "Appointment" FOR INSERT
WITH CHECK ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "appointment_update_own" ON "Appointment" FOR UPDATE
USING ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "appointment_delete_own" ON "Appointment" FOR DELETE
USING ( "psychologistId" = get_current_psychologist_id() );


-- ============================================
-- POLICIES OTIMIZADAS: CLINICALNOTE
-- ============================================

CREATE POLICY "clinicalnote_select_own" ON "ClinicalNote" FOR SELECT
USING ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "clinicalnote_insert_own" ON "ClinicalNote" FOR INSERT
WITH CHECK ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "clinicalnote_update_own" ON "ClinicalNote" FOR UPDATE
USING ( "psychologistId" = get_current_psychologist_id() );

CREATE POLICY "clinicalnote_delete_own" ON "ClinicalNote" FOR DELETE
USING ( "psychologistId" = get_current_psychologist_id() );
