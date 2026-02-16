-- ============================================================
-- Phase 2: HIGH — Performance & Data Integrity
-- Issues #4, #5, #6, #7, #8 + RLS optimization
-- Date: 2026-02-16
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- #4: Thêm indexes cho tất cả FK columns
-- PostgreSQL KHÔNG tự tạo index cho FK — chỉ PK/UNIQUE mới có
-- ────────────────────────────────────────────────────────────

-- devices
CREATE INDEX IF NOT EXISTS idx_devices_owner_id ON devices(owner_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type);

-- end_users
CREATE INDEX IF NOT EXISTS idx_end_users_user_id ON end_users(user_id);
CREATE INDEX IF NOT EXISTS idx_end_users_department_id ON end_users(department_id);
CREATE INDEX IF NOT EXISTS idx_end_users_position_id ON end_users(position_id);

-- device_sheets
CREATE INDEX IF NOT EXISTS idx_device_sheets_device_id ON device_sheets(device_id);

-- activity_logs (bảng sẽ lớn nhất — cần index nhiều nhất)
CREATE INDEX IF NOT EXISTS idx_activity_logs_device_id ON activity_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- departments & positions
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON departments(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);

-- ────────────────────────────────────────────────────────────
-- #5: CHECK constraints cho devices.status và devices.type
-- Giữ 3 status (active|broken|inactive) theo yêu cầu user
-- Type list: PC|Laptop|Monitor|Printer|Phone|Tablet|Network|Other
-- ────────────────────────────────────────────────────────────

-- Chuẩn hóa data trước khi thêm constraint
UPDATE devices SET status = lower(trim(status)) WHERE status != lower(trim(status));
UPDATE devices SET type = trim(type) WHERE type != trim(type);

ALTER TABLE devices ADD CONSTRAINT devices_status_check
  CHECK (status IN ('active', 'broken', 'inactive'));

ALTER TABLE devices ADD CONSTRAINT devices_type_check
  CHECK (type IN ('PC', 'Laptop', 'Monitor', 'Printer', 'Phone', 'Tablet', 'Network', 'Other'));

-- ────────────────────────────────────────────────────────────
-- #6: Fix timestamps — chuyển tất cả sang timestamptz
-- Các bảng đang dùng timestamp WITHOUT time zone:
--   profiles, devices, activity_logs
-- ────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE devices
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC',
  ALTER COLUMN purchase_date TYPE timestamptz USING purchase_date AT TIME ZONE 'UTC',
  ALTER COLUMN warranty_exp TYPE timestamptz USING warranty_exp AT TIME ZONE 'UTC';

ALTER TABLE activity_logs
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- ────────────────────────────────────────────────────────────
-- #7: CHECK constraint cho profiles.role
-- ────────────────────────────────────────────────────────────

UPDATE profiles SET role = lower(trim(role)) WHERE role != lower(trim(role));

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'user'));

-- ────────────────────────────────────────────────────────────
-- #8: end_users.user_id SET NOT NULL
-- Orphan records (user_id IS NULL) đã xóa ở Phase 1
-- ────────────────────────────────────────────────────────────

ALTER TABLE end_users ALTER COLUMN user_id SET NOT NULL;

-- ────────────────────────────────────────────────────────────
-- Bonus: Fix RLS policies — performance optimization
-- Wrap auth.uid() với (select auth.uid()) để tránh re-evaluation
-- Đổi roles từ {public} → {authenticated}
-- ────────────────────────────────────────────────────────────

-- === DEVICES ===
DROP POLICY IF EXISTS "devices_select" ON devices;
DROP POLICY IF EXISTS "devices_insert" ON devices;
DROP POLICY IF EXISTS "devices_update" ON devices;
DROP POLICY IF EXISTS "devices_delete" ON devices;
-- Drop any old-named policies
DROP POLICY IF EXISTS "Users can view own devices" ON devices;
DROP POLICY IF EXISTS "Users can insert own devices" ON devices;
DROP POLICY IF EXISTS "Users can update own devices" ON devices;
DROP POLICY IF EXISTS "Users can delete own devices" ON devices;

CREATE POLICY "devices_select" ON devices FOR SELECT TO authenticated
  USING (owner_id = (select auth.uid()));
CREATE POLICY "devices_insert" ON devices FOR INSERT TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));
CREATE POLICY "devices_update" ON devices FOR UPDATE TO authenticated
  USING (owner_id = (select auth.uid()));
CREATE POLICY "devices_delete" ON devices FOR DELETE TO authenticated
  USING (owner_id = (select auth.uid()));

-- === END_USERS ===
DROP POLICY IF EXISTS "end_users_select" ON end_users;
DROP POLICY IF EXISTS "end_users_insert" ON end_users;
DROP POLICY IF EXISTS "end_users_update" ON end_users;
DROP POLICY IF EXISTS "end_users_delete" ON end_users;
DROP POLICY IF EXISTS "Users can view own end_users" ON end_users;
DROP POLICY IF EXISTS "Users can insert own end_users" ON end_users;
DROP POLICY IF EXISTS "Users can update own end_users" ON end_users;
DROP POLICY IF EXISTS "Users can delete own end_users" ON end_users;

CREATE POLICY "end_users_select" ON end_users FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "end_users_insert" ON end_users FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "end_users_update" ON end_users FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "end_users_delete" ON end_users FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- === DEPARTMENTS ===
DROP POLICY IF EXISTS "departments_select" ON departments;
DROP POLICY IF EXISTS "departments_insert" ON departments;
DROP POLICY IF EXISTS "departments_update" ON departments;
DROP POLICY IF EXISTS "departments_delete" ON departments;
DROP POLICY IF EXISTS "Users can view own departments" ON departments;
DROP POLICY IF EXISTS "Users can insert own departments" ON departments;
DROP POLICY IF EXISTS "Users can update own departments" ON departments;
DROP POLICY IF EXISTS "Users can delete own departments" ON departments;

CREATE POLICY "departments_select" ON departments FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "departments_insert" ON departments FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "departments_update" ON departments FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "departments_delete" ON departments FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- === POSITIONS ===
DROP POLICY IF EXISTS "positions_select" ON positions;
DROP POLICY IF EXISTS "positions_insert" ON positions;
DROP POLICY IF EXISTS "positions_update" ON positions;
DROP POLICY IF EXISTS "positions_delete" ON positions;
DROP POLICY IF EXISTS "Users can view own positions" ON positions;
DROP POLICY IF EXISTS "Users can insert own positions" ON positions;
DROP POLICY IF EXISTS "Users can update own positions" ON positions;
DROP POLICY IF EXISTS "Users can delete own positions" ON positions;

CREATE POLICY "positions_select" ON positions FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "positions_insert" ON positions FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "positions_update" ON positions FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "positions_delete" ON positions FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- === DEVICE_SHEETS ===
DROP POLICY IF EXISTS "device_sheets_select" ON device_sheets;
DROP POLICY IF EXISTS "device_sheets_insert" ON device_sheets;
DROP POLICY IF EXISTS "device_sheets_update" ON device_sheets;
DROP POLICY IF EXISTS "device_sheets_delete" ON device_sheets;
DROP POLICY IF EXISTS "Users can view own device_sheets" ON device_sheets;
DROP POLICY IF EXISTS "Users can insert own device_sheets" ON device_sheets;
DROP POLICY IF EXISTS "Users can update own device_sheets" ON device_sheets;
DROP POLICY IF EXISTS "Users can delete own device_sheets" ON device_sheets;

CREATE POLICY "device_sheets_select" ON device_sheets FOR SELECT TO authenticated
  USING (device_id IN (SELECT id FROM devices WHERE owner_id = (select auth.uid())));
CREATE POLICY "device_sheets_insert" ON device_sheets FOR INSERT TO authenticated
  WITH CHECK (device_id IN (SELECT id FROM devices WHERE owner_id = (select auth.uid())));
CREATE POLICY "device_sheets_update" ON device_sheets FOR UPDATE TO authenticated
  USING (device_id IN (SELECT id FROM devices WHERE owner_id = (select auth.uid())));
CREATE POLICY "device_sheets_delete" ON device_sheets FOR DELETE TO authenticated
  USING (device_id IN (SELECT id FROM devices WHERE owner_id = (select auth.uid())));

-- === ACTIVITY_LOGS ===
DROP POLICY IF EXISTS "activity_logs_select" ON activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert" ON activity_logs;
DROP POLICY IF EXISTS "Users can view own activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity_logs" ON activity_logs;

CREATE POLICY "activity_logs_select" ON activity_logs FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- === DEVICE_ASSIGNMENTS (đã tạo ở Phase 1, chỉ fix lại nếu cần) ===
DROP POLICY IF EXISTS "device_assignments_select" ON device_assignments;
DROP POLICY IF EXISTS "device_assignments_insert" ON device_assignments;
DROP POLICY IF EXISTS "device_assignments_update" ON device_assignments;
DROP POLICY IF EXISTS "device_assignments_delete" ON device_assignments;

CREATE POLICY "device_assignments_select" ON device_assignments FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "device_assignments_insert" ON device_assignments FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "device_assignments_update" ON device_assignments FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()));
CREATE POLICY "device_assignments_delete" ON device_assignments FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));
