-- ============================================
-- Phase 3: Fix User Schema
-- Add device_id to end_users matching init.sql
-- Date: 2026-02-16
-- ============================================

-- 1. Add device_id column if not exists
ALTER TABLE public.end_users 
ADD COLUMN IF NOT EXISTS device_id UUID UNIQUE REFERENCES public.devices(id) ON DELETE SET NULL;

-- 2. Add index
CREATE INDEX IF NOT EXISTS idx_end_users_device_id ON public.end_users(device_id);

-- 3. Backfill data from device_assignments (Active assignments only)
UPDATE public.end_users
SET device_id = da.device_id
FROM public.device_assignments da
WHERE public.end_users.id = da.end_user_id
AND da.returned_at IS NULL;

-- 4. Verify
SELECT count(*) as updated_users FROM public.end_users WHERE device_id IS NOT NULL;
