# Đánh giá Hướng Sửa Chữa Database Schema

**Ngày đánh giá:** 16/02/2026  
**File được đánh giá:** database-review-v2.md  
**Đánh giá bởi:** Senior Database Architect

---

## 📊 Tổng quan nhanh

| Tiêu chí | Điểm số | Nhận xét |
|---|---|---|
| **Roadmap structure** | 9/10 | Chia sprint logic, priority đúng |
| **SQL correctness** | 8/10 | Đúng về mặt syntax, cần bổ sung steps |
| **Risk assessment** | 7/10 | Có nhận biết risk nhưng thiếu mitigation |
| **Practicality** | 8.5/10 | Thực tế, có thể apply ngay |
| **TỔNG ĐIỂM** | **8.5/10** | ⭐⭐⭐⭐⭐⭐⭐⭐✰✰ |

---

## ✅ ĐIỂM MẠNH của Hướng Sửa Chữa

1. **Chia sprint theo priority** - Rất khoa học:
   - Sprint 1: CRITICAL (fix ngay)
   - Sprint 2: HIGH (trong tuần)
   - Sprint 3: MEDIUM/LOW (khi rảnh)

2. **SQL syntax đúng** - Có thể chạy được ngay

3. **Giải thích rõ ràng** - Mỗi fix đều có:
   - Vấn đề hiện tại
   - Hậu quả trên UI
   - SQL fix cụ thể

4. **Indexes strategy tốt** - Đúng trọng tâm, có partial indexes

5. **Có roadmap timeline** - Dễ estimate effort

---

## ⚠️ ĐIỂM CẦN CẢI THIỆN

### 1. Thiếu Pre-check và Migration Steps

**Vấn đề:** Nhiều fix cần clean data trước nhưng không có hướng dẫn chi tiết.

**Ví dụ:** UNIQUE constraint cho departments - nếu đã có duplicate sẽ FAIL ngay.

**Đề xuất:**
```sql
-- PHẢI THÊM: Check duplicates TRƯỚC khi add UNIQUE
SELECT name, user_id, COUNT(*) 
FROM departments 
GROUP BY name, user_id 
HAVING COUNT(*) > 1;
-- Nếu có kết quả → phải merge trước
```

---

### 2. ON DELETE Policy cho department/position CÓ VẤN ĐỀ

**Vấn đề trong file:**
```sql
-- Đề xuất: SET NULL
ALTER TABLE end_users ALTER COLUMN department_id DROP NOT NULL;
```

**Tại sao SAI:**
- Schema v2 đã set `department_id NOT NULL`
- Đây là business rule: nhân viên PHẢI thuộc một phòng ban
- SET NULL vi phạm business logic

**Giải pháp TỐT HƠN:**
```sql
-- Option A: GIỮ NGUYÊN NO ACTION (KHUYẾN NGHỊ)
-- Không cho xóa department nếu còn end_users
-- UI check trước: "Có 5 nhân viên thuộc phòng IT, không thể xóa"

-- Option B: Tạo default department
INSERT INTO departments (id, name, user_id)
VALUES ('<uuid>', 'Chưa phân công', '<admin_id>');

-- Trigger: khi xóa department → chuyển sang default
CREATE OR REPLACE FUNCTION prevent_department_orphans()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE end_users 
  SET department_id = '<default_dept_id>'
  WHERE department_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_before_delete_department
  BEFORE DELETE ON departments
  FOR EACH ROW EXECUTE FUNCTION prevent_department_orphans();
```

---

### 3. sort_order UNIQUE - Thiếu Reset Step

**Vấn đề:** Tất cả sheets có `sort_order = 0` → add UNIQUE sẽ FAIL.

**Cần thêm:**
```sql
-- TRƯỚC KHI ADD UNIQUE:
WITH ranked AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY device_id ORDER BY created_at) - 1 as new_order
  FROM device_sheets
)
UPDATE device_sheets ds
SET sort_order = r.new_order
FROM ranked r
WHERE ds.id = r.id;

-- Verify:
SELECT device_id, sort_order, COUNT(*)
FROM device_sheets
GROUP BY device_id, sort_order
HAVING COUNT(*) > 1;
-- Phải return 0 rows

-- SAU ĐÓ MỚI:
ALTER TABLE device_sheets ADD CONSTRAINT device_sheets_sort_unique 
  UNIQUE (device_id, sort_order);
```

---

### 4. Thiếu Rollback Plan

**Vấn đề:** Nếu fix bị lỗi giữa chừng, làm sao rollback?

**Đề xuất thêm:**
```sql
-- TRƯỚC KHI FIX:
BEGIN;  -- Start transaction

-- ... apply fixes ...

-- Nếu có lỗi:
ROLLBACK;

-- Nếu OK:
COMMIT;

-- Với ALTER TABLE không rollback được → phải có backup:
-- pg_dump -t devices > backup_devices.sql
```

---

## 📋 ROADMAP FIX - PHIÊN BẢN CẢI THIỆN

### 🔴 Sprint 1 (CRITICAL) - ✅ ĐÚNG, BỔ SUNG THÊM

**Mục tiêu:** Fix 2 lỗi nghiêm trọng  
**Thời gian:** 30 phút - 1 giờ  
**Risk:** 🟢 LOW (nếu có backup và migration đúng)

#### Fix #1: Bỏ end_users.device_id

**✅ Logic đúng** - Đã có device_assignments rồi

**⚠️ CẦN BỔ SUNG:**
```sql
-- STEP 0: Backup
pg_dump -t end_users -t device_assignments > backup_sprint1.sql

-- STEP 1: Migrate data (SAFETY CHECK)
INSERT INTO device_assignments (device_id, end_user_id, assigned_at, user_id)
SELECT 
  eu.device_id, 
  eu.id, 
  eu.created_at,
  eu.user_id
FROM end_users eu
WHERE eu.device_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM device_assignments da 
    WHERE da.device_id = eu.device_id AND da.end_user_id = eu.id
  );

-- STEP 2: Verify migration thành công
SELECT 
  (SELECT COUNT(*) FROM end_users WHERE device_id IS NOT NULL) as old_count,
  (SELECT COUNT(*) FROM device_assignments WHERE returned_at IS NULL) as new_count;
-- old_count phải <= new_count

-- STEP 3: Update frontend code để query từ device_assignments
-- (Đợi frontend deploy xong)

-- STEP 4: Drop column
BEGIN;
ALTER TABLE end_users DROP CONSTRAINT end_users_device_id_fkey;
ALTER TABLE end_users DROP COLUMN device_id;
COMMIT;
```

#### Fix #2: device_assignments.user_id FK sai bảng

**✅ Hoàn toàn đúng** - Không cần sửa gì

```sql
ALTER TABLE device_assignments DROP CONSTRAINT device_assignments_user_id_fkey;
ALTER TABLE device_assignments ADD CONSTRAINT device_assignments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);
```

---

### 🟡 Sprint 2 (HIGH) - ⚠️ ĐÚNG NHƯNG CẦN ĐIỀU CHỈNH

**Mục tiêu:** Fix 4 lỗi high priority  
**Thời gian:** 4-6 giờ (bao gồm data cleaning)  
**Risk:** 🟡 MEDIUM-HIGH

#### HIGH #1: Thêm indexes - ✅ PERFECT

**Không cần sửa gì, chỉ BỔ SUNG thêm:**
```sql
-- Composite index cho query phổ biến
CREATE INDEX idx_assignments_active_lookup 
  ON device_assignments(end_user_id, returned_at, device_id)
  WHERE returned_at IS NULL;

-- Text search index (nếu cần)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_devices_name_trgm ON devices USING gin(name gin_trgm_ops);
CREATE INDEX idx_end_users_name_trgm ON end_users USING gin(full_name gin_trgm_ops);
```

#### HIGH #2: UNIQUE constraints - ⚠️ CẦN PRE-CHECK

**Thêm steps:**
```sql
-- STEP 1: Tìm duplicates
SELECT name, user_id, COUNT(*) as dup_count
FROM departments 
GROUP BY name, user_id 
HAVING COUNT(*) > 1;

-- STEP 2: Nếu có duplicates → merge (giữ record cũ nhất)
WITH duplicates AS (
  SELECT name, user_id, MIN(created_at) as first_created
  FROM departments
  GROUP BY name, user_id
  HAVING COUNT(*) > 1
),
keep_ids AS (
  SELECT d.id, d.name, d.user_id
  FROM departments d
  INNER JOIN duplicates dup 
    ON d.name = dup.name 
    AND d.user_id = dup.user_id
    AND d.created_at = dup.first_created
)
UPDATE end_users eu
SET department_id = k.id
FROM departments d
INNER JOIN keep_ids k ON d.name = k.name AND d.user_id = k.user_id
WHERE eu.department_id = d.id AND d.id != k.id;

-- Xóa duplicates
DELETE FROM departments d
WHERE EXISTS (
  SELECT 1 FROM keep_ids k
  WHERE d.name = k.name AND d.user_id = k.user_id AND d.id != k.id
);

-- STEP 3: Add constraint
ALTER TABLE departments ADD CONSTRAINT departments_name_user_unique 
  UNIQUE (name, user_id);

-- Repeat cho positions
```

#### HIGH #3: sort_order UNIQUE - ⚠️ CẦN RESET VALUES

```sql
-- STEP 1: Reset sort_order
WITH ranked AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY device_id ORDER BY created_at) - 1 as new_order
  FROM device_sheets
)
UPDATE device_sheets ds
SET sort_order = r.new_order
FROM ranked r
WHERE ds.id = r.id;

-- STEP 2: Verify
SELECT device_id, sort_order, COUNT(*)
FROM device_sheets
GROUP BY device_id, sort_order
HAVING COUNT(*) > 1;

-- STEP 3: Add constraint
ALTER TABLE device_sheets ADD CONSTRAINT device_sheets_sort_unique 
  UNIQUE (device_id, sort_order);
```

#### HIGH #4: ON DELETE policies - ❌ CẦN ĐIỀU CHỈNH

**Đúng:**
- device_sheets → CASCADE ✅
- activity_logs → SET NULL ✅
- device_assignments → CASCADE ✅

**SAI và cần bỏ:**
```sql
-- ❌ BỎ PHẦN NÀY:
-- ALTER TABLE end_users ALTER COLUMN department_id DROP NOT NULL;
-- ALTER TABLE end_users ALTER COLUMN position_id DROP NOT NULL;
```

**Giải pháp thay thế:**

**Option A: GIỮ NO ACTION (KHUYẾN NGHỊ)**
```sql
-- Không cho xóa department/position nếu còn end_users dùng
-- UI phải check trước:
SELECT COUNT(*) FROM end_users WHERE department_id = '<id_to_delete>';
-- Nếu > 0 → show warning: "Có X nhân viên thuộc phòng này"
```

**Option B: Soft Delete Cascade (Nâng cao)**
```sql
-- Trigger: xóa department → soft delete end_users
CREATE OR REPLACE FUNCTION cascade_soft_delete_department()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE end_users 
  SET deleted_at = now()
  WHERE department_id = OLD.id AND deleted_at IS NULL;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cascade_delete_department
  BEFORE DELETE ON departments
  FOR EACH ROW EXECUTE FUNCTION cascade_soft_delete_department();
```

**SQL fix cuối cùng:**
```sql
-- device_sheets: OK
ALTER TABLE device_sheets DROP CONSTRAINT device_sheets_device_id_fkey;
ALTER TABLE device_sheets ADD CONSTRAINT device_sheets_device_id_fkey
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

-- activity_logs: OK
ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_device_id_devices_id_fk;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_device_id_fk
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL;

ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_user_id_profiles_id_fk;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fk
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- device_assignments: OK
ALTER TABLE device_assignments DROP CONSTRAINT device_assignments_device_id_fkey;
ALTER TABLE device_assignments ADD CONSTRAINT device_assignments_device_id_fkey
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

ALTER TABLE device_assignments DROP CONSTRAINT device_assignments_end_user_id_fkey;
ALTER TABLE device_assignments ADD CONSTRAINT device_assignments_end_user_id_fkey
  FOREIGN KEY (end_user_id) REFERENCES end_users(id) ON DELETE CASCADE;

-- ❌ KHÔNG SET NULL cho department/position
-- Giữ nguyên NO ACTION hoặc implement soft delete trigger
```

---

### 🟠 Sprint 3 (MEDIUM/LOW) - ✅ TỐT

**Mục tiêu:** Fix 3 lỗi medium/low  
**Thời gian:** 1-2 giờ  
**Risk:** 🟢 LOW

#### MEDIUM #1: Trigger updated_at - ✅ HOÀN HẢO

Không cần sửa gì, chỉ thêm:
```sql
-- Thêm trigger cho device_assignments luôn
CREATE TRIGGER trg_device_assignments_updated
  BEFORE UPDATE ON device_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### MEDIUM #2: devices.code nullable - ✅ ĐÚNG

Nếu bắt buộc, format tốt hơn:
```sql
UPDATE devices 
SET code = 'DEV-' || to_char(created_at, 'YYYYMMDD') || '-' || LEFT(id::text, 8)
WHERE code IS NULL;
-- Example: DEV-20260216-a1b2c3d4
```

#### MEDIUM #3: activity_logs retention - ✅ ĐÚNG, BỔ SUNG

Thêm option partitioning cho scalability:
```sql
-- Option 1: pg_cron (đơn giản, đủ dùng)
SELECT cron.schedule(
  'archive-old-logs',
  '0 2 1 * *',
  $$DELETE FROM activity_logs WHERE created_at < now() - interval '6 months'$$
);

-- Option 2: Table partitioning (cho data rất lớn)
-- Tạo partitioned table, drop old partitions thay vì DELETE
```

#### LOW #1: device_assignments.notes - ✅ ĐÃ CÓ

Schema hiện tại đã có column `notes` rồi → không cần fix gì.

#### LOW #2: Rename user_id → assigned_by - ✅ TỐT

```sql
ALTER TABLE device_assignments RENAME COLUMN user_id TO assigned_by;

-- Update FK constraint name
ALTER TABLE device_assignments RENAME CONSTRAINT device_assignments_user_id_fkey 
  TO device_assignments_assigned_by_fkey;

-- Add comment
COMMENT ON COLUMN device_assignments.assigned_by IS 
  'Profile ID của người thực hiện assign, không phải người nhận device';
```

---

## 🎯 CHECKLIST TRƯỚC KHI FIX

### Preparation (QUAN TRỌNG!)

```bash
□ Backup full database
  pg_dump -Fc database_name > backup_$(date +%Y%m%d_%H%M%S).dump

□ Tạo staging environment giống production

□ Notify frontend team về breaking changes
  - end_users.device_id sẽ bị xóa
  - Query cần đổi sang device_assignments

□ Document tất cả queries hiện tại cần update

□ Check RLS policies có bị ảnh hưởng không

□ Chuẩn bị rollback script cho mỗi sprint
```

### Testing (SAU MỖI FIX)

```bash
□ Test tất cả queries chính
□ Verify data integrity (COUNT, JOIN check)
□ Performance test với sample data lớn
□ UI testing - tất cả features liên quan
□ Rollback test - đảm bảo có thể quay lại
```

---

## ⏱️ TIMELINE THỰC TẾ

| Sprint | Công việc | Thời gian ước tính |
|---|---|---|
| **Preparation** | Backup + setup staging | 30 phút |
| **Sprint 1** | Fix 2 CRITICAL | 1-2 giờ |
| **Testing 1** | Verify Sprint 1 | 30 phút - 1 giờ |
| **Sprint 2** | Fix 4 HIGH (bao gồm data cleaning) | 4-6 giờ |
| **Testing 2** | Verify Sprint 2 | 1-2 giờ |
| **Sprint 3** | Fix 3 MEDIUM/LOW | 1-2 giờ |
| **Testing 3** | Verify Sprint 3 | 30 phút |
| **TỔNG** | | **8-14 giờ** |

**Realistic timeline:** 2 working days (có buffer cho troubleshooting)

---

## 🎬 KẾT LUẬN CUỐI CÙNG

### Điểm số Roadmap: 8.5/10 ⭐⭐⭐⭐⭐⭐⭐⭐✰✰

### ✅ Những gì TỐT (giữ nguyên):
1. Sprint structure logic, priority đúng
2. SQL syntax đúng về mặt kỹ thuật
3. Indexes strategy excellent
4. Trigger patterns chuẩn
5. Giải thích rõ ràng, dễ hiểu

### ⚠️ Những gì CẦN ĐIỀU CHỈNH:
1. **HIGH #4 - ON DELETE policies:** Bỏ SET NULL cho department/position
2. **HIGH #2, #3:** Thêm pre-check và data cleaning steps
3. **Sprint 1:** Thêm migration verification steps
4. **Tổng thể:** Thêm backup strategy và rollback plan

### 🚀 RECOMMENDATION:

**FOLLOW ROADMAP NÀY** với những điều chỉnh đã nêu trên.

**Checklist áp dụng:**
✅ Đọc kỹ phần "ROADMAP FIX - PHIÊN BẢN CẢI THIỆN"  
✅ Làm theo ĐÚNG THỨ TỰ: Sprint 1 → 2 → 3  
✅ KHÔNG SKIP pre-check steps  
✅ Backup TRƯỚC KHI fix mỗi sprint  
✅ Test trên staging TRƯỚC production  
✅ Có rollback plan sẵn  

**Sau khi apply các điều chỉnh → Schema sẽ đạt 9.5/10 - PRODUCTION READY!** 🚀

---

## 📎 Phụ lục: Quick Reference

### Sprint 1 - CRITICAL (CẦN FIX NGAY)
```sql
-- 1. Bỏ end_users.device_id (sau khi migrate)
-- 2. Fix device_assignments.user_id FK
```

### Sprint 2 - HIGH (TUẦN NÀY)
```sql
-- 1. Thêm ALL indexes (performance boost lớn)
-- 2. UNIQUE cho departments/positions (sau khi merge duplicates)
-- 3. UNIQUE cho sort_order (sau khi reset values)
-- 4. ON DELETE policies (trừ department/position)
```

### Sprint 3 - MEDIUM/LOW (KHI RẢNHạn)
```sql
-- 1. Triggers updated_at
-- 2. Quyết định devices.code
-- 3. Retention policy cho activity_logs
-- 4. Rename user_id → assigned_by (optional)
```

---

**Prepared by:** Senior Database Architect  
**Date:** 16/02/2026  
**Version:** 1.0  
**Status:** Ready for Implementation ✅
