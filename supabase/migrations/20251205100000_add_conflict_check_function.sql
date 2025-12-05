-- ============================================
-- PERFORMANCE OPTIMIZATION: Conflict Detection
-- ============================================
-- Creates a Postgres function to check appointment conflicts
-- More efficient than fetching all appointments to client
-- ============================================

/**
 * Checks if a new appointment conflicts with existing ones
 * 
 * @param p_psychologist_id - UUID of the psychologist
 * @param p_scheduled_at - Start time of the appointment
 * @param p_duration - Duration in minutes
 * @param p_exclude_id - Optional appointment ID to exclude (for updates)
 * @returns TRUE if there's a conflict, FALSE otherwise
 */
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_psychologist_id TEXT,
    p_scheduled_at TIMESTAMPTZ,
    p_duration INTEGER,
    p_exclude_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    p_end_time TIMESTAMPTZ;
    conflict_count INTEGER;
BEGIN
    -- Calculate end time of new appointment
    p_end_time := p_scheduled_at + (p_duration || ' minutes')::INTERVAL;
    
    -- Check for overlapping appointments
    -- Two appointments overlap if:
    -- new.start < existing.end AND new.end > existing.start
    SELECT COUNT(*) INTO conflict_count
    FROM "Appointment"
    WHERE "psychologistId" = p_psychologist_id
      AND status != 'CANCELLED'
      AND (p_exclude_id IS NULL OR id != p_exclude_id)
      AND "scheduledAt" < p_end_time
      AND ("scheduledAt" + (duration || ' minutes')::INTERVAL) > p_scheduled_at;
    
    RETURN conflict_count > 0;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_appointment_conflict TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION check_appointment_conflict IS 
'Efficiently checks if an appointment time conflicts with existing appointments for a psychologist. Returns true if conflict exists.';
