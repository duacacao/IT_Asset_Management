-- ============================================================
-- Phase 3: MEDIUM — Scalability & Safety
-- Issues: UUID defaults, automatic updated_at timestamps
-- Date: 2026-02-16
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Enable UUID Extension (idempotent)
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 2. Set DEFAULT uuid_generate_v4() for ID columns
-- This allows inserts without manually generating UUIDs
-- EXCLUDED: activity_logs (is INTEGER/SERIAL)
-- ────────────────────────────────────────────────────────────

ALTER TABLE profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE devices ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE end_users ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE departments ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE positions ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE device_sheets ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE device_assignments ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- ────────────────────────────────────────────────────────────
-- 3. Automatic `updated_at` Timestamp Function
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ────────────────────────────────────────────────────────────
-- 4. Create Triggers for tables with `updated_at`
-- Validated tables: profiles, devices, end_users
-- ────────────────────────────────────────────────────────────

-- profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- devices
DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- end_users
DROP TRIGGER IF EXISTS update_end_users_updated_at ON end_users;
CREATE TRIGGER update_end_users_updated_at
    BEFORE UPDATE ON end_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
