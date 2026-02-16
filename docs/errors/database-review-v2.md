# Database Schema Review v2 - Sau khi sửa

**Ngày review:** 16/02/2026  
**Hệ thống:** Device Asset Management trên Supabase (PostgreSQL)  
**Schema version:** v2 (đã sửa một số lỗi)

---

## 🎉 ĐIỂM MẠNH - ĐÃ FIX ĐƯỢC

Bạn đã fix rất tốt những vấn đề sau:

✅ **Timestamp nhất quán:** Tất cả đã là `timestamptz` (WITH time zone)  
✅ **Data constraints:** profiles.role, devices.status/type, activity_logs.action đã có CHECK  
✅ **Soft delete:** Đã có `deleted_at` trên devices, end_users, departments, positions  
✅ **Updated tracking:** Đã có `updated_at` trên departments, positions, device_sheets  
✅ **Data integrity:** profiles.email UNIQUE, end_users.user_id NOT NULL  
✅ **Bỏ data trùng lặp:** end_users đã bỏ department/position text columns  
✅ **Bảng device_assignments:** Đã tạo thành công - đây là fix quan trọng nhất!  
✅ **FK đúng:** end_users.department_id và position_id đã NOT NULL

**Điểm số cải thiện:** 10/18 lỗi đã được fix ✅

---

## 🔴 VẤN ĐỀ NGHIÊM TRỌNG CÒN LẠI (2 lỗi)

### ❌ CRITICAL #1: end_users VẪN CÓ device_id (XUNG ĐỘT!)

**Vấn đề:**
Bạn đã tạo `device_assignments` (đúng) NHƯNG vẫn giữ `end_users.device_id` UNIQUE.

Điều này gây **XUNG ĐỘT LOGIC**:
```
device_assignments: 1 end_user → N devices (đúng)
end_users.device_id: 1 end_user → 1 device (sai)
```

**Hậu quả trên UI:**
- UI không biết lấy data từ đâu: `end_users.device_id` hay `device_assignments`?
- Data có thể lệch: 
  - `device_assignments` nói user A dùng device X, Y, Z
  - `end_users.device_id` chỉ lưu được device X
  - → Mất data device Y, Z trên UI
- Frontend developer phải query 2 nguồn và merge → phức tạp, dễ bug

**Giải pháp:**
```sql
-- Bỏ luôn cột device_id khỏi end_users
ALTER TABLE end_users DROP CONSTRAINT end_users_device_id_fkey;
ALTER TABLE end_users DROP COLUMN device_id;

-- Từ giờ chỉ dùng device_assignments để track device-user relationship
-- Query: Device nào đang được gán cho user X?
-- SELECT d.* FROM device_assignments da
-- JOIN devices d ON d.id = da.device_id
-- WHERE da.end_user_id = '<user_id>' AND da.returned_at IS NULL;
```

---

### ❌ CRITICAL #2: device_assignments.user_id trỏ sai bảng

**Vấn đề:**
```sql
device_assignments.user_id → auth.users(id)  ❌
activity_logs.user_id → profiles(id)  ✅
departments.user_id → profiles(id)  ✅
```

**Tại sao sai:**
- `auth.users` là bảng internal của Supabase Auth
- `profiles` là bảng application của bạn, extend auth.users
- Các bảng khác đều FK → profiles, chỉ có device_assignments FK → auth.users → **không nhất quán**
- `profiles.id` FK tới `auth.users.id` (1:1) nên nên reference profiles

**Giải pháp:**
```sql
ALTER TABLE device_assignments DROP CONSTRAINT device_assignments_user_id_fkey;
ALTER TABLE device_assignments ADD CONSTRAINT device_assignments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);
```

---

## 🟡 HIGH PRIORITY - CẦN FIX SỚM (4 lỗi)

### HIGH #1: THIẾU INDEXES trên tất cả FK columns ⚠️

**Vấn đề:** PostgreSQL **KHÔNG tự tạo index cho FK**. Chỉ PK và UNIQUE mới có index tự động.

**Hậu quả nghiêm trọng:**
- Mỗi lần UI load danh sách devices kèm owner → `JOIN profiles` → **full table scan**
- Query activity_logs theo device/user → **rất chậm** khi có vài chục ngàn dòng
- Khi có 1000+ devices, UI sẽ **lag nặng**

**Mức độ ảnh hưởng:** ⭐⭐⭐⭐⭐ (Performance killer)

**Fix:**
```sql
-- devices
CREATE INDEX idx_devices_owner_id ON devices(owner_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_type ON devices(type);
CREATE INDEX idx_devices_active ON devices(id) WHERE deleted_at IS NULL;

-- end_users
CREATE INDEX idx_end_users_user_id ON end_users(user_id);
CREATE INDEX idx_end_users_department_id ON end_users(department_id);
CREATE INDEX idx_end_users_position_id ON end_users(position_id);
CREATE INDEX idx_end_users_active ON end_users(id) WHERE deleted_at IS NULL;

-- device_assignments (RẤT QUAN TRỌNG!)
CREATE INDEX idx_assignments_device ON device_assignments(device_id);
CREATE INDEX idx_assignments_end_user ON device_assignments(end_user_id);
CREATE INDEX idx_assignments_user_id ON device_assignments(user_id);
CREATE INDEX idx_assignments_active ON device_assignments(device_id, end_user_id) 
  WHERE returned_at IS NULL;

-- device_sheets
CREATE INDEX idx_device_sheets_device_id ON device_sheets(device_id);

-- activity_logs (BẢNG SẼ LỚN NHẤT!)
CREATE INDEX idx_activity_logs_device_id ON activity_logs(device_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- departments & positions
CREATE INDEX idx_departments_user_id ON departments(user_id);
CREATE INDEX idx_departments_active ON departments(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_active ON positions(id) WHERE deleted_at IS NULL;
```

---

### HIGH #2: departments và positions thiếu UNIQUE constraint

**Vấn đề:** `name text NOT NULL` nhưng không UNIQUE → có thể tạo trùng tên.

**Hậu quả:**
- User tạo 2 department cùng tên "IT" → dropdown trên UI hiển thị:
  ```
  ▼ Phòng ban
    IT
    IT   ← user không biết chọn cái nào
    Kế toán
  ```
- Filter end_users theo department "IT" → **thiếu data** vì một nửa gán vào IT #1, nửa kia gán vào IT #2

**Fix:**
```sql
ALTER TABLE departments ADD CONSTRAINT departments_name_user_unique 
  UNIQUE (name, user_id);

ALTER TABLE positions ADD CONSTRAINT positions_name_user_unique 
  UNIQUE (name, user_id);
```

---

### HIGH #3: device_sheets.sort_order không có UNIQUE constraint

**Vấn đề:** `sort_order integer DEFAULT 0` → tất cả sheet mới đều có sort_order = 0.

**Hậu quả trên UI:**
- 5 sheets của device X đều có `sort_order = 0`
- Thứ tự hiển thị sheet tabs **không xác định** → mỗi lần load có thể khác nhau
- User kéo thả sắp xếp tab → save vào DB → lần sau load lại **không giữ đúng thứ tự**

**Fix:**
```sql
ALTER TABLE device_sheets ADD CONSTRAINT device_sheets_sort_unique 
  UNIQUE (device_id, sort_order);
```

---

### HIGH #4: THIẾU ON DELETE policies

**Vấn đề:** Tất cả FK đều dùng default `NO ACTION` → xóa parent sẽ **bị lỗi** nếu còn child.

**Hậu quả:**
- Admin xóa department "IT" → **error**: `update or delete on table "departments" violates foreign key constraint`
- UI hiển thị error message cryptic, user không hiểu tại sao không xóa được

**Fix:**
```sql
-- device_sheets phụ thuộc hoàn toàn vào device → CASCADE
ALTER TABLE device_sheets DROP CONSTRAINT device_sheets_device_id_fkey;
ALTER TABLE device_sheets ADD CONSTRAINT device_sheets_device_id_fkey
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

-- activity_logs giữ lại log, SET NULL reference
ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_device_id_devices_id_fk;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_device_id_fk
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL;

ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_user_id_profiles_id_fk;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fk
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- device_assignments: CASCADE (xóa device → xóa luôn history)
-- Hoặc dùng soft delete cho devices thay vì xóa thật
ALTER TABLE device_assignments DROP CONSTRAINT device_assignments_device_id_fkey;
ALTER TABLE device_assignments ADD CONSTRAINT device_assignments_device_id_fkey
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

ALTER TABLE device_assignments DROP CONSTRAINT device_assignments_end_user_id_fkey;
ALTER TABLE device_assignments ADD CONSTRAINT device_assignments_end_user_id_fkey
  FOREIGN KEY (end_user_id) REFERENCES end_users(id) ON DELETE CASCADE;

-- end_users: nếu xóa department/position → SET NULL
ALTER TABLE end_users DROP CONSTRAINT end_users_department_id_fkey;
ALTER TABLE end_users ADD CONSTRAINT end_users_department_id_fkey
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE end_users DROP CONSTRAINT end_users_position_id_fkey;
ALTER TABLE end_users ADD CONSTRAINT end_users_position_id_fkey
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL;

-- ⚠️ Nếu dùng SET NULL thì phải cho phép NULL:
ALTER TABLE end_users ALTER COLUMN department_id DROP NOT NULL;
ALTER TABLE end_users ALTER COLUMN position_id DROP NOT NULL;
```

---

## 🟠 MEDIUM PRIORITY (3 lỗi)

### MEDIUM #1: Thiếu trigger tự động update updated_at

**Vấn đề:** Có `updated_at` nhưng không có trigger → phải manual `UPDATE ... SET updated_at = now()`.

**Hậu quả:** Developer dễ quên → `updated_at` không chính xác.

**Fix:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_devices_updated
  BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_end_users_updated
  BEFORE UPDATE ON end_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_departments_updated
  BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_positions_updated
  BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_device_sheets_updated
  BEFORE UPDATE ON device_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### MEDIUM #2: devices.code nullable

**Vấn đề:** `code text UNIQUE` nullable → nhiều devices có thể không có code.

**Quyết định:**
- Nếu `code` là **asset tag bắt buộc** → SET NOT NULL
- Nếu `code` là **optional** → giữ nguyên

**Fix (nếu bắt buộc):**
```sql
UPDATE devices SET code = 'DEV-' || LEFT(id::text, 8) WHERE code IS NULL;
ALTER TABLE devices ALTER COLUMN code SET NOT NULL;
```

---

### MEDIUM #3: activity_logs không có retention policy

**Vấn đề:** Bảng log chỉ INSERT, không bao giờ DELETE → sẽ phình rất nhanh.

**Hậu quả:** Sau 1 năm có thể lên **hàng triệu dòng** → query chậm, backup lâu.

**Fix:**
```sql
-- Dùng pg_cron để auto-archive log cũ hơn 6 tháng
SELECT cron.schedule(
  'archive-old-logs',
  '0 2 1 * *',  -- 2h sáng ngày 1 hàng tháng
  $$DELETE FROM activity_logs WHERE created_at < now() - interval '6 months'$$
);
```

---

## 🟢 LOW PRIORITY - Nice to have (2 gợi ý)

### LOW #1: device_assignments thiếu notes column

**Gợi ý:** Khi assign/return device có thể cần ghi chú lý do (e.g., "Nhân viên mới", "Máy cũ hỏng").

```sql
ALTER TABLE device_assignments ADD COLUMN notes text;
```

---

### LOW #2: device_assignments.user_id naming unclear

**Vấn đề:** Cột `user_id` không rõ nghĩa:
- Người được assign device? (end_user_id đã có rồi)
- Người thực hiện assign? (admin/manager)

**Gợi ý:** Rename để rõ nghĩa:
```sql
ALTER TABLE device_assignments RENAME COLUMN user_id TO assigned_by;
```

---

## 📊 Tổng kết

| Mức độ | Số lỗi | Trạng thái |
|---|---|---|
| 🔴 CRITICAL | 2 | **CẦN FIX NGAY** |
| 🟡 HIGH | 4 | **FIX TRONG TUẦN NÀY** |
| 🟠 MEDIUM | 3 | Fix khi có thời gian |
| 🟢 LOW | 2 | Nice to have |
| **Tổng** | **11 lỗi còn lại** | _(đã fix 10/18)_ |

---

## 🎯 Roadmap fix đề xuất

### Sprint 1 (Ngay lập tức) - CRITICAL
```sql
-- 1. Bỏ end_users.device_id
ALTER TABLE end_users DROP CONSTRAINT end_users_device_id_fkey;
ALTER TABLE end_users DROP COLUMN device_id;

-- 2. Fix device_assignments.user_id FK
ALTER TABLE device_assignments DROP CONSTRAINT device_assignments_user_id_fkey;
ALTER TABLE device_assignments ADD CONSTRAINT device_assignments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);
```

### Sprint 2 (Trong tuần này) - HIGH
```sql
-- 1. Thêm ALL indexes (copy từ HIGH #1 ở trên)
-- 2. Thêm UNIQUE constraints cho departments/positions
-- 3. Thêm UNIQUE constraint cho device_sheets.sort_order
-- 4. Thêm ON DELETE policies (copy từ HIGH #4 ở trên)
```

### Sprint 3 (Tuần sau) - MEDIUM
```sql
-- 1. Tạo trigger updated_at
-- 2. Quyết định devices.code: bắt buộc hay optional?
-- 3. Setup pg_cron cho activity_logs retention
```

---

## 💡 Nhận xét chung

**Điểm tích cực:**
- Bạn đã fix được **10/18 lỗi** từ lần review trước - tiến bộ tốt! 👏
- Schema đã **gần hoàn thiện**, chỉ còn 2 lỗi CRITICAL và 4 lỗi HIGH
- Bảng `device_assignments` được thiết kế đúng - đây là key improvement

**Cần cải thiện:**
- **Lỗi #1** (end_users.device_id) là **ưu tiên cao nhất** vì gây xung đột logic
- **Indexes thiếu** sẽ gây performance issue nghiêm trọng khi scale lên
- ON DELETE policies cần có để tránh error khi xóa data

**Điểm số tổng thể:** 7.5/10 ⭐⭐⭐⭐⭐⭐⭐⚫⚫⚫

Sau khi fix xong 2 lỗi CRITICAL và 4 lỗi HIGH, schema sẽ đạt **9.5/10** - production ready! 🚀
