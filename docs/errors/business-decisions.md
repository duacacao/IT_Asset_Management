# Quyết định Business Logic - 4 Câu hỏi

**Ngày:** 16/02/2026  
**Project:** Device Management System  
**Mục đích:** Làm rõ các quyết định trước khi implement database fixes

---

## 📋 Bảng Quyết định Nhanh

| # | Câu hỏi | Khuyến nghị | Lý do |
|---|---|---|---|
| 1 | `devices.code` bắt buộc? | **Tùy công ty** | Có quy trình chặt → NOT NULL<br>Startup → Optional |
| 2 | ON DELETE dept/pos | **RESTRICT** | An toàn, giữ NOT NULL |
| 3 | Thêm `notes`? | **Đã có rồi!** | Schema v2 đã có |
| 4 | Rename `user_id`? | **RENAME** | Code clarity hơn |

---

## 📖 Chi tiết từng quyết định

### Câu 1: `devices.code` — Bắt buộc hay Optional?

**Hiện tại:** `code text UNIQUE` (nullable)

#### Option A: Bắt buộc (NOT NULL) ✅

**Phù hợp khi:**
- Công ty ĐÃ CÓ quy trình asset tagging
- Có quy định đánh mã thiết bị nghiêm ngặt
- Cần tracking chặt chẽ từng thiết bị

**Ưu điểm:**
- ✅ Mọi device đều có mã định danh
- ✅ Dễ báo cáo, tracking
- ✅ Match với asset tag vật lý

**Nhược điểm:**
- ❌ Phải generate code ngay khi tạo
- ❌ Cần temp code nếu chưa có asset tag

**SQL:**
```sql
-- Generate code cho devices chưa có
UPDATE devices 
SET code = 'DEV-' || to_char(COALESCE(created_at, now()), 'YYYYMMDD') || '-' || LEFT(id::text, 8)
WHERE code IS NULL;

-- Set NOT NULL
ALTER TABLE devices ALTER COLUMN code SET NOT NULL;
```

#### Option B: Optional (nullable) ✅

**Phù hợp khi:**
- Startup, quy trình chưa chặt chẽ
- Nhận thiết bị không đồng bộ
- Linh hoạt: tạo device trước, gán code sau

**Ưu điểm:**
- ✅ Linh hoạt workflow
- ✅ Không phải generate code ngay

**Nhược điểm:**
- ❌ Một số device không có code
- ❌ UI phải handle null

**SQL:**
```sql
-- Giữ nguyên như hiện tại
-- code text UNIQUE (nullable)
```

#### ⭐ Khuyến nghị cuối cùng:

```
Nếu công ty của bạn:
✅ ĐÃ CÓ quy trình quản lý tài sản       → NOT NULL
✅ Có kế hoạch scale lên, quản lý chặt    → NOT NULL
✅ Là startup, team nhỏ, chưa có quy trình → OPTIONAL
```

---

### Câu 2: ON DELETE cho dept/pos — SET NULL hay RESTRICT?

**Hiện tại:** `department_id/position_id NOT NULL`

#### Option A: SET NULL ❌ KHÔNG NÊN

**Logic:**
- Xóa department → `end_users.department_id = NULL`

**Vấn đề nghiêm trọng:**
- ❌ XUNG ĐỘT với NOT NULL constraint!
- ❌ Vi phạm business rule: nhân viên PHẢI thuộc phòng ban
- Phải DROP NOT NULL → làm suy yếu data integrity

#### Option B: RESTRICT (NO ACTION) ✅ KHUYẾN NGHỊ

**Logic:**
- KHÔNG cho xóa department nếu còn nhân viên
- Admin phải chuyển nhân viên sang dept khác TRƯỚC

**Ưu điểm:**
- ✅ Đơn giản, an toàn nhất
- ✅ Giữ được NOT NULL constraint
- ✅ Đảm bảo data integrity
- ✅ Workflow rõ ràng

**Nhược điểm:**
- ⚠️ Phải handle error khi admin cố xóa
- ⚠️ UI cần validate trước khi xóa

**Implementation:**

```sql
-- Backend: Giữ nguyên NO ACTION (default)
-- KHÔNG thêm ON DELETE SET NULL
```

```javascript
// Frontend: Check trước khi xóa
async function deleteDepartment(deptId) {
  // Check số nhân viên
  const count = await db
    .from('end_users')
    .count()
    .eq('department_id', deptId)
    .is('deleted_at', null);

  if (count > 0) {
    showError(`Không thể xóa. Có ${count} nhân viên thuộc phòng ban này.
                Vui lòng chuyển họ sang phòng ban khác trước.`);
    return;
  }

  // Proceed to delete
  await db.from('departments').delete().eq('id', deptId);
}
```

#### Option C: CASCADE Soft Delete ⚠️ Phức tạp

**Logic:**
- Xóa department → soft delete tất cả end_users

**Khi nào dùng:**
- Khi nhân viên và phòng ban gắn chặt
- Xóa phòng = giải tán team

**Nhược điểm:**
- ❌ Rủi ro cao: xóa nhầm dept → mất hàng loạt user
- ❌ Cần trigger phức tạp

#### ⭐ Quyết định cuối cùng:

```
CHỌN OPTION B: RESTRICT (NO ACTION)

- Đơn giản
- An toàn
- Workflow rõ ràng
- Không vi phạm NOT NULL constraint
```

---

### Câu 3: Thêm `notes` cho `device_assignments`?

#### ⚠️ KIỂM TRA SCHEMA

**Schema v2 hiện tại:**
```sql
CREATE TABLE device_assignments (
  id uuid PRIMARY KEY,
  device_id uuid NOT NULL,
  end_user_id uuid NOT NULL,
  user_id uuid NOT NULL,
  assigned_at timestamptz NOT NULL,
  returned_at timestamptz,
  created_at timestamptz NOT NULL,
  notes text  ← ĐÃ CÓ RỒI!
);
```

#### ✅ Kết luận: KHÔNG CẦN FIX GÌ

Schema đã có column `notes`!

**Nếu production database chưa có:**
```sql
ALTER TABLE device_assignments ADD COLUMN notes text;
```

**Use case cho notes:**
```
- "Nhân viên mới onboarding"
- "Thay thế laptop cũ bị hỏng"
- "Upgrade cho dự án ABC"
- "Điều chuyển sang chi nhánh Đà Nẵng"
```

---

### Câu 4: Rename `user_id` → `assigned_by`?

**Hiện tại:** `device_assignments.user_id` → profiles(id)  
**Ý nghĩa:** Người thực hiện assign (admin/manager)

#### Option A: Giữ nguyên `user_id` ❌

**Ưu điểm:**
- ✅ Không breaking change
- ✅ Không phải sửa code

**Nhược điểm:**
- ❌ Tên không rõ nghĩa
- ❌ Dễ nhầm với `end_user_id`
- ❌ Code khó đọc

#### Option B: Rename → `assigned_by` ✅ KHUYẾN NGHỊ

**Ưu điểm:**
- ✅ Tên rõ ràng: "Ai thực hiện assign?"
- ✅ Code dễ đọc, maintain
- ✅ Tránh nhầm lẫn
- ✅ Self-documenting code

**Nhược điểm:**
- ⚠️ Phải update frontend code
- ⚠️ Breaking change

**Impact assessment:**
```
Chỉ ảnh hưởng:
- 1 table: device_assignments
- 1 column: user_id
- Frontend: GraphQL/REST queries liên quan

Không ảnh hưởng:
- Các table khác vẫn dùng user_id
- Database logic không thay đổi
```

**Implementation:**

```sql
-- Step 1: Rename column
ALTER TABLE device_assignments RENAME COLUMN user_id TO assigned_by;

-- Step 2: Rename FK constraint (cho consistent)
ALTER TABLE device_assignments 
RENAME CONSTRAINT device_assignments_user_id_fkey 
TO device_assignments_assigned_by_fkey;

-- Step 3: Add comment
COMMENT ON COLUMN device_assignments.assigned_by IS 
  'Profile ID của admin/manager thực hiện assign device, không phải end_user nhận device';
```

**Frontend changes:**
```javascript
// BEFORE:
const { data } = await supabase
  .from('device_assignments')
  .select('device_id, end_user_id, user_id')
  .eq('end_user_id', userId);

// AFTER:
const { data } = await supabase
  .from('device_assignments')
  .select('device_id, end_user_id, assigned_by')
  .eq('end_user_id', userId);
```

```graphql
# BEFORE:
query GetAssignments {
  device_assignments {
    device_id
    end_user_id
    user_id
  }
}

# AFTER:
query GetAssignments {
  device_assignments {
    device_id
    end_user_id
    assigned_by
  }
}
```

#### ⭐ Quyết định cuối cùng:

```
CHỌN OPTION B: RENAME → assigned_by

Lý do:
- Code clarity > Short-term convenience
- Rename 1 lần, clear mãi mãi
- Impact nhỏ (1 table, dễ fix frontend)
- Improve long-term maintainability
```

---

## 🎯 Tổng kết & Action Items

### Quyết định cuối cùng:

| # | Quyết định | SQL Required | Frontend Impact |
|---|---|---|---|
| 1 | **devices.code** | Tùy chọn (NOT NULL hoặc giữ nguyên) | Không |
| 2 | **ON DELETE** | KHÔNG làm gì (giữ RESTRICT) | Thêm validation |
| 3 | **notes** | Đã có, không cần fix | Không |
| 4 | **assigned_by** | RENAME column | Update queries |

---

### Checklist Implementation:

#### 🔴 Bắt buộc:
```
□ Quyết định câu 1: devices.code bắt buộc hay không?
□ Câu 2: Implement UI validation cho delete department/position
□ Câu 3: Verify production có column notes chưa
□ Câu 4: Coordinate với frontend team để rename user_id
```

#### 🟡 Khuyến nghị:
```
□ Nếu chọn NOT NULL cho code: Generate code cho existing devices
□ Document convention đặt tên code (DEV-YYYYMMDD-xxxx)
□ Update GraphQL schema nếu dùng
□ Update API documentation
```

---

## 📝 SQL Script Tổng hợp

Dựa trên các khuyến nghị, đây là script OPTIONAL bạn có thể chạy:

```sql
-- ====================================
-- OPTIONAL FIX #1: devices.code NOT NULL
-- (Chỉ chạy nếu quyết định bắt buộc code)
-- ====================================

-- Generate code cho devices chưa có
UPDATE devices 
SET code = 'DEV-' || to_char(COALESCE(created_at, now()), 'YYYYMMDD') || '-' || LEFT(id::text, 8)
WHERE code IS NULL;

-- Set NOT NULL
ALTER TABLE devices ALTER COLUMN code SET NOT NULL;


-- ====================================
-- FIX #2: ON DELETE for dept/pos
-- (KHÔNG LÀM GÌ - giữ nguyên NO ACTION)
-- ====================================
-- Implement validation ở frontend thay vì database


-- ====================================
-- FIX #3: notes column
-- (Đã có rồi, verify thôi)
-- ====================================
-- Verify:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'device_assignments' 
  AND column_name = 'notes';

-- Nếu không có thì thêm:
-- ALTER TABLE device_assignments ADD COLUMN notes text;


-- ====================================
-- FIX #4: Rename user_id → assigned_by
-- (KHUYẾN NGHỊ thực hiện)
-- ====================================

ALTER TABLE device_assignments RENAME COLUMN user_id TO assigned_by;

ALTER TABLE device_assignments 
RENAME CONSTRAINT device_assignments_user_id_fkey 
TO device_assignments_assigned_by_fkey;

COMMENT ON COLUMN device_assignments.assigned_by IS 
  'Profile ID của admin/manager thực hiện assign device';
```

---

## 💡 Khuyến nghị của Database Architect

### Độ ưu tiên thực hiện:

**P0 - Quyết định ngay:**
1. Câu 1: Code bắt buộc hay không? (ảnh hưởng workflow)

**P1 - Implement trong Sprint 2:**
1. Câu 2: UI validation cho delete dept/pos
2. Câu 4: Rename assigned_by (improve code quality)

**P2 - Verify:**
1. Câu 3: Check production có notes chưa

---

### Risk Assessment:

| Quyết định | Risk | Mitigation |
|---|---|---|
| Code NOT NULL | 🟡 MEDIUM | Generate code trước, test kỹ |
| RESTRICT dept/pos | 🟢 LOW | Chỉ cần UI validation |
| Add notes | 🟢 LOW | Đã có rồi |
| Rename assigned_by | 🟡 MEDIUM | Coordinate frontend team |

---

**Chuẩn bị bởi:** Senior Database Architect  
**Ngày:** 16/02/2026  
**Version:** 1.0  
**Status:** Đang chờ quyết định từ team ⏳
