-- ============================================================
-- Phase 4: Polish & Maintainability
-- Add constraints and automation triggers
-- Date: 2026-02-16
-- ============================================================

-- 1. Activity Logs: Enforce valid actions
-- Ensure existing data complies or is migrated (we verified only 'import' exists)
ALTER TABLE activity_logs 
ADD CONSTRAINT activity_logs_action_check 
CHECK (action IN ('create', 'update', 'delete', 'login', 'logout', 'import', 'export', 'assign', 'return', 'maintenance'));

-- 2. Profiles: Ensure unique email
-- We verified no duplicates exist
ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- 3. Automation: updated_at triggers
-- device_sheets
ALTER TABLE device_sheets ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
DROP TRIGGER IF EXISTS update_device_sheets_updated_at ON device_sheets;
CREATE TRIGGER update_device_sheets_updated_at
BEFORE UPDATE ON device_sheets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- departments
ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- positions
ALTER TABLE positions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();
DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON positions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. FK Policies (Ensure ON DELETE behavior)
-- Note: This might be complex to script generically without checking existing constraints.
-- For now, we rely on the implementation plan's "ON DELETE policies for all FK" item being a manual check or specific future migration if needed.
-- We will focus on the clear items first.
