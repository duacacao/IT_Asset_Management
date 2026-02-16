# PLAN: Database Safe Fix — Zero UI Impact

**Ngày:** 16/02/2026  
**Mục tiêu:** Apply tất cả database fixes mà **KHÔNG ảnh hưởng đến UI**  
**Dựa trên:** `database-fix-evaluation.md` + `business-decisions.md`

---

## 🔴 PHÁT HIỆN QUAN TRỌNG TỪ LIVE DB AUDIT

| Item | Live DB Status | Ghi chú |
|------|---------------|---------|
| `device_assignments.notes` | ❌ **Chưa có** | Schema v2 ghi là có nhưng production chưa có |
| `device_assignments.user_id` FK | ❌ **Không tồn tại** | Không có FK constraint nào! |
| `end_users.device_id` | ✅ Vẫn tồn tại | Cần xóa — redundant |
| `devices.code` | nullable (YES) | Giữ nguyên theo business decision |
| `sort_order` duplicates | 0 rows | An toàn để thêm UNIQUE |
| **RLS policies** | ⚠️ **4 policies dùng `user_id`** | Rename sẽ **BREAK** toàn bộ quyền truy cập! |

---

## 📊 PHÂN LOẠI: Ảnh hưởng UI hay Không?

### ✅ TIER 1 — ZERO UI IMPACT (Chỉ DB — Có thể chạy ngay)

Các fix này **chỉ thay đổi database**, frontend code **không cần sửa bất kỳ dòng nào**:

| # | Fix | Loại | Tại sao không ảnh hưởng UI? |
|---|-----|------|---------------------------|
| 1 | Thêm FK cho `device_assignments.user_id → profiles(id)` | DDL | Frontend chỉ `.eq('user_id', user.id)` — FK là constraint phía DB |
| 2 | Fix `activity_logs.user_id` ON DELETE → SET NULL | DDL | Frontend không xử lý delete cascade |
| 3 | Thêm partial indexes (`devices`, `end_users` WHERE `deleted_at IS NULL`) | DDL | Chỉ tăng performance, không thay đổi query |
| 4 | UNIQUE constraint cho `device_sheets(device_id, sort_order)` | DDL | Frontend đã xử lý sort_order đúng |
| 5 | Trigger `updated_at` cho `device_assignments` | DDL | Column `updated_at` đã tồn tại, trigger chỉ auto-fill |
| 6 | Thêm column `notes` cho `device_assignments` | DDL | Thêm column nullable, query hiện tại không select column này |
| 7 | Thêm composite index cho `device_assignments` (active lookup) | DDL | Chỉ tăng performance |

> [!NOTE]
> **Sau live DB audit:** Nhiều constraints đã tồn tại đúng (CASCADE cho device_sheets, device_assignments). Chỉ còn **5 thay đổi thực sự** cần apply. Xem `PLAN-evaluation.md` để biết chi tiết.

### ⚠️ TIER 2 — CÓ ẢNH HƯỞNG UI (Phải sửa frontend code)

| # | Fix | Files ảnh hưởng | Tại sao? |
|---|-----|----------------|----------|
| A | Drop `end_users.device_id` | `end-users.ts` (comment L291), `supabase.ts` (types) | Frontend có thể vẫn tham chiếu column này |
| B | Rename `user_id → assigned_by` | **6+ files** + **4 RLS policies** | `.eq('user_id', ...)` sẽ fail, RLS policies sẽ **BREAK** |

---

## 🎯 KẾ HOẠCH THỰC HIỆN — TIER 1 ONLY (Zero UI Impact)

### Sprint A: Critical + High → `sql/007_safe_database_fixes.sql`

Xem chi tiết trong file migration. Tóm tắt 5 thay đổi:

| Fix | Mô tả | SQL |
|-----|-------|-----|
| #1 | FK `device_assignments.user_id → profiles` | `ADD CONSTRAINT` |
| #2 | `activity_logs.user_id` ON DELETE SET NULL | `DROP + ADD CONSTRAINT` |
| #3 | UNIQUE `device_sheets(device_id, sort_order)` | `ADD CONSTRAINT` |
| #4 | Trigger `updated_at` + column `notes` | `CREATE TRIGGER + ADD COLUMN` |
| #5 | Partial indexes + composite index | `CREATE INDEX` |

### Verification Queries (Chạy sau migration)

```sql
-- Verify FK constraints
SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS fk_target, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Verify indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;

-- Verify triggers  
SELECT trigger_name, event_object_table FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verify notes column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'device_assignments' AND column_name = 'notes';

-- Verify UNIQUE constraint
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'device_sheets' AND constraint_type = 'UNIQUE';
```

---

## 🚫 TIER 2: HOÃN LẠI (Cần phối hợp Frontend)

### A. Drop `end_users.device_id`

**Tại sao hoãn:**

- Frontend code vẫn có tham chiếu (dù chỉ là comment)
- `supabase.ts` type definitions vẫn khai báo column này
- Cần update TypeScript types trước khi drop

**Kế hoạch riêng:**

1. Remove tham chiếu trong code trước
2. Update `supabase.ts` types
3. Sau đó mới `ALTER TABLE end_users DROP COLUMN device_id`

### B. Rename `user_id → assigned_by`

> [!CAUTION]
> **PHÁT HIỆN NGHIÊM TRỌNG:** Tất cả **4 RLS policies** trên `device_assignments` đều sử dụng `user_id`:
>
> ```sql
> -- SELECT: (user_id = (SELECT auth.uid()))
> -- INSERT: (user_id = (SELECT auth.uid()))
> -- UPDATE: (user_id = (SELECT auth.uid()))
> -- DELETE: (user_id = (SELECT auth.uid()))
> ```
>
> Nếu rename `user_id → assigned_by` mà **KHÔNG update RLS policies đồng thời**, toàn bộ ứng dụng sẽ **MẤT QUYỀN TRUY CẬP** vào `device_assignments` — tức là:
>
> - ❌ Không thể xem danh sách thiết bị đã assign
> - ❌ Không thể assign/return thiết bị
> - ❌ Tất cả queries frontend sẽ fail

**Files cần update nếu rename:**

| File | Dòng | Thay đổi |
|------|------|----------|
| `device-assignments.ts` | L52, L63, L93, L155, L218 | `.eq('user_id', ...)` → `.eq('assigned_by', ...)` |
| `end-users.ts` | L39, L63, L119, L165, L219, L278, L310 | Tương tự |
| `devices.ts` | L276 | `user_id: user.id` → `assigned_by: user.id` |
| `supabase.ts` | L88, L97, L106 | Type definitions |
| `schema.ts` | L39 | Drizzle schema |
| **4 RLS policies** | Database | `user_id` → `assigned_by` trong policy conditions |

**Recommendation:** Hoãn rename đến khi có thể deploy DB + frontend **ĐỒNG THỜI** (zero-downtime deploy).

---

## 📋 QUYẾT ĐỊNH ĐÃ ÁP DỤNG TỪ business-decisions.md

| Quyết định | Giá trị | Áp dụng trong TIER nào? |
|-----------|---------|----------------------|
| `devices.code` | **Giữ nullable** | N/A (không cần fix) |
| ON DELETE dept/pos | **RESTRICT (NO ACTION)** | N/A (giữ nguyên default) |
| `notes` column | **Thêm vào** (chưa có trong production) | ✅ TIER 1 |
| Rename `user_id` | **Hoãn** (quá nguy hiểm khi không deploy cùng frontend) | ⏸ TIER 2 |

---

## ⏱️ TIMELINE

| Phase | Công việc | Thời gian | Risk |
|-------|-----------|-----------|------|
| **TIER 1** | Chạy `007_safe_database_fixes.sql` | 10 phút | 🟢 LOW |
| **Verify** | Chạy verification queries | 5 phút | 🟢 LOW |
| **TIER 2** (tương lai) | Rename + Drop column + Frontend update | 2-4 giờ | 🟡 MEDIUM |

**TIER 1 có thể chạy NGAY LẬP TỨC** vì không ảnh hưởng frontend code.

---

## 🧪 VERIFICATION PLAN

Sau khi chạy TIER 1:

1. ✅ Chạy verification queries (xem ở trên)
2. ✅ Test UI: trang End-User vẫn load bình thường
3. ✅ Test UI: assign/return thiết bị vẫn hoạt động
4. ✅ Test UI: xóa device → sheets tự cascade
5. ✅ Test UI: create/update device → updated_at tự cập nhật

---

**Prepared by:** Database Architect + Backend Specialist  
**Status:** Sẵn sàng chạy TIER 1 ✅
