---
title: Quản lý thiết bị
description: Hướng dẫn quản lý thiết bị IT - tạo, xem, sửa, xóa và export.
section: Hướng dẫn sử dụng
order: 5
---

## Tổng quan

Trang **Devices** là nơi quản lý tất cả thiết bị IT trong hệ thống. Bạn có thể:

- Xem danh sách thiết bị
- Tạo thiết bị mới
- Xem/sửa chi tiết thiết bị
- Import/Export Excel
- Xóa thiết bị

---

## Truy cập

Vào **Devices** từ sidebar menu.

---

## Giao diện danh sách

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Tìm kiếm...     [Trạng thái ▼]    [Loại ▼]     [Menu ☰]    [+ Thêm mới] │
├───────────────────────────────────────────────────────────────────────────┤
│ ☐ │ Tên           │ Loại    │ Serial    │ Trạng thái │ Người dùng │ Thao │
├───┼────────────────┼────────┼───────────┼────────────┼────────────┼──────┤
│ ☐ │ Laptop Dell    │ Laptop │ ABC123    │ 🟢 In Use  │ Nguyễn A   │  ⋮   │
│ ☐ │ PC HP ProDesk  │ PC     │ DEF456    │ 🟢 In Use  │ Trần B     │  ⋮   │
│ ☐ │ Monitor LG     │Monitor │ GHI789    │ ⚪ Available│ -          │  ⋮   │
└───┴────────────────┴────────┴───────────┴────────────┴────────────┴──────┘
```

### Thanh công cụ

| Nút              | Chức năng                          |
| ---------------- | ---------------------------------- |
| **Tìm kiếm**     | Tìm theo tên, serial               |
| **Trạng thái**   | Lọc theo Available, In Use, Broken |
| **Loại**         | Lọc theo Laptop, PC, Monitor, v.v. |
| **Menu (☰)**    | Import Excel, Export all           |
| **Thêm mới (+)** | Tạo thiết bị mới                   |

---

## Tạo thiết bị mới

### Bước 1: Mở dialog tạo mới

Bấm nút **+** ở góc trên bên phải.

### Bước 2: Điền thông tin

```
┌─────────────────────────────────────────────┐
│ Tạo thiết bị mới                           │
├─────────────────────────────────────────────┤
│                                             │
│ Tên thiết bị *                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Laptop Dell Latitude 5520               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Loại thiết bị *                            │
│ ┌─────────────────────────────────────────┐ │
│ │ Laptop                        ▼        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Serial Number *                            │
│ ┌─────────────────────────────────────────┐ │
│ │ ABC123XYZ                               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Trạng thái                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Available                     ▼        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│        [Hủy]           [Tạo]               │
└─────────────────────────────────────────────┘
```

### Các trường thông tin

| Trường            | Bắt buộc | Mô tả                     |
| ----------------- | -------- | ------------------------- |
| **Tên thiết bị**  | ✅       | Tên định danh             |
| **Loại thiết bị** | ✅       | Laptop, PC, Monitor, v.v. |
| **Serial Number** | ✅       | Mã serial (duy nhất)      |
| **Trạng thái**    | ❌       | Mặc định: Available       |

---

## Xem chi tiết thiết bị

### Mở modal chi tiết

Click vào một dòng thiết bị trong danh sách.

### Cấu trúc modal

```
┌─────────────────────────────────────────────────────────────┐
│ [Tổng quan] [Dữ liệu]                          [X]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │ Thông tin sử dụng  │  │ Thông tin thiết bị         │   │
│  │ ─────────────────  │  │ ─────────────────────────  │   │
│  │ 👤 Nguyễn Văn A    │  │ Loại: Laptop               │   │
│  │ IT Department      │  │ Serial: ABC123             │   │
│  │ [Thu hồi]          │  │ Status: 🟢 In Use          │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cấu hình phần cứng                                  │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ CPU: Intel Core i7-1165G7                          │   │
│  │ RAM: 16GB DDR4                                     │   │
│  │ Storage: 512GB SSD                                 │   │
│  │ GPU: Intel Iris Xe                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Thông tin khác                                      │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ Tạo: 01/01/2024                                    │   │
│  │ Cập nhật: 15/02/2024                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tab "Tổng quan"

Hiển thị:

- **Thông tin sử dụng:** Ai đang dùng, phòng ban
- **Cấu hình phần cứng:** CPU, RAM, Storage, GPU
- **Thông tin thiết bị:** Loại, Serial, Status
- **Thông tin khác:** Ngày tạo, cập nhật

### Tab "Dữ liệu"

Hiển thị dữ liệu từ các sheet Excel:

```
┌─────────────────────────────────────────────────────────────┐
│ [Sheet 1] [Sheet 2] [Sheet 3]               [+ Thêm sheet] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Col A      │ Col B      │ Col C      │ Col D         │ │
│  ├────────────┼────────────┼────────────┼────────────────┤ │
│  │ Data 1     │ Data 2     │ Data 3     │ Data 4        │ │
│  │ Data 5     │ Data 6     │ Data 7     │ Data 8        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Chỉnh sửa sheet data

### Sửa ô dữ liệu

1. **Double-click** vào ô cần sửa
2. Nhập giá trị mới
3. Click ra ngoài để lưu

### Thêm sheet mới

1. Click **+ Thêm sheet**
2. Đặt tên sheet
3. Nhập dữ liệu

### Xóa sheet

1. Click menu trên tab sheet
2. Chọn **Xóa sheet**
3. Xác nhận

---

## Gán thiết bị cho nhân viên

### Từ modal chi tiết thiết bị

1. Mở chi tiết thiết bị
2. Trong phần **Thông tin sử dụng**
3. Click **Gán thiết bị**
4. Chọn nhân viên từ dropdown
5. Xác nhận

### Thu hồi thiết bị

1. Mở chi tiết thiết bị
2. Trong phần **Thông tin sử dụng**
3. Click **Thu hồi**
4. Xác nhận

---

## Xóa thiết bị

### Cảnh báo

> ⚠️ **Cảnh báo:** Xóa thiết bị sẽ xóa tất cả dữ liệu liên quan (sheets, assignments). Hành động này không thể hoàn tác.

### Các bước xóa

1. Click menu **⋮** → Chọn **Xóa**
2. Xác nhận trong dialog
3. Thiết bị bị xóa vĩnh viễn

### Xóa hàng loạt

1. Check checkbox đầu mỗi dòng
2. Nút **Xóa (N)** hiện ra
3. Click → Xác nhận

---

## Export thiết bị

### Export một thiết bị

1. Mở chi tiết thiết bị
2. Click nút **Export**
3. File Excel được tải về

### Export tất cả thiết bị

1. Click **Menu (☰)**
2. Chọn **Export All**
3. File Excel chứa tất cả thiết bị được tải về

---

## Tìm kiếm & Lọc

### Tìm kiếm

Nhập từ khóa để tìm trong:

- Tên thiết bị
- Serial number

### Lọc theo trạng thái

```
[Trạng thái ▼]
├── Tất cả
├── Available (Sẵn sàng)
├── In Use (Đang dùng)
├── Broken (Hỏng)
└── Maintenance (Bảo trì)
```

### Lọc theo loại

```
[Loại ▼]
├── Tất cả
├── Laptop
├── PC/Desktop
├── Monitor
├── Mobile
└── Tablet
```

---

## Bulk Operations

### Thay đổi trạng thái hàng loạt

1. Chọn nhiều thiết bị (checkbox)
2. Click dropdown **Thay đổi trạng thái**
3. Chọn trạng thái mới
4. Tất cả thiết bị được cập nhật

### Xóa hàng loạt

1. Chọn nhiều thiết bị
2. Click **Xóa (N)**
3. Xác nhận

---

## Tips & Best Practices

### Khi tạo thiết bị

- ✅ Đặt tên dễ nhận diện (ví dụ: "Laptop Dell - Nguyễn Văn A")
- ✅ Nhập serial chính xác
- ✅ Chọn đúng loại thiết bị

### Khi quản lý

- ✅ Kiểm tra trang thái thiết bị định kỳ
- ✅ Cập nhật status khi thiết bị hỏng/sửa chữa
- ✅ Thu hồi thiết bị khi nhân viên nghỉ việc
- ✅ Export backup định kỳ

### Naming Convention

| Loại    | Gợi ý tên                         |
| ------- | --------------------------------- |
| Laptop  | `Laptop [Brand] [Model] - [User]` |
| PC      | `PC [Brand] - [Location]`         |
| Monitor | `Monitor [Brand] [Size]`          |
| Mobile  | `Mobile [Brand] [Model] - [User]` |
