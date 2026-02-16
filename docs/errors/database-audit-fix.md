# Database Schema Audit - Device Management System

**Ngày audit:** 15/02/2026  
**Hệ thống:** Device Asset Management trên Supabase (PostgreSQL)  
**Số bảng:** 7 (profiles, devices, end_users, departments, positions, device_sheets, activity_logs)  
**Người review:** Database Designer với 10 năm kinh nghiệm

---

## 🔴 CRITICAL — Fix ngay, đang gây bug hoặc sẽ gây bug

### Lỗi #1: Circular Reference `devices` ↔ `end_users`

**Hiện trạng:**
```
devices.end_user_id  →  end_users.id   (UNIQUE)
end_users.device_id  →  devices.id     (UNIQUE)
```

Hai bảng trỏ vòng tròn vào nhau, cả hai đều UNIQUE — tức cùng lưu một thông tin (device A gắn với end_user B) ở hai nơi.

**Hậu quả trên UI:**
- Khi gán device cho end_user, phải UPDATE cả 2 bảng cùng lúc. Nếu 1 cái fail → data lệch
- Frontend query `devices LEFT JOIN end_users` — dùng FK nào? Hai đường JOIN có thể cho kết quả khác nhau
- INSERT mới gặp chicken-and-egg problem: tạo device trước thì chưa có end_user_id, tạo end_user trước thì chưa có device_id

**Fix:**
```sql
-- Bước 1: Bỏ FK và cột end_user_id khỏi devices
ALTER TABLE devices DROP CONSTRAINT fk_devices_end_user;
ALTER TABLE devices DROP COLUMN end_user_id;

-- Bước 2: Giữ lại end_users.device_id làm nguồn sự thật duy nhất
-- Khi cần tìm end_user của device:
-- SELECT * FROM end_users WHERE device_id = '<device_id>';

-- Khi cần hiển thị device kèm end_user trên UI:
-- SELECT d.*, eu.full_name as end_user_name
-- FROM devices d
-- LEFT JOIN end_users eu ON eu.device_id = d.id;
```

---

### Lỗi #2: Dữ liệu trùng lặp — `department` text vs `department_id` FK

**Hiện trạng trong `end_users`:**
```
department    text        ← cột cũ, lưu tên phòng ban dạng text tự do
department_id uuid → departments(id)  ← cột mới, FK đúng chuẩn
position      text        ← cột cũ
position_id   uuid → positions(id)    ← cột mới
```

**Hậu quả trên UI:**
- UI hiển thị phòng ban — lấy từ cột nào? Nếu `department = "IT"` nhưng `department_id` trỏ tới record `name = "Công nghệ thông tin"` → UI hiển thị sai
- Khi filter end_users theo department trên UI, filter bằng text hay bằng FK? Hai cách cho kết quả khác nhau
- Khi admin đổi tên department trong bảng `departments`, cột text ở `end_users` không tự cập nhật

**Fix:**
```sql
-- Bước 1: Migrate data text sang FK (nếu chưa)
UPDATE end_users eu
SET department_id = d.id
FROM departments d
WHERE eu.department = d.name
  AND eu.department_id IS NULL;

UPDATE end_users eu
SET position_id = p.id
FROM positions p
WHERE eu.position = p.name
  AND eu.position_id IS NULL;

-- Bước 2: Sau khi verify data đã migrate hết
ALTER TABLE end_users DROP COLUMN department;
ALTER TABLE end_users DROP COLUMN position;

-- Bước 3: Bắt buộc FK phải có giá trị
ALTER TABLE end_users ALTER COLUMN department_id SET NOT NULL;
ALTER TABLE end_users ALTER COLUMN position_id SET NOT NULL;
```

---

### Lỗi #3: Quan hệ Device ↔ End User là 1:1 — Sai thực tế

**Hiện trạng:**
`end_users.device_id` là UNIQUE → 1 end_user chỉ gán được đúng 1 device.

**Hậu quả trên UI:**
- Nhân viên Nguyễn Văn A dùng laptop + monitor + chuột → chỉ gán được 1 cái, 2 cái còn lại không có người dùng trên UI
- Khi thiết bị được chuyển giao cho người khác → phải xóa record cũ → mất lịch sử ai đã từng dùng thiết bị
- UI không thể hiển thị "Lịch sử sử dụng thiết bị" vì không có data

**Fix — Tạo bảng trung gian `device_assignments`:**
```sql
-- Bước 1: Tạo bảng gán thiết bị
CREATE TABLE device_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES devices(id),
  end_user_id uuid NOT NULL REFERENCES end_users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  returned_at timestamptz DEFAULT NULL,  -- NULL = đang sử dụng
  assigned_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index để query nhanh
CREATE INDEX idx_assignments_device ON device_assignments(device_id);
CREATE INDEX idx_assignments_end_user ON device_assignments(end_user_id);
CREATE INDEX idx_assignments_active ON device_assignments(device_id) 
  WHERE returned_at IS NULL;  -- Partial index: chỉ index record đang active

-- Bước 2: Migrate data cũ
INSERT INTO device_assignments (device_id, end_user_id, assigned_at)
SELECT device_id, id, created_at
FROM end_users
WHERE device_id IS NOT NULL;

-- Bước 3: Bỏ device_id khỏi end_users
ALTER TABLE end_users DROP CONSTRAINT end_users_device_id_fkey;
ALTER TABLE end_users DROP COLUMN device_id;

-- Query mẫu:
-- Ai đang dùng device X?
-- SELECT eu.* FROM device_assignments da
-- JOIN end_users eu ON eu.id = da.end_user_id
-- WHERE da.device_id = '<id>' AND da.returned_at IS NULL;

-- Device nào đang gán cho user Y?
-- SELECT d.* FROM device_assignments da
-- JOIN devices d ON d.id = da.device_id
-- WHERE da.end_user_id = '<id>' AND da.returned_at IS NULL;
```

---

## 🟡 HIGH — Ảnh hưởng hiệu suất và tính toàn vẹn dữ liệu

### Lỗi #4: Thiếu INDEX trên toàn bộ FK columns

**Hiện trạng:** 
PostgreSQL KHÔNG tự tạo index cho FK. Chỉ PK và UNIQUE mới có index tự động.

**Hậu quả trên UI:**
- Mỗi lần UI load danh sách devices kèm owner → `JOIN profiles` → full table scan
- Khi `activity_logs` có vài chục ngàn dòng, query log theo device hoặc theo thời gian sẽ chậm dần
- Supabase realtime subscription filter theo FK cũng bị ảnh hưởng

**Fix:**
```sql
-- devices
CREATE INDEX idx_devices_owner_id ON devices(owner_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_type ON devices(type);

-- end_users
CREATE INDEX idx_end_users_user_id ON end_users(user_id);
CREATE INDEX idx_end_users_department_id ON end_users(department_id);
CREATE INDEX idx_end_users_position_id ON end_users(position_id);

-- device_sheets
CREATE INDEX idx_device_sheets_device_id ON device_sheets(device_id);

-- activity_logs (bảng sẽ lớn nhất)
CREATE INDEX idx_activity_logs_device_id ON activity_logs(device_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- departments & positions
CREATE INDEX idx_departments_user_id ON departments(user_id);
CREATE INDEX idx_positions_user_id ON positions(user_id);
```

---

### Lỗi #5: `devices.status` và `devices.type` không có constraint

**Hiện trạng:** 
Cả hai là `text` tự do — không giới hạn giá trị.

**Hậu quả trên UI:**
- User nhập `"Active"`, `"active"`, `"ACTIVE"`, `"hoạt động"` → UI filter theo status sẽ miss record vì string comparison case-sensitive
- Dropdown filter trên UI hiển thị 5 biến thể của cùng 1 status → UX rối
- Frontend phải tự validate → dễ bị bypass, data bẩn vẫn vào DB

**Fix:**
```sql
-- Chuẩn hóa data trước
UPDATE devices SET status = lower(trim(status));
UPDATE devices SET type = lower(trim(type));

-- Thêm constraint
ALTER TABLE devices ADD CONSTRAINT devices_status_check
  CHECK (status IN ('active', 'inactive', 'maintenance', 'retired', 'disposed'));

ALTER TABLE devices ADD CONSTRAINT devices_type_check
  CHECK (type IN ('laptop', 'desktop', 'monitor', 'printer', 'phone', 'tablet', 'network', 'peripheral', 'other'));
```

---

### Lỗi #6: Timestamp không nhất quán — mix `timestamptz` và `timestamp`

**Hiện trạng:**

| Bảng | Kiểu dùng |
|---|---|
| `profiles` | `timestamp WITHOUT time zone` ❌ |
| `devices` | `timestamp WITHOUT time zone` ❌ |
| `activity_logs` | `timestamp WITHOUT time zone` ❌ |
| `departments` | `timestamp WITH time zone` ✅ |
| `positions` | `timestamp WITH time zone` ✅ |
| `end_users` | `timestamp WITH time zone` ✅ |
| `device_sheets` | `timestamp WITH time zone` ✅ |

**Hậu quả trên UI:**
- Khi UI hiển thị "Thiết bị tạo lúc 14:00" — đó là 14:00 giờ gì? UTC? ICT (GMT+7)? Không biết
- Nếu server Supabase ở UTC, `now()` trả về giờ UTC → UI ở Việt Nam hiển thị thời gian sai 7 tiếng
- Khi JOIN giữa bảng dùng `timestamptz` và bảng dùng `timestamp` → so sánh thời gian không chính xác

**Fix:**
```sql
-- Đổi tất cả sang timestamptz
ALTER TABLE profiles 
  ALTER COLUMN created_at TYPE timestamptz,
  ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE devices 
  ALTER COLUMN created_at TYPE timestamptz,
  ALTER COLUMN updated_at TYPE timestamptz,
  ALTER COLUMN purchase_date TYPE timestamptz,
  ALTER COLUMN warranty_exp TYPE timestamptz;

ALTER TABLE activity_logs 
  ALTER COLUMN created_at TYPE timestamptz;
```

---

### Lỗi #7: `profiles.role` không có constraint

**Hiện trạng:** 
`role text DEFAULT 'user'` — text tự do.

**Hậu quả trên UI:**
- RLS policy hoặc frontend check `role = 'admin'` → nếu ai đó set `role = 'Admin'` (viết hoa) → bypass permission check
- Là lỗ hổng bảo mật nếu role dùng để phân quyền

**Fix:**
```sql
UPDATE profiles SET role = lower(trim(role));

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'user'));
```

---

### Lỗi #8: `end_users.user_id` — Thiếu NOT NULL

**Hiện trạng:** 
`user_id uuid` — nullable. Cột này là FK đến `profiles`, dùng cho multi-tenant.

**Hậu quả trên UI:**
- Nếu `user_id = NULL` → RLS policy dạng `WHERE user_id = auth.uid()` sẽ không bao giờ match record đó
- Record "biến mất" trên UI, không ai thấy, không ai sửa được
- Orphan record nằm trong DB mà không thuộc về ai

**Fix:**
```sql
-- Check xem có record nào NULL không
-- SELECT * FROM end_users WHERE user_id IS NULL;

-- Fix orphan records trước (gán cho admin hoặc owner)
-- UPDATE end_users SET user_id = '<admin_profile_id>' WHERE user_id IS NULL;

ALTER TABLE end_users ALTER COLUMN user_id SET NOT NULL;
```

---

## 🟠 MEDIUM — Ảnh hưởng khả năng mở rộng và bảo trì

### Lỗi #9: `activity_logs` không có chiến lược quản lý dung lượng

**Hiện trạng:** 
Bảng log chỉ có INSERT, không bao giờ DELETE. ID là `integer` sequence.

**Hậu quả trên UI:**
- Sau 6 tháng - 1 năm, bảng có thể lên hàng trăm ngàn — hàng triệu dòng
- UI load "Activity History" sẽ ngày càng chậm
- Nếu không có index trên `created_at`, query theo khoảng thời gian = full scan

**Fix:**
```sql
-- Tạo policy auto-archive log cũ hơn 6 tháng (dùng pg_cron)
SELECT cron.schedule(
  'archive-old-logs',
  '0 2 1 * *',  -- chạy 2h sáng ngày 1 hàng tháng
  $$DELETE FROM activity_logs WHERE created_at < now() - interval '6 months'$$
);

-- Hoặc partitioning theo tháng (phức tạp hơn, dùng khi data rất lớn)
```

---

### Lỗi #10: Thiếu Soft Delete trên các bảng chính

**Hiện trạng:** 
Không có `deleted_at` ở bảng nào. Xóa = mất vĩnh viễn.

**Hậu quả trên UI:**
- Admin xóa nhầm device → không thể khôi phục
- Xóa end_user → `activity_logs` có `user_id` trỏ tới record không còn tồn tại → UI hiển thị "Unknown user"
- Không có chức năng "Thùng rác" hoặc "Undo" trên UI

**Fix:**
```sql
ALTER TABLE devices ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE end_users ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE departments ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE positions ADD COLUMN deleted_at timestamptz DEFAULT NULL;

-- Partial index: chỉ index record chưa xóa (query nhanh hơn)
CREATE INDEX idx_devices_active ON devices(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_end_users_active ON end_users(id) WHERE deleted_at IS NULL;

-- Tất cả query trên UI phải thêm: WHERE deleted_at IS NULL
-- Hoặc tạo VIEW:
CREATE VIEW active_devices AS
  SELECT * FROM devices WHERE deleted_at IS NULL;

CREATE VIEW active_end_users AS
  SELECT * FROM end_users WHERE deleted_at IS NULL;
```

---

### Lỗi #11: `departments` và `positions` thiếu UNIQUE constraint trên `(name, user_id)`

**Hiện trạng:** 
`name text NOT NULL` — không UNIQUE.

**Hậu quả trên UI:**
- User tạo 2 department đều tên "IT" → dropdown hiển thị 2 cái "IT" → không biết chọn cái nào
- Khi filter end_user theo department, kết quả thiếu vì một nửa gán vào "IT" #1, nửa kia gán vào "IT" #2

**Fix:**
```sql
-- Xử lý duplicate trước (merge records trùng, update FK ở end_users)

ALTER TABLE departments ADD CONSTRAINT departments_name_user_unique 
  UNIQUE (name, user_id);

ALTER TABLE positions ADD CONSTRAINT positions_name_user_unique 
  UNIQUE (name, user_id);
```

---

### Lỗi #12: `device_sheets.sort_order` không có UNIQUE constraint theo scope

**Hiện trạng:** 
`sort_order integer DEFAULT 0` — tất cả sheet mới đều có sort_order = 0.

**Hậu quả trên UI:**
- 5 sheets của cùng 1 device đều có `sort_order = 0` → thứ tự hiển thị không xác định, mỗi lần load có thể khác nhau
- User kéo thả sắp xếp tab sheet → nhưng DB không enforce thứ tự → race condition khi 2 user sắp xếp cùng lúc

**Fix:**
```sql
-- Thêm unique constraint cho sort_order trong scope device
ALTER TABLE device_sheets ADD CONSTRAINT device_sheets_sort_unique 
  UNIQUE (device_id, sort_order);

-- Hoặc nếu dùng fractional indexing (linh hoạt hơn):
-- ALTER TABLE device_sheets ALTER COLUMN sort_order TYPE float;
```

---

### Lỗi #13: `devices.code` là UNIQUE nhưng nullable

**Hiện trạng:** 
`code text UNIQUE` — cho phép NULL. PostgreSQL cho phép nhiều NULL trong UNIQUE column.

**Hậu quả trên UI:**
- Nhiều devices không có mã code → UI hiển thị ô trống, không phân biệt được
- Nếu `code` dùng làm mã tài sản (asset tag) thì phải bắt buộc có

**Fix:**
```sql
-- Nếu code là bắt buộc:
UPDATE devices SET code = 'DEV-' || LEFT(id::text, 8) WHERE code IS NULL;
ALTER TABLE devices ALTER COLUMN code SET NOT NULL;

-- Nếu code là optional thì giữ nguyên (PostgreSQL đã handle đúng)
```

---

## 🟢 LOW — Cải thiện chất lượng code và maintainability

### Lỗi #14: `activity_logs.action` và `details` không có constraint

**Hiện trạng:** 
Cả hai là `text` tự do.

**Hậu quả trên UI:**
- Không thể filter log theo loại action một cách đáng tin cậy
- `action` có thể là `"create"`, `"CREATE"`, `"tạo mới"`, `"device_created"` → filter sai

**Fix:**
```sql
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_action_check
  CHECK (action IN (
    'device_created', 'device_updated', 'device_deleted',
    'device_assigned', 'device_returned',
    'end_user_created', 'end_user_updated', 'end_user_deleted',
    'sheet_created', 'sheet_updated', 'sheet_deleted'
  ));
```

---

### Lỗi #15: `profiles` thiếu UNIQUE constraint trên `email`

**Hiện trạng:** 
`email text NOT NULL` — không UNIQUE.

**Hậu quả:** 
Về lý thuyết có thể có 2 profiles cùng email. Tuy Supabase `auth.users` đã UNIQUE email, nhưng defense-in-depth nên thêm.

**Fix:**
```sql
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
```

---

### Lỗi #16: `device_sheets` thiếu `updated_at`

**Hiện trạng:** 
Chỉ có `created_at`, không có `updated_at`.

**Hậu quả trên UI:**
- Không biết sheet được chỉnh sửa lần cuối lúc nào
- Không thể hiển thị "Cập nhật lần cuối: 2 phút trước"
- Conflict resolution khi 2 user edit cùng lúc → không biết ai sửa sau

**Fix:**
```sql
ALTER TABLE device_sheets ADD COLUMN updated_at timestamptz DEFAULT now();

-- Trigger tự cập nhật
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_device_sheets_updated
  BEFORE UPDATE ON device_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Nên áp dụng trigger này cho TẤT CẢ bảng có updated_at:
CREATE TRIGGER trg_devices_updated
  BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_end_users_updated
  BEFORE UPDATE ON end_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### Lỗi #17: `departments` và `positions` thiếu `updated_at`

**Hiện trạng:** 
Chỉ có `created_at`.

**Fix:**
```sql
ALTER TABLE departments ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE positions ADD COLUMN updated_at timestamptz DEFAULT now();

CREATE TRIGGER trg_departments_updated
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_positions_updated
  BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### Lỗi #18: Thiếu ON DELETE policy trên FK

**Hiện trạng:** 
Tất cả FK đều dùng default behavior — `NO ACTION`. Tức xóa parent → error nếu còn child.

**Hậu quả:** 
Xóa department → lỗi vì `end_users.department_id` đang trỏ tới → UI báo lỗi khó hiểu.

**Fix — Tùy logic nghiệp vụ:**
```sql
-- Option A: SET NULL khi xóa parent
ALTER TABLE end_users DROP CONSTRAINT end_users_department_id_fkey;
ALTER TABLE end_users ADD CONSTRAINT end_users_department_id_fkey
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE end_users DROP CONSTRAINT end_users_position_id_fkey;
ALTER TABLE end_users ADD CONSTRAINT end_users_position_id_fkey
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL;

-- Option B: CASCADE xóa theo (cho bảng phụ thuộc hoàn toàn)
ALTER TABLE device_sheets DROP CONSTRAINT device_sheets_device_id_fkey;
ALTER TABLE device_sheets ADD CONSTRAINT device_sheets_device_id_fkey
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

-- activity_logs nên SET NULL (giữ log, chỉ mất reference)
ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_device_id_devices_id_fk;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_device_id_fk
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL;

ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_user_id_profiles_id_fk;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fk
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
```

---

## 📊 Checklist Tổng hợp

| # | Mức độ | Tên lỗi | Bảng ảnh hưởng | Ưu tiên |
|---|---|---|---|---|
| 1 | 🔴 CRITICAL | Circular FK devices ↔ end_users | `devices`, `end_users` | P0 |
| 2 | 🔴 CRITICAL | Trùng lặp department/position text + FK | `end_users` | P0 |
| 3 | 🔴 CRITICAL | Quan hệ 1:1 sai, cần bảng `device_assignments` | `devices`, `end_users` | P0 |
| 4 | 🟡 HIGH | Thiếu INDEX trên tất cả FK columns | Toàn bộ | P1 |
| 5 | 🟡 HIGH | `status`/`type` không có CHECK constraint | `devices` | P1 |
| 6 | 🟡 HIGH | Timestamp mix `timestamptz` vs `timestamp` | 3 bảng | P1 |
| 7 | 🟡 HIGH | `profiles.role` không có constraint | `profiles` | P1 |
| 8 | 🟡 HIGH | `end_users.user_id` nullable → orphan data | `end_users` | P1 |
| 9 | 🟠 MEDIUM | `activity_logs` không có retention policy | `activity_logs` | P2 |
| 10 | 🟠 MEDIUM | Thiếu soft delete (`deleted_at`) | 4 bảng chính | P2 |
| 11 | 🟠 MEDIUM | `departments`/`positions` name không UNIQUE per user | 2 bảng | P2 |
| 12 | 🟠 MEDIUM | `sort_order` mặc định 0, không unique per device | `device_sheets` | P2 |
| 13 | 🟠 MEDIUM | `devices.code` nullable nhưng UNIQUE | `devices` | P2 |
| 14 | 🟢 LOW | `activity_logs.action` không có constraint | `activity_logs` | P3 |
| 15 | 🟢 LOW | `profiles.email` thiếu UNIQUE | `profiles` | P3 |
| 16 | 🟢 LOW | `device_sheets` thiếu `updated_at` | `device_sheets` | P3 |
| 17 | 🟢 LOW | `departments`/`positions` thiếu `updated_at` | 2 bảng | P3 |
| 18 | 🟢 LOW | Thiếu ON DELETE policy trên FK | Toàn bộ FK | P3 |

---

## 🎯 Thứ tự thực hiện

1. **Migration 1 (CRITICAL):** Lỗi #1, #2, #3 — phải làm cùng nhau vì cùng ảnh hưởng quan hệ devices-end_users
2. **Migration 2 (HIGH):** Lỗi #4, #5, #6, #7, #8 — cải thiện performance và data integrity
3. **Migration 3 (MEDIUM):** Lỗi #9-13 — cải thiện scalability
4. **Migration 4 (LOW):** Lỗi #14-18 — polish và maintainability

---

## 📝 Ghi chú quan trọng

- **Lỗi #1-3** là nghiêm trọng nhất, ảnh hưởng trực tiếp đến logic nghiệp vụ và data consistency
- **Lỗi #4** (thiếu index) sẽ ảnh hưởng hiệu suất nghiêm trọng khi data tăng lên
- **Lỗi #10** (soft delete) nên làm sớm để tránh mất data không thể phục hồi
- Tất cả migration nên test kỹ trên staging trước khi chạy production
- Backup database đầy đủ trước khi chạy migration

---

**Tổng số lỗi:** 18  
**Phân loại:** 3 Critical | 5 High | 5 Medium | 5 Low
