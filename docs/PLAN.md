# Kế hoạch Triển khai JWT Authentication

## 🎯 Mục tiêu

Chuyển đổi hệ thống Authentication từ Client-side Mock sang Server-side JWT Authentication chuẩn, đảm bảo bảo mật và khả năng mở rộng.

## 📊 Hiện trạng

- **Authentication**: Mock (Giả lập).
- **Credentials**: Hardcoded trong Client code (`admin`/`admin`).
- **Token**: Random string, không có chữ ký số.
- **Storage**: `localStorage` (Dễ bị XSS).
- **Middleware**: Chưa có bảo vệ route server-side.

## 🛠️ Giải pháp Kỹ thuật

Sử dụng thư viện **`jose`** (nhẹ, hỗ trợ Edge Runtime) để xử lý JWT.

### Kiến trúc Authentication Flow

1. **Login**: Client POST `/api/auth/login` -> Server verify -> Server sign JWT -> Set **HttpOnly Cookie**.
2. **Session**: Client không lưu token. Token nằm trong Cookie tự động gửi kèm request.
3. **Protect**: `middleware.ts` kiểm tra Cookie trên mỗi request vào `/dashboard/*`.
4. **User Info**: Client gọi `/api/auth/me` hoặc decode payload từ middleware (nếu cần).
5. **Logout**: API xóa Cookie.

## 📅 Kế hoạch Thực hiện

### Giai đoạn 1: Backend & API (Backend Specialist)

- [ ] Cài đặt thư viện `jose`.
- [ ] Tạo secret key trong `.env`.
- [ ] Implement `src/lib/jwt.ts`: Các hàm `signJWT`, `verifyJWT`.
- [ ] Tạo Route Handler: `src/app/api/auth/login/route.ts`.
- [ ] Tạo Route Handler: `src/app/api/auth/logout/route.ts`.
- [ ] Tạo Route Handler: `src/app/api/auth/me/route.ts` (nhận diện user).

### Giai đoạn 2: Middleware & Security (Security Auditor)

- [ ] Implement `src/middleware.ts`:
  - Chặn truy cập `/dashboard/*` nếu không có token.
  - Chặn truy cập `/login` nếu đã có token (redirect vào dashboard).
  - Verify token ngay tại Edge.

### Giai đoạn 3: Frontend Integration (Frontend Specialist)

- [ ] Update `src/lib/auth.ts`: Chuyển từ mock functions sang gọi API.
- [ ] Update `LoginForm1`: Handle API error, redirect sau khi login thành công.
- [ ] Xóa bỏ logic `localStorage`.

### Giai đoạn 4: Testing & Verification (Test Engineer)

- [ ] Test Login thành công/thất bại.
- [ ] Test truy cập Protected Route khi chưa login (phải redirect).
- [ ] Test Logout.
- [ ] Security Scan: Đảm bảo Cookie có cờ `HttpOnly`, `Secure`, `SameSite`.

## 📦 Dependencies

- `jose`: `npm install jose`

## ⚠️ Lưu ý

- Tạm thời vẫn dùng hardcoded credentials `admin`/`admin` **nhưng chuyển về Server-side checking** để bảo mật client code.
- Secret key phải đủ mạnh (ít nhất 32 ký tự).
