-- ============================================================
-- Phase 3b: Soft Delete Support
-- Add deleted_at column to main tables
-- Date: 2026-02-16
-- ============================================================

ALTER TABLE devices ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE end_users ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE positions ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Index for performance (filtering by deleted_at is common)
CREATE INDEX IF NOT EXISTS idx_devices_deleted_at ON devices(deleted_at);
CREATE INDEX IF NOT EXISTS idx_end_users_deleted_at ON end_users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_departments_deleted_at ON departments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_positions_deleted_at ON positions(deleted_at);
