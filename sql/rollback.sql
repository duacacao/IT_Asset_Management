-- ============================================================
-- ROLLBACK: Hoàn tác migration 007_safe_database_fixes.sql
-- Chạy script này NẾU migration gây lỗi
-- Script phục hồi về trạng thái TRƯỚC migration
-- ============================================================
-- Ngày: 16/02/2026
-- Snapshot trạng thái trước migration (từ live DB audit):
--
-- FK hiện tại:
--   activity_logs.device_id → devices (SET NULL) ✅ giữ nguyên
--   activity_logs.user_id → profiles (NO ACTION)
--   device_assignments.device_id → devices (CASCADE) ✅ giữ nguyên
--   device_assignments.end_user_id → end_users (CASCADE) ✅ giữ nguyên
--   device_assignments.user_id → KHÔNG CÓ FK
--   device_sheets.device_id → devices (CASCADE) ✅ giữ nguyên
--
-- Triggers hiện tại:
--   departments, device_sheets, devices, end_users, positions, profiles
--   → update_updated_at_column()
--   device_assignments → KHÔNG CÓ trigger
--
-- UNIQUE trên device_sheets: KHÔNG CÓ
-- device_assignments.notes: KHÔNG CÓ
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────
-- ROLLBACK Fix #1: Xóa FK device_assignments.user_id → profiles
-- ──────────────────────────────────────────
ALTER TABLE device_assignments 
    DROP CONSTRAINT IF EXISTS device_assignments_user_id_fkey;

-- ──────────────────────────────────────────
-- ROLLBACK Fix #2: Khôi phục activity_logs.user_id về NO ACTION
-- ──────────────────────────────────────────
ALTER TABLE activity_logs 
    DROP CONSTRAINT IF EXISTS activity_logs_user_id_fk;
ALTER TABLE activity_logs 
    ADD CONSTRAINT activity_logs_user_id_profiles_id_fk
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE NO ACTION;

-- ──────────────────────────────────────────
-- ROLLBACK Fix #5: Xóa partial indexes
-- ──────────────────────────────────────────
DROP INDEX IF EXISTS idx_devices_active;
DROP INDEX IF EXISTS idx_end_users_active;

-- ──────────────────────────────────────────
-- ROLLBACK Fix #6: Xóa UNIQUE constraint sort_order
-- ──────────────────────────────────────────
ALTER TABLE device_sheets 
    DROP CONSTRAINT IF EXISTS device_sheets_sort_unique;

-- ──────────────────────────────────────────
-- ROLLBACK Fix #7: Xóa trigger device_assignments
-- ──────────────────────────────────────────
DROP TRIGGER IF EXISTS update_device_assignments_updated_at ON device_assignments;
-- Giữ function update_updated_at_column() vì các trigger khác vẫn dùng

-- ──────────────────────────────────────────
-- ROLLBACK Fix #8: Xóa column notes + updated_at (hotfix)
-- ──────────────────────────────────────────
ALTER TABLE device_assignments DROP COLUMN IF EXISTS notes;
ALTER TABLE device_assignments DROP COLUMN IF EXISTS updated_at;

-- ──────────────────────────────────────────
-- ROLLBACK Fix #9: Xóa composite index
-- ──────────────────────────────────────────
DROP INDEX IF EXISTS idx_assignments_active_lookup;

COMMIT;

-- ──────────────────────────────────────────
-- VERIFY ROLLBACK: So sánh với snapshot pre-check
-- ──────────────────────────────────────────

-- FK constraints phải giống snapshot
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS fk_target,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Đếm records (phải giống snapshot)
SELECT 'devices' AS tbl, COUNT(*) AS cnt FROM devices
UNION ALL SELECT 'end_users', COUNT(*) FROM end_users
UNION ALL SELECT 'device_assignments', COUNT(*) FROM device_assignments
UNION ALL SELECT 'device_sheets', COUNT(*) FROM device_sheets
UNION ALL SELECT 'activity_logs', COUNT(*) FROM activity_logs
ORDER BY tbl;
