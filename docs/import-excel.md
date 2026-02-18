---
title: Import Excel
description: Hướng dẫn nhập dữ liệu hàng loạt từ file Excel.
section: Hướng dẫn sử dụng
order: 3
---

## Tổng quan

Tính năng Import Excel giúp bạn thêm hàng loạt thiết bị mới vào hệ thống mà không cần nhập tay từng cái. Hệ thống hỗ trợ đọc nhiều sheet từ một file Excel.

---

## Truy cập tính năng

1. Vào **Devices** từ sidebar
2. Bấm **Menu** (☰) ở góc trên bên phải
3. Chọn **Import Excel**

---

## Chuẩn bị file Excel

### Cấu trúc file

File Excel có thể chứa nhiều sheet, mỗi sheet đại diện cho một loại dữ liệu:

| Sheet Name          | Nội dung                  | Bắt buộc |
| ------------------- | ------------------------- | -------- |
| `Thong_tin_chung`   | Thông tin cơ bản thiết bị | ✅ Có    |
| `CPU`               | Thông tin CPU             | ❌ Không |
| `RAM`               | Thông tin RAM             | ❌ Không |
| `o_cung` / `o_dia`  | Thông tin ổ cứng          | ❌ Không |
| `Video` / `Display` | Thông tin card màn hình   | ❌ Không |
| `Network`           | Thông tin mạng            | ❌ Không |

### Sheet "Thong_tin_chung" (Bắt buộc)

| Cột | Tên header                  | Mô tả                | Ví dụ                     |
| --- | --------------------------- | -------------------- | ------------------------- |
| A   | **Name** / **Tên thiết bị** | Tên thiết bị         | Laptop Dell Latitude 5520 |
| B   | **Type** / **Loại**         | Loại thiết bị        | Laptop, PC, Monitor       |
| C   | **Serial**                  | Số serial (duy nhất) | ABC123XYZ                 |
| D   | **Status**                  | Trạng thái           | Available, In Use, Broken |

### Các sheet khác (Tùy chọn)

Các sheet có header tự do, hệ thống sẽ tự động nhận diện:

```
┌─────────────────────────────────────────────┐
│  Sheet: CPU                                 │
├─────────┬───────────┬───────────────────────┤
│  Name   │ Model     │ Speed                 │
├─────────┼───────────┼───────────────────────┤
│ CPU 1   │ Intel i7  │ 2.8 GHz               │
│ CPU 2   │ Intel i5  │ 2.4 GHz               │
└─────────┴───────────┴───────────────────────┘
```

---

## Các bước thực hiện

### Bước 1: Mở dialog Import

![Import Dialog Placeholder]

### Bước 2: Upload file

**Cách 1:** Kéo thả file vào vùng upload

```
┌─────────────────────────────────────┐
│                                     │
│     📁 Kéo thả file vào đây        │
│        hoặc click để chọn          │
│                                     │
└─────────────────────────────────────┘
```

**Cách 2:** Click vào vùng upload → Chọn file từ máy tính

### Bước 3: Chọn sheets

Sau khi upload, hệ thống hiển thị danh sách sheets:

```
┌─────────────────────────────────────┐
│ Chọn sheets cần import:             │
├─────────────────────────────────────┤
│ ☑ Thong_tin_chung                   │
│ ☑ CPU                               │
│ ☑ RAM                               │
│ ☐ Video                              │
│ ☐ Network                            │
└─────────────────────────────────────┘
```

- **☑ Checked:** Sheet sẽ được import
- **☐ Unchecked:** Sheet bị bỏ qua

### Bước 4: Xem trước dữ liệu

Hệ thống hiển thị preview của dữ liệu:

```
┌───────────────────────────────────────────────────────┐
│ Preview: Thong_tin_chung (15 rows)                   │
├─────────────────┬─────────┬──────────┬───────────────┤
│ Name            │ Type    │ Serial   │ Status        │
├─────────────────┼─────────┼──────────┼───────────────┤
│ Laptop Dell 552 │ Laptop  │ ABC123   │ Available     │
│ PC HP ProDesk   │ PC      │ DEF456   │ In Use        │
│ ...             │ ...     │ ...      │ ...           │
└─────────────────┴─────────┴──────────┴───────────────┘
```

### Bước 5: Xác nhận Import

1. Kiểm tra lại số lượng thiết bị
2. Bấm **Xác nhận Import**
3. Đợi hệ thống xử lý

---

## Xử lý lỗi thường gặp

### Lỗi trùng Serial

```
❌ Serial "ABC123" đã tồn tại trong hệ thống
```

**Nguyên nhân:** Serial number đã được sử dụng cho thiết bị khác.

**Giải pháp:**

1. Kiểm tra file Excel, tìm serial bị trùng
2. Thay đổi serial hoặc xóa dòng đó
3. Import lại

### Lỗi định dạng ngày tháng

```
❌ Invalid date format in column "Purchase Date"
```

**Nguyên nhân:** Cột ngày tháng không đúng định dạng.

**Giải pháp:**

- Sử dụng định dạng: `DD/MM/YYYY` hoặc `YYYY-MM-DD`
- Đảm bảo Excel nhận diện cột là Date type

### Lỗi file quá lớn

```
❌ File size exceeds 10MB limit
```

**Giải pháp:**

1. Chia file thành nhiều file nhỏ hơn
2. Nén file (zip) trước khi upload
3. Loại bỏ các sheet không cần thiết

### Lỗi encoding

```
❌ Invalid characters detected
```

**Giải pháp:**

- Lưu file Excel với encoding **UTF-8**
- Tránh sử dụng ký tự đặc biệt trong header

---

## Tips & Best Practices

### Trước khi Import

- ✅ Tải file mẫu từ hệ thống
- ✅ Kiểm tra serial không trùng lặp
- ✅ Đảm bảo các cột bắt buộc đã điền
- ✅ Xóa các dòng trống trong Excel

### Sau khi Import

- ✅ Kiểm tra danh sách thiết bị mới tạo
- ✅ Verify thông tin chi tiết từng thiết bị
- ✅ Gán thiết bị cho nhân viên nếu cần

### Naming Convention

| Loại            | Tên sheet khuyến nghị                 |
| --------------- | ------------------------------------- |
| Thông tin chung | `Thong_tin_chung` hoặc `General`      |
| CPU             | `CPU` hoặc `Processor`                |
| RAM             | `RAM` hoặc `Memory`                   |
| Ổ cứng          | `o_cung` hoặc `Storage` hoặc `Disk`   |
| Màn hình        | `Video` hoặc `Display` hoặc `Monitor` |
| Mạng            | `Network` hoặc `Mang`                 |

---

## Tải file mẫu

Bấm vào link dưới để tải file Excel mẫu:

📥 [Tải file mẫu Import Excel](/templates/device-import-template.xlsx)

File mẫu bao gồm:

- Sheet "Thong_tin_chung" với các cột chuẩn
- Sheet "CPU", "RAM", "Storage" mẫu
- Dữ liệu ví dụ để tham khảo
