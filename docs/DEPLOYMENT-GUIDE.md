# Deployment Guide — TIER 1 Database Migration

**Project:** IT Assets Management — Device Dashboard  
**Version:** 007 Safe Database Fixes  
**Ngày cập nhật:** 16/02/2026

---

## 📋 Tổng Quan

Migration này thêm **constraints, indexes, triggers** vào database **mà không ảnh hưởng UI**.

| Thay đổi | Loại | UI Impact |
|----------|------|-----------|
| FK `device_assignments.user_id → profiles` | New constraint | ❌ Không |
| ON DELETE SET NULL cho `activity_logs.user_id` | Re-create FK | ❌ Không |
| UNIQUE `device_sheets(device_id, sort_order)` | New constraint | ❌ Không |
| Trigger `updated_at` cho `device_assignments` | New trigger | ❌ Không |
| Column `notes` cho `device_assignments` | New column | ❌ Không |
| Partial indexes (`deleted_at IS NULL`) | New indexes | ❌ Không |
| Composite index (active lookup) | New index | ❌ Không |

---

## 🚀 Quy Trình Deploy

### Bước 1: Backup (5 phút)

```bash
# Option A: Supabase Dashboard
# → Project Settings → Database → Backups → Verify recent backup

# Option B: Supabase CLI
supabase db dump -f backups/backup_$(date +%Y%m%d).sql --project-ref xwkrexdvgjcdvlveynga

# Option C: Row count snapshot (luôn nên làm)
# Chạy query trong sql/pre-check.sql → CHECK 7
```

### Bước 2: Pre-Check (5 phút)

Chạy **toàn bộ** `sql/pre-check.sql` trên Supabase SQL Editor.

**Điều kiện PASS:**

| Check | Expected | Nếu FAIL |
|-------|----------|----------|
| #1 FK exists | 0 rows | Skip Fix #1 |
| #2 Orphaned data | 0 rows | ⛔ STOP — Clean data trước |
| #3 Sort duplicates | 0 rows | ⛔ STOP — Reset sort_order trước |
| #4 UNIQUE exists | 0 rows | Skip Fix #6 |
| #5 Notes exists | 0 rows | Skip Fix #8 |
| #6 Trigger exists | 0 rows | Skip Fix #7 |
| #7 Row counts | Ghi lại | So sánh sau migration |
| #8 FK snapshot | Ghi lại | So sánh rollback |

### Bước 3: Apply Migration (2 phút)

```sql
-- Chạy trên Supabase SQL Editor
-- Copy toàn bộ nội dung sql/007_safe_database_fixes.sql
-- Paste và Execute
```

### Bước 4: Verify (5 phút)

Chạy các queries sau trên Supabase SQL Editor:

```sql
-- 1. Verify FK mới
SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS fk_target, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'device_assignments' AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY kcu.column_name;
-- Expected: 3 rows (device_id, end_user_id, user_id)

-- 2. Verify UNIQUE constraint
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'device_sheets' AND constraint_type = 'UNIQUE';
-- Expected: device_sheets_sort_unique

-- 3. Verify trigger
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'device_assignments';
-- Expected: trg_device_assignments_updated (hoặc update_device_assignments_updated_at)

-- 4. Verify notes column
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'device_assignments' AND column_name = 'notes';
-- Expected: notes | text

-- 5. Verify indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('devices', 'end_users', 'device_assignments')
    AND indexname LIKE 'idx_%'
ORDER BY indexname;
-- Expected: idx_assignments_active_lookup, idx_devices_active, idx_end_users_active

-- 6. Verify row counts (so sánh với snapshot)
SELECT 'devices' AS tbl, COUNT(*) AS cnt FROM devices
UNION ALL SELECT 'end_users', COUNT(*) FROM end_users
UNION ALL SELECT 'device_assignments', COUNT(*) FROM device_assignments
UNION ALL SELECT 'device_sheets', COUNT(*) FROM device_sheets
ORDER BY tbl;
-- Expected: Phải giống snapshot (DDL changes không thay đổi data)
```

### Bước 5: Test UI (10 phút)

| Test Case | Cách test | Expected |
|-----------|-----------|----------|
| Trang End-User | Mở `/end-user` | Load bình thường, có danh sách |
| Assign thiết bị | Gán 1 device cho user | Thành công, hiển thị đúng |
| Return thiết bị | Trả device | Thành công, status cập nhật |
| Trang Devices | Mở `/devices` | Load bình thường |
| Sort sheets | Kéo thả tab sheets | Sort_order cập nhật đúng |

### Bước 6: Confirm / Rollback

```
✅ Nếu TẤT CẢ tests PASS:
   → Migration hoàn tất!
   → Ghi log: "007_safe_database_fixes applied successfully"

❌ Nếu có lỗi:
   → Chạy sql/rollback.sql
   → Verify rollback bằng snapshot
   → Report lỗi
```

---

## 🔄 Rollback Procedure

Nếu cần hoàn tác:

```sql
-- Chạy toàn bộ sql/rollback.sql trên Supabase SQL Editor
-- Script sẽ khôi phục về trạng thái trước migration
```

**Thời gian rollback:** < 1 phút  
**Data loss:** Không (DDL changes only)

---

## 📁 Files Liên Quan

| File | Mục đích |
|------|----------|
| `sql/pre-check.sql` | Kiểm tra điều kiện trước migration |
| `sql/007_safe_database_fixes.sql` | Migration script chính |
| `sql/rollback.sql` | Hoàn tác migration |
| `docs/backup.sh` | Script backup database |
| `docs/PLAN-database-safe-fix.md` | Plan chi tiết |
| `docs/PLAN-evaluation.md` | Đánh giá plan |

---

## ⏱️ Timeline Tổng

| Bước | Thời gian |
|------|-----------|
| Backup | 5 phút |
| Pre-check | 5 phút |
| Migration | 2 phút |
| Verify | 5 phút |
| UI Test | 10 phút |
| **TỔNG** | **~27 phút** |

---

## ⚠️ TIER 2 (Tương Lai — CÓ UI Impact)

Các fix sau **CHƯA được apply** vì ảnh hưởng frontend:

| Fix | Lý do hoãn | Khi nào apply |
|-----|-----------|---------------|
| Drop `end_users.device_id` | Frontend types còn tham chiếu | Khi update TypeScript types |
| Rename `user_id → assigned_by` | 4 RLS policies + 6 source files | Khi deploy DB + frontend đồng thời |

**Deployment strategy cho TIER 2:**

1. Tạo branch mới
2. Update frontend code + types
3. Chuẩn bị migration SQL + RLS policy update
4. Deploy frontend + run migration **ĐỒNG THỜI**
5. Verify

---

**Prepared by:** Orchestrator  
**Status:** Ready for execution ✅
