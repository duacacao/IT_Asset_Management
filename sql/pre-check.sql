-- ============================================================
-- PRE-CHECK: Kiểm tra điều kiện trước khi chạy migration
-- Chạy script này TRƯỚC 007_safe_database_fixes.sql
-- Tất cả checks phải PASS trước khi tiếp tục
-- ============================================================
-- Ngày: 16/02/2026
-- Áp dụng cho: TIER 1 (Zero UI Impact)
-- ============================================================

-- ──────────────────────────────────────────
-- CHECK 1: Xác nhận CHƯA có FK trên device_assignments.user_id
-- Expected: 0 rows (chưa tồn tại)
-- ──────────────────────────────────────────
SELECT '❌ FK device_assignments.user_id ĐÃ TỒN TẠI - SKIP Fix #1' AS warning
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'device_assignments' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id';
-- Nếu có kết quả → Fix #1 không cần chạy

-- ──────────────────────────────────────────
-- CHECK 2: Xác nhận user_id trong device_assignments đều có trong profiles
-- Expected: 0 rows (không có orphaned data)
-- ──────────────────────────────────────────
SELECT da.id, da.user_id AS orphaned_user_id
FROM device_assignments da
LEFT JOIN profiles p ON da.user_id = p.id
WHERE p.id IS NULL;
-- Nếu có kết quả → Phải clean orphaned data trước khi add FK

-- ──────────────────────────────────────────
-- CHECK 3: Xác nhận sort_order KHÔNG có duplicates
-- Expected: 0 rows
-- ──────────────────────────────────────────
SELECT device_id, sort_order, COUNT(*) AS cnt
FROM device_sheets
GROUP BY device_id, sort_order
HAVING COUNT(*) > 1;
-- Nếu có kết quả → Phải reset sort_order trước khi add UNIQUE

-- ──────────────────────────────────────────
-- CHECK 4: Xác nhận chưa có UNIQUE constraint trên sort_order  
-- Expected: 0 rows (chưa tồn tại)
-- ──────────────────────────────────────────
SELECT constraint_name 
FROM information_schema.table_constraints
WHERE table_name = 'device_sheets' 
    AND constraint_type = 'UNIQUE'
    AND constraint_name = 'device_sheets_sort_unique';
-- Nếu có kết quả → UNIQUE đã tồn tại, SKIP Fix #6

-- ──────────────────────────────────────────
-- CHECK 5: Xác nhận chưa có notes column trong device_assignments
-- Expected: 0 rows (chưa tồn tại)
-- ──────────────────────────────────────────
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'device_assignments' AND column_name = 'notes';
-- Nếu có kết quả → Column đã tồn tại, SKIP Fix #8

-- ──────────────────────────────────────────
-- CHECK 6: Xác nhận trigger updated_at cho device_assignments chưa có
-- Expected: 0 rows
-- ──────────────────────────────────────────
SELECT trigger_name 
FROM information_schema.triggers
WHERE event_object_table = 'device_assignments'
    AND trigger_name LIKE '%updated%';
-- Nếu có kết quả → Trigger đã tồn tại, SKIP Fix #7

-- ──────────────────────────────────────────
-- CHECK 7: Snapshot hiện tại (lưu lại để so sánh sau migration)
-- ──────────────────────────────────────────

-- Đếm records mỗi bảng chính
SELECT 'devices' AS table_name, COUNT(*) AS row_count FROM devices
UNION ALL
SELECT 'end_users', COUNT(*) FROM end_users
UNION ALL
SELECT 'device_assignments', COUNT(*) FROM device_assignments
UNION ALL
SELECT 'device_sheets', COUNT(*) FROM device_sheets
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'positions', COUNT(*) FROM positions
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
ORDER BY table_name;

-- ──────────────────────────────────────────
-- CHECK 8: Liệt kê FK hiện tại (snapshot cho rollback)
-- ──────────────────────────────────────────
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

-- ──────────────────────────────────────────
-- TỔNG KẾT PRE-CHECK
-- ──────────────────────────────────────────
-- ✅ Check 1 = 0 rows → Tiếp tục Fix #1
-- ✅ Check 2 = 0 rows → Data sạch, an toàn add FK
-- ✅ Check 3 = 0 rows → An toàn add UNIQUE
-- ✅ Check 4 = 0 rows → UNIQUE chưa có
-- ✅ Check 5 = 0 rows → Notes chưa có
-- ✅ Check 6 = 0 rows → Trigger chưa có
-- ✅ Check 7 = Ghi lại snapshot
-- ✅ Check 8 = Ghi lại FK snapshot
-- 
-- NẾU TẤT CẢ PASS → Chạy 007_safe_database_fixes.sql
