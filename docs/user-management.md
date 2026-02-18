---
title: Quản lý nhân viên
description: Hướng dẫn thêm mới, cập nhật và quản lý hồ sơ End User.
section: Hướng dẫn sử dụng
order: 2
---

## Tổng quan

Trang **Users** cho phép bạn quản lý hồ sơ nhân viên và thiết bị họ đang sử dụng. Mỗi nhân viên có thể được gán nhiều thiết bị khác nhau.

---

## Truy cập

Vào **Users** từ sidebar menu.

---

## Giao diện danh sách

```
┌───────────────────────────────────────────────────────────────────┐
│ Tìm kiếm...        [Phòng ban ▼]  [Chức vụ ▼]     [+] Thêm mới  │
├───────────────────────────────────────────────────────────────────┤
│ ☐ │ Tên           │ Phòng ban  │ Chức vụ   │ Thiết bị   │ Thao tác│
├───┼────────────────┼────────────┼───────────┼────────────┼─────────┤
│ ☐ │ Nguyễn Văn A  │ IT         │ Developer │ 💻 💻      │ ⋮       │
│ ☐ │ Trần Thị B    │ HR         │ Manager   │ 💻        │ ⋮       │
│ ☐ │ Lê Văn C      │ Finance    │ Accountant│ -          │ ⋮       │
└───┴────────────────┴────────────┴───────────┴────────────┴─────────┘
```

### Các thành phần

| Thành phần    | Mô tả                       |
| ------------- | --------------------------- |
| **Search**    | Tìm theo tên, email, SĐT    |
| **Phòng ban** | Lọc theo phòng ban          |
| **Chức vụ**   | Lọc theo chức vụ            |
| **Thêm mới**  | Tạo nhân viên mới           |
| **Checkbox**  | Chọn nhiều để xóa hàng loạt |

---

## Thêm nhân viên mới

### Bước 1: Mở dialog tạo mới

Bấm nút **+** ở góc trên bên phải.

### Bước 2: Điền thông tin

```
┌─────────────────────────────────────────────┐
│ Thêm nhân viên mới                          │
├─────────────────────────────────────────────┤
│                                             │
│ Họ và tên *                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Nguyễn Văn A                            │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Email                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ nguyenvana@company.com                  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Số điện thoại                               │
│ ┌─────────────────────────────────────────┐ │
│ │ 0901234567                              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Phòng ban *                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ IT                            ▼        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Chức vụ *                                   │
│ ┌─────────────────────────────────────────┐ │
│ │ Developer                      ▼        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ Gán thiết bị (tùy chọn)                     │
│ ┌─────────────────────────────────────────┐ │
│ │ + Chọn thiết bị                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│        [Hủy]           [Lưu]               │
└─────────────────────────────────────────────┘
```

### Các trường thông tin

| Trường            | Bắt buộc | Mô tả                                 |
| ----------------- | -------- | ------------------------------------- |
| **Họ và tên**     | ✅       | Tên đầy đủ của nhân viên              |
| **Email**         | ❌       | Email công ty                         |
| **Số điện thoại** | ❌       | SĐT liên hệ                           |
| **Phòng ban**     | ✅       | Chọn từ danh sách có sẵn hoặc tạo mới |
| **Chức vụ**       | ✅       | Chọn từ danh sách có sẵn hoặc tạo mới |
| **Gán thiết bị**  | ❌       | Chọn thiết bị available để gán ngay   |

### Gán thiết bị khi tạo

1. Click **+ Chọn thiết bị**
2. Chọn thiết bị từ dropdown (chỉ hiện thiết bị `Available`)
3. Có thể chọn nhiều thiết bị

---

## Cập nhật thông tin

### Bước 1: Mở dialog chỉnh sửa

Click menu **⋮** ở cuối dòng nhân viên → Chọn **Chỉnh sửa**

### Bước 2: Thay đổi thông tin

- Thay đổi thông tin cá nhân
- Thay đổi phòng ban/chức vụ
- Thêm/xóa thiết bị được gán

### Thu hồi thiết bị

1. Trong dialog chỉnh sửa
2. Tìm thiết bị cần thu hồi
3. Click **X** bên cạnh thiết bị
4. Lưu

```
┌─────────────────────────────────────┐
│ Thiết bị đang sử dụng:              │
├─────────────────────────────────────┤
│ 💻 Laptop Dell 5520        [X]     │
│ 🖥️ Monitor LG 24"          [X]     │
│                                     │
│ + Thêm thiết bị                     │
└─────────────────────────────────────┘
```

---

## Xóa nhân viên

### Cảnh báo quan trọng

> ⚠️ **Cảnh báo:** Khi xóa nhân viên, hệ thống sẽ **tự động thu hồi** tất cả thiết bị họ đang giữ. Các thiết bị sẽ chuyển về trạng thái `Available`.

### Các bước xóa

1. Click menu **⋮** → Chọn **Xóa**
2. Xác nhận trong dialog
3. Thiết bị được thu hồi tự động

---

## Xóa hàng loạt

### Bước 1: Chọn nhiều nhân viên

- Check checkbox đầu mỗi dòng
- Hoặc check **Select All** ở header

### Bước 2: Xóa

1. Nút **Xóa (N)** hiện ra (N = số lượng đã chọn)
2. Click nút → Xác nhận
3. Tất cả thiết bị được thu hồi

---

## Tìm kiếm & Lọc

### Tìm kiếm

Nhập từ khóa vào ô tìm kiếm. Hệ thống tìm trong:

- Họ và tên
- Email
- Số điện thoại

### Lọc theo phòng ban

```
[Phòng ban ▼]
├── Tất cả phòng ban
├── IT
├── HR
├── Finance
└── Marketing
```

### Lọc theo chức vụ

```
[Chức vụ ▼]
├── Tất cả chức vụ
├── Developer
├── Manager
├── Accountant
└── Designer
```

### Kết hợp bộ lọc

Bạn có thể kết hợp nhiều bộ lọc:

- Search + Phòng ban
- Phòng ban + Chức vụ
- Tất cả 3

---

## Xem chi tiết thiết bị

Từ danh sách nhân viên, click vào thiết bị trong cột **Thiết bị** để xem chi tiết thiết bị đó.

Icon thiết bị:
| Icon | Loại thiết bị |
|------|---------------|
| 💻 | Laptop |
| 🖥️ | PC/Desktop |
| 📱 | Mobile |
| 📟 | Tablet |
| 🖧 | Monitor |

---

## Tips & Best Practices

### Khi tạo nhân viên mới

- ✅ Điền đầy đủ email để dễ liên hệ
- ✅ Chọn đúng phòng ban/chức vụ
- ✅ Gán thiết bị ngay nếu có

### Khi cập nhật

- ✅ Thu hồi thiết bị trước khi nhân viên nghỉ việc
- ✅ Cập nhật phòng ban khi chuyển phòng
- ✅ Xóa nhân viên đã nghỉ việc

### Quản lý phòng ban/chức vụ

Tạo phòng ban và chức vụ tại **Settings** trước khi tạo nhân viên:

1. Vào **Settings** → **Departments** / **Positions**
2. Thêm các phòng ban/chức vụ cần thiết
3. Quay lại **Users** để tạo nhân viên
