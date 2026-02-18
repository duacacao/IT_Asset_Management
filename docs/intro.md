---
title: Giới thiệu hệ thống
description: Tổng quan về Device Dashboard và hướng dẫn sử dụng cơ bản.
section: General
order: 1
---

## Chào mừng

Chào mừng bạn đến với **Device Dashboard** - Hệ thống quản lý tài sản CNTT chuyên nghiệp.

Hệ thống giúp bạn theo dõi toàn bộ vòng đời thiết bị, từ lúc nhập kho đến khi cấp phát cho nhân viên và thu hồi.

---

## Các phân hệ chính

| Phân hệ       | Mô tả                                    | Truy cập         |
| ------------- | ---------------------------------------- | ---------------- |
| **Dashboard** | Tổng quan hệ thống, biểu đồ thống kê     | Menu → Dashboard |
| **Thiết bị**  | Quản lý Laptop, PC, Monitor...           | Menu → Devices   |
| **Nhân viên** | Hồ sơ nhân viên & thiết bị được gán      | Menu → Users     |
| **Cài đặt**   | Tài khoản, giao diện, phòng ban, chức vụ | Menu → Settings  |

---

## Workflow tổng quát

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   IMPORT    │───▶│   ASSIGN    │───▶│   MANAGE    │
│  Thiết bị   │    │  Cho nhân   │    │  & Theo dõi │
│  từ Excel   │    │   viên      │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │
      ▼                  ▼                  ▼
  Tạo hàng loạt     Gán thiết bị       Cập nhật
  thiết bị mới      cho end-user       trạng thái
```

---

## Quick Start

### Bước 1: Đăng nhập

1. Truy cập URL hệ thống
2. Nhập email và mật khẩu
3. Bấm **Sign In**

### Bước 2: Import thiết bị

1. Vào **Devices** → Bấm **Menu** (☰) → **Import Excel**
2. Kéo thả file Excel (.xlsx) vào vùng upload
3. Chọn sheets cần import
4. Xác nhận và hoàn tất

> **Mẹo:** Tải file mẫu từ dialog import để đảm bảo đúng định dạng.

### Bước 3: Tạo nhân viên

1. Vào **Users** → Bấm nút **+** (Thêm mới)
2. Điền thông tin: Họ tên, Email, Phòng ban, Chức vụ
3. (Tùy chọn) Gán thiết bị ngay khi tạo
4. Lưu

### Bước 4: Gán thiết bị cho nhân viên

**Cách 1:** Từ trang Devices

1. Click vào thiết bị cần gán
2. Trong modal chi tiết, tìm phần **Assignment**
3. Chọn nhân viên → Xác nhận

**Cách 2:** Từ trang Users

1. Click **Edit** trên nhân viên cần gán
2. Trong phần **Thiết bị**, chọn thiết bị từ dropdown
3. Lưu

---

## Tính năng nổi bật

### Quản lý thiết bị

| Tính năng         | Mô tả                                  |
| ----------------- | -------------------------------------- |
| Import Excel      | Thêm hàng loạt thiết bị từ file .xlsx  |
| Chi tiết thiết bị | Xem specs, history, assignment         |
| Sheet data        | Chỉnh sửa dữ liệu Excel ngay trong app |
| Export            | Xuất thiết bị ra file Excel            |

### Quản lý nhân viên

| Tính năng       | Mô tả                                 |
| --------------- | ------------------------------------- |
| Hồ sơ nhân viên | Lưu trữ thông tin cá nhân, phòng ban  |
| Gán thiết bị    | 1 nhân viên có thể giữ nhiều thiết bị |
| Lịch sử         | Theo dõi thiết bị đã từng sử dụng     |

### Báo cáo & Thống kê

| Tính năng | Mô tả                                       |
| --------- | ------------------------------------------- |
| Dashboard | Tổng quan số lượng thiết bị theo trạng thái |
| Biểu đồ   | Phân bố theo loại, phòng ban                |
| Activity  | Lịch sử hoạt động gần đây                   |

---

## Yêu cầu hệ thống

### Browser hỗ trợ

| Browser | Phiên bản tối thiểu |
| ------- | ------------------- |
| Chrome  | 90+                 |
| Firefox | 88+                 |
| Safari  | 14+                 |
| Edge    | 90+                 |

### File Excel

- Định dạng: `.xlsx` (Excel 2007+)
- Kích thước tối đa: 10MB
- Encoding: UTF-8

---

## Cần trợ giúp?

Nếu bạn gặp vấn đề khi sử dụng hệ thống:

1. Tham khảo các hướng dẫn trong Documentation
2. Liên hệ IT Support qua email hoặc internal ticket
3. Ghi lại screenshot và mô tả lỗi chi tiết

> **Lưu ý:** Tài liệu này được cập nhật thường xuyên theo các bản nâng cấp của phần mềm.
