-- ============================================================
-- 007_safe_database_fixes.sql
-- TIER 1: Zero UI Impact — Chỉ thay đổi DB schema
-- ============================================================
-- Ngày: 16/02/2026
-- Prerequisites: Chạy sql/pre-check.sql trước
-- Rollback: sql/rollback.sql
-- ============================================================
--
-- ĐÃ CÓ SẴN (không cần fix):
--   ✅ device_sheets.device_id → devices (CASCADE)
--   ✅ activity_logs.device_id → devices (SET NULL)
--   ✅ device_assignments.device_id → devices (CASCADE)
--   ✅ device_assignments.end_user_id → end_users (CASCADE)
--   ✅ Triggers updated_at cho: departments, device_sheets,
--      devices, end_users, positions, profiles
--
-- CẦN FIX (5 thay đổi):
--   1. ADD FK device_assignments.user_id → profiles
--   2. FIX activity_logs.user_id ON DELETE → SET NULL
--   3. ADD UNIQUE device_sheets(device_id, sort_order)
--   4. ADD trigger + column notes cho device_assignments
--   5. ADD partial indexes + composite index
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────
-- FIX 1: Thêm FK cho device_assignments.user_id → profiles
-- Hiện tại: Không có FK constraint nào
-- Mục đích: Đảm bảo user_id luôn trỏ đúng profiles
-- ──────────────────────────────────────────
ALTER TABLE device_assignments 
  ADD CONSTRAINT device_assignments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- ──────────────────────────────────────────
-- FIX 2: Fix activity_logs.user_id ON DELETE → SET NULL
-- Hiện tại: NO ACTION (block delete profile)
-- Mục đích: Cho phép xóa profile, giữ logs với user_id = NULL
-- ──────────────────────────────────────────
ALTER TABLE activity_logs 
  DROP CONSTRAINT activity_logs_user_id_profiles_id_fk;
ALTER TABLE activity_logs 
  ADD CONSTRAINT activity_logs_user_id_fk
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────
-- FIX 3: UNIQUE constraint cho sort_order
-- Pre-check: Không có duplicates (verified ✅)
-- Mục đích: Ngăn 2 sheets cùng sort_order trong 1 device
-- ──────────────────────────────────────────
ALTER TABLE device_sheets 
  ADD CONSTRAINT device_sheets_sort_unique 
  UNIQUE (device_id, sort_order);

-- ──────────────────────────────────────────
-- FIX 4a: Trigger updated_at cho device_assignments
-- Các bảng khác đã có trigger dùng update_updated_at_column()
-- Lưu ý: Dùng function CÓ SẴN, không tạo mới
-- ──────────────────────────────────────────
CREATE TRIGGER update_device_assignments_updated_at
  BEFORE UPDATE ON device_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────
-- FIX 4b: Thêm column notes cho device_assignments
-- Mục đích: Lưu ghi chú khi assign/return thiết bị
-- UI chưa sử dụng → không ảnh hưởng frontend
-- ──────────────────────────────────────────
ALTER TABLE device_assignments 
  ADD COLUMN IF NOT EXISTS notes text;

-- ──────────────────────────────────────────
-- FIX 5a: Partial indexes cho soft delete
-- Mục đích: Tăng performance khi query records active
-- ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_devices_active 
  ON devices(id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_end_users_active 
  ON end_users(id) WHERE deleted_at IS NULL;

-- ──────────────────────────────────────────
-- FIX 5b: Composite index cho active assignments lookup
-- Mục đích: Tăng performance query "user đang dùng device nào?"
-- ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assignments_active_lookup 
  ON device_assignments(end_user_id, device_id)
  WHERE returned_at IS NULL;

COMMIT;

-- ============================================================
-- VERIFICATION (chạy từng query để verify)
-- ============================================================

-- Verify Fix 1: FK user_id
SELECT constraint_name, column_name 
FROM information_schema.key_column_usage
WHERE table_name = 'device_assignments' AND column_name = 'user_id';
-- Expected: device_assignments_user_id_fkey

-- Verify Fix 2: activity_logs ON DELETE
SELECT tc.constraint_name, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'activity_logs' AND kcu.column_name = 'user_id';
-- Expected: activity_logs_user_id_fk | SET NULL

-- Verify Fix 3: UNIQUE
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'device_sheets' AND constraint_type = 'UNIQUE';
-- Expected: device_sheets_sort_unique

-- Verify Fix 4a: Trigger
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'device_assignments';
-- Expected: update_device_assignments_updated_at

-- Verify Fix 4b: Notes column
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'device_assignments' AND column_name = 'notes';
-- Expected: notes | text

-- Verify Fix 5: Indexes
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' 
    AND indexname IN ('idx_devices_active', 'idx_end_users_active', 'idx_assignments_active_lookup');
-- Expected: 3 rows
