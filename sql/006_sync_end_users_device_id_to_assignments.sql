-- ============================================
-- Phase 3: Sync End User Device ID to Assignments
-- Use manual data from end_users.device_id to create missing assignments
-- Date: 2026-02-16
-- ============================================

INSERT INTO public.device_assignments (
    device_id,
    end_user_id,
    user_id,
    assigned_at
)
SELECT
    eu.device_id,
    eu.id,
    eu.user_id,
    NOW()
FROM public.end_users eu
WHERE eu.device_id IS NOT NULL
-- 1. Ensure User doesn't already have an active assignment
AND NOT EXISTS (
    SELECT 1 FROM public.device_assignments da
    WHERE da.end_user_id = eu.id 
    AND da.returned_at IS NULL
)
-- 2. Ensure Device is not already assigned to anyone else (to prevent conflicts)
AND NOT EXISTS (
    SELECT 1 FROM public.device_assignments da
    WHERE da.device_id = eu.device_id 
    AND da.returned_at IS NULL
);

-- Verification
SELECT count(*) as inserted_assignments 
FROM public.device_assignments 
WHERE created_at > (NOW() - INTERVAL '1 minute');
