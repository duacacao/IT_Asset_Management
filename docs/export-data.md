---
title: Export dữ liệu
description: Hướng dẫn xuất dữ liệu thiết bị ra file Excel.
section: Hướng dẫn sử dụng
order: 7
---

## Tổng quan

Tính năng Export cho phép bạn xuất dữ liệu thiết bị ra file Excel (.xlsx) để:

- Backup dữ liệu
- Chia sẻ với người khác
- Phân tích offline
- Lưu trữ

---

## Export một thiết bị

### Bước 1: Mở chi tiết thiết bị

1. Vào **Devices**
2. Click vào thiết bị cần export

### Bước 2: Export

1. Trong modal chi tiết
2. Click nút **Export**
3. File Excel được tải về

### Nội dung file

File Excel chứa:

- **Sheet "General":** Thông tin cơ bản thiết bị
- **Sheet "CPU":** Dữ liệu CPU (nếu có)
- **Sheet "RAM":** Dữ liệu RAM (nếu có)
- **Sheet "Storage":** Dữ liệu ổ cứng (nếu có)
- **Các sheet khác:** Theo dữ liệu trong hệ thống

---

## Export tất cả thiết bị

### Bước 1: Mở menu

1. Vào **Devices**
2. Click **Menu (☰)** ở góc trên bên phải

### Bước 2: Export

1. Chọn **Export All**
2. File Excel được tải về

### Nội dung file

```
exported_devices_2024-02-15.xlsx
├── Sheet "Devices" (danh sách tất cả thiết bị)
├── Sheet "Assignments" (thông tin gán)
└── Sheet "Summary" (thống kê)
```

---

## Định dạng file output

### Sheet "Devices"

| Cột | Nội dung      |
| --- | ------------- |
| A   | ID            |
| B   | Tên thiết bị  |
| C   | Loại          |
| D   | Serial        |
| E   | Trạng thái    |
| F   | Người sử dụng |
| G   | Phòng ban     |
| H   | Ngày tạo      |
| I   | Ngày cập nhật |

### Sheet "Assignments"

| Cột | Nội dung      |
| --- | ------------- |
| A   | Assignment ID |
| B   | Device ID     |
| C   | Device Name   |
| D   | User ID       |
| E   | User Name     |
| F   | Ngày gán      |
| G   | Ngày thu hồi  |

### Sheet "Summary"

```
┌─────────────────────────────────┐
│ Thống kê tổng quan              │
├─────────────────────────────────┤
│ Tổng thiết bị: 150              │
│ Đang dùng: 85                   │
│ Sẵn sàng: 50                    │
│ Hỏng: 15                        │
└─────────────────────────────────┘
```

---

## Tips

### Khi export

- ✅ Export định kỳ để backup
- ✅ Đặt tên file có ngày (file tự động có ngày)
- ✅ Kiểm tra file sau khi export

### Khi chia sẻ

- ✅ Xóa các sheet nhạy cảm nếu cần
- ✅ Kiểm tra dữ liệu trước khi gửi
- ✅ Sử dụng password protection nếu cần

---

## Lưu ý

- File Excel được tạo với encoding UTF-8
- Hỗ trợ đầy đủ tiếng Việt
- Mở được bằng Microsoft Excel, Google Sheets, LibreOffice Calc
