---
title: Dashboard
description: Tổng quan hệ thống và thống kê thiết bị.
section: Hướng dẫn sử dụng
order: 4
---

## Tổng quan

**Dashboard** là trang chủ của hệ thống, hiển thị tổng quan về tình hình thiết bị, nhân viên và hoạt động gần đây.

---

## Truy cập

Vào **Dashboard** từ sidebar menu (mặc định khi đăng nhập).

---

## Các thành phần

### 1. Stats Cards

Hiển thị thống kê nhanh ở đầu trang:

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Tổng TB   │  Đang dùng  │   Sẵn sàng  │    Hỏng     │
│     150     │     85      │     50      │     15      │
│   +5 tuần   │   +3 tuần   │   +2 tuần   │   +0 tuần   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

| Card              | Mô tả                               |
| ----------------- | ----------------------------------- |
| **Tổng thiết bị** | Tổng số thiết bị trong hệ thống     |
| **Đang dùng**     | Thiết bị đang được sử dụng          |
| **Sẵn sàng**      | Thiết bị available, có thể cấp phát |
| **Hỏng**          | Thiết bị hỏng cần sửa chữa          |

### 2. Biểu đồ trạng thái thiết bị

Biểu đồ tròn hiển thị phân bố thiết bị theo trạng thái:

```
        ┌─────────────────┐
        │   Device Status │
        ├─────────────────┤
        │    ╭───────╮    │
        │   ╱  57%   ╲   │  ← Available
        │  │   Active  │  │  ← In Use
        │   ╲   28%  ╱   │  ← Broken
        │    ╰───────╯    │
        └─────────────────┘
```

**Trạng thái:**

| Trạng thái  | Màu       | Mô tả              |
| ----------- | --------- | ------------------ |
| Available   | 🟢 Green  | Sẵn sàng cấp phát  |
| In Use      | 🔵 Blue   | Đang được sử dụng  |
| Broken      | 🔴 Red    | Hỏng, cần sửa chữa |
| Maintenance | 🟡 Yellow | Đang bảo trì       |

### 3. Biểu đồ phân bố theo phòng ban

Biểu đồ thanh ngang hiển thị số thiết bị theo phòng ban:

```
┌─────────────────────────────────────────┐
│ Department Distribution                 │
├─────────────────────────────────────────┤
│ IT         ████████████████ 45         │
│ HR         ██████ 15                    │
│ Finance    ████████ 20                  │
│ Marketing  ████ 10                      │
│ Sales      █████ 12                     │
└─────────────────────────────────────────┘
```

### 4. Hardware Overview

Tổng quan cấu hình phần cứng:

```
┌─────────────────────────────────────────┐
│ Hardware Overview                       │
├─────────────────────────────────────────┤
│                                         │
│  CPU                                    │
│  ├── Intel Core i7: 45 devices         │
│  ├── Intel Core i5: 60 devices         │
│  └── AMD Ryzen: 15 devices             │
│                                         │
│  RAM                                    │
│  ├── 16GB: 70 devices                  │
│  ├── 32GB: 40 devices                  │
│  └── 8GB: 20 devices                   │
│                                         │
│  Storage                                │
│  ├── SSD 512GB: 80 devices             │
│  └── SSD 1TB: 40 devices               │
│                                         │
└─────────────────────────────────────────┘
```

### 5. Recent Activity

Danh sách hoạt động gần đây:

```
┌─────────────────────────────────────────┐
│ Recent Activity                         │
├─────────────────────────────────────────┤
│ • Nguyễn Văn A được gán Laptop Dell    │
│   2 phút trước                          │
│                                         │
│ • Laptop HP ProBook đã được thu hồi    │
│   15 phút trước                         │
│                                         │
│ • 10 thiết bị mới được import          │
│   1 giờ trước                           │
│                                         │
│ • Trần Thị B cập nhật thông tin        │
│   2 giờ trước                           │
└─────────────────────────────────────────┘
```

---

## Trang Dashboard rỗng

Nếu chưa có thiết bị nào trong hệ thống:

```
┌─────────────────────────────────────────┐
│                                         │
│         Chào mừng đến IT Asset          │
│             Management                  │
│                                         │
│   Import file Excel (.xlsx) để bắt      │
│   đầu theo dõi và quản lý thiết bị IT   │
│                                         │
│        [📤 Import thiết bị]             │
│                                         │
└─────────────────────────────────────────┘
```

---

## Quick Actions

Từ Dashboard, bạn có thể:

| Action              | Mô tả                                     |
| ------------------- | ----------------------------------------- |
| **Import thiết bị** | Click nút Import để thêm thiết bị mới     |
| **Xem Devices**     | Click vào stats card để đến trang Devices |
| **Xem Activity**    | Click vào recent activity để xem chi tiết |

---

## Làm mới dữ liệu

Dashboard tự động cập nhật:

- Khi có thay đổi về thiết bị
- Khi có assignment mới
- Khi refresh trang

---

## Tips

- ✅ Kiểm tra Dashboard hàng ngày để nắm tình hình
- ✅ Chú ý card "Hỏng" để lên kế hoạch sửa chữa
- ✅ Theo dõi Recent Activity để biết hoạt động mới nhất
- ✅ Sử dụng Dashboard để report cho management
