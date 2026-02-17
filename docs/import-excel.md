---
title: Import Excel
description: Hướng dẫn nhập dữ liệu hàng loạt từ file Excel.
section: Hướng dẫn sử dụng
order: 3
---

## Import Excel

Tính năng này giúp bạn thêm hàng loạt thiết bị mới vào hệ thống mà không cần nhập tay từng cái.

### Chuẩn bị file Excel

File Excel cần tuân thủ cấu trúc sau:

1. **Cột A (Name):** Tên thiết bị (Bắt buộc).
2. **Cột B (Type):** Loại thiết bị (Laptop, PC, Monitor...).
3. **Cột C (Serial):** Số Serial (Bắt buộc, duy nhất).
4. **Cột D (Status):** Trạng thái (Available, In Use, Maintenance, Broken).

> **Mẹo:** Bạn có thể tải file mẫu ngay tại cửa sổ Import.

### Các bước thực hiện

1. Truy cập menu **Devices**.
2. Bấm nút **Import Excel** trên thanh công cụ.
3. Chọn file Excel từ máy tính của bạn.
4. Kiểm tra lại dữ liệu trên màn hình xem trước.
5. Bấm **Xác nhận Import**.

### Xử lý lỗi thường gặp

* **Lỗi trùng Serial:** Hệ thống sẽ báo đỏ các dòng bị trùng serial với dữ liệu đã có trong database. Bạn cần sửa lại file Excel trước khi import lại.
* **Lỗi định dạng ngày tháng:** Đảm bảo cột ngày tháng (nếu có) đúng định dạng DD/MM/YYYY.
