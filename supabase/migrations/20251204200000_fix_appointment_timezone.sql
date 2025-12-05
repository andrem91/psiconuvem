-- ============================================
-- FIX TIMEZONE ISSUES
-- ============================================
-- Change TIMESTAMP to TIMESTAMPTZ to avoid double UTC conversion
-- This fixes both the conflict detection and display issues
-- ============================================

-- Convert scheduledAt from TIMESTAMP to TIMESTAMPTZ
ALTER TABLE "Appointment" 
  ALTER COLUMN "scheduledAt" TYPE TIMESTAMPTZ USING "scheduledAt" AT TIME ZONE 'UTC';

-- Also fix createdAt and updatedAt for consistency
ALTER TABLE "Appointment"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ USING "createdAt" AT TIME ZONE 'UTC';

ALTER TABLE "Appointment"
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ USING "updatedAt" AT TIME ZONE 'UTC';

-- Make deletedAt also use TIMESTAMPTZ if it gets set
ALTER TABLE "Appointment"
  ALTER COLUMN "deletedAt" TYPE TIMESTAMPTZ USING "deletedAt" AT TIME ZONE 'UTC';
