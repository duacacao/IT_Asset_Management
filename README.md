# 🖥️ IT Assets Management — Device Dashboard

Ứng dụng web quản lý tài sản IT (thiết bị, phần cứng) xây dựng trên **Next.js 16** với giao diện hiện đại, hỗ trợ import dữ liệu từ file Excel, quản lý CRUD đầy đủ, drag-and-drop, undo/redo, và lưu trữ offline trên trình duyệt.

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|---|---|
| 📊 **Dashboard tổng quan** | Biểu đồ thống kê thiết bị, hoạt động gần đây, tổng quan phần cứng |
| 📥 **Import Excel** | Kéo thả file `.xlsx` — hỗ trợ import nhiều files, chọn sheets trước khi import |
| ➕ **Tạo thiết bị** | Tạo mới thiết bị thủ công với form nhập thông tin chi tiết |
| 📋 **Danh sách thiết bị** | Bảng với sắp xếp, tìm kiếm, lọc theo trạng thái, phân trang |
| 🔍 **Xem chi tiết** | Modal hiển thị thông tin thiết bị với nhiều tab sheet dữ liệu |
| ✏️ **Chỉnh sửa inline** | Chỉnh sửa trực tiếp dữ liệu trong bảng, thêm/xóa cột và sheet |
| 🔀 **Drag & Drop** | Kéo thả sắp xếp lại thứ tự các tab sheet |
| ↩️ **Undo / Redo** | Hoàn tác & làm lại với `Ctrl+Z` / `Ctrl+Y` |
| ☑️ **Thao tác hàng loạt** | Chọn nhiều thiết bị → đổi trạng thái / xuất file / xóa cùng lúc |
| 📤 **Xuất Excel** | Xuất dữ liệu thiết bị ngược lại thành file `.xlsx` |
| 🎨 **Tuỳ chỉnh giao diện** | Dark/Light mode, theme colors, customizer |
| 💾 **Lưu trữ offline** | Dữ liệu được lưu trên trình duyệt (IndexedDB) — không cần backend |

---

## 🛠️ Tech Stack

### Core

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1.1 | React framework — routing, SSR |
| [React](https://react.dev/) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS |

### UI Components

| Thư viện | Mục đích |
|---|---|
| [shadcn/ui](https://ui.shadcn.com/) (Radix UI) | Hệ thống component chính (Dialog, Dropdown, Table, Tabs, …) |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Recharts](https://recharts.org/) | Biểu đồ thống kê |
| [Embla Carousel](https://www.embla-carousel.com/) | Carousel cho sheet tabs |
| [cmdk](https://cmdk.paco.me/) | Command palette / tìm kiếm nhanh |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notifications |

### State & Data

| Thư viện | Mục đích |
|---|---|
| [Zustand](https://zustand.docs.pmnd.rs/) | Quản lý state toàn cục |
| [Zundo](https://github.com/charkour/zundo) | Undo/Redo middleware cho Zustand |
| [idb-keyval](https://github.com/nicedoc/idb-keyval) | Lưu trữ dữ liệu trên IndexedDB |
| [SheetJS (xlsx)](https://sheetjs.com/) | Đọc/ghi file Excel |
| [@tanstack/react-table](https://tanstack.com/table) | Bảng dữ liệu nâng cao (sort, filter, pagination) |
| [@tanstack/react-virtual](https://tanstack.com/virtual) | Virtualized rendering cho bảng lớn |

### Interactions

| Thư viện | Mục đích |
|---|---|
| [@dnd-kit](https://dndkit.com/) | Drag-and-drop (sắp xếp tabs) |
| [react-dropzone](https://react-dropzone.js.org/) | Kéo thả file upload |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | Panels có thể resize |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form validation |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/Light mode |

---

## 📁 Cấu trúc dự án

```
device-dashboard/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/          # Trang đăng nhập / đăng ký
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/   # Trang tổng quan
│   │   │   ├── devices/     # Quản lý thiết bị (CRUD)
│   │   │   ├── settings/    # Cài đặt (Appearance, Account, User)
│   │   │   └── layout.tsx   # Layout chung (Sidebar + Header)
│   │   ├── globals.css      # CSS variables, Tailwind config
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── dashboard/       # Components chính
│   │   │   ├── DeviceList.tsx          # Bảng danh sách thiết bị
│   │   │   ├── DeviceDetail.tsx        # Modal chi tiết / chỉnh sửa
│   │   │   ├── ImportDevice.tsx        # Kéo thả import file
│   │   │   ├── SheetTable.tsx          # Bảng dữ liệu sheet
│   │   │   ├── SheetSelectionDialog.tsx # Chọn sheets khi import
│   │   │   ├── CreateDeviceDialog.tsx  # Dialog tạo thiết bị mới
│   │   │   ├── HardwareOverview.tsx    # Card tổng quan phần cứng
│   │   │   └── RecentActivity.tsx      # Hoạt động gần đây
│   │   ├── ui/              # shadcn/ui components (41 files)
│   │   ├── carousel/        # Sheet tabs carousel
│   │   └── theme-customizer/ # Theme customization
│   ├── stores/              # Zustand stores
│   │   ├── useDeviceStore.ts   # Device state + undo/redo
│   │   └── useAppearanceStore.ts # Theme settings
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Utility functions
│   ├── config/              # App configuration
│   ├── contexts/            # React contexts
│   └── utils/               # Helper utilities
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🚀 Bắt đầu

### Yêu cầu

- **Node.js** >= 18.x ([tải tại đây](https://nodejs.org/))
- **npm** (đi kèm Node.js) hoặc **pnpm** / **yarn**

### Cài đặt

```bash
# Clone repository
git clone <https://github.com/zaza04/IT_Asset_Management.git>
cd device-dashboard

# Cài đặt dependencies
npm install
```

### Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

### Build Production

```bash
# Build
npm run build

# Chạy production server
npm start
```

### Lint

```bash
npm run lint
```

---

## 📖 Hướng dẫn sử dụng

### Import thiết bị từ Excel

1. Vào trang **Thiết bị** → bấm **Import Excel**
2. Kéo thả file `.xlsx` vào vùng upload (hỗ trợ nhiều files)
3. Chọn sheets muốn import → bấm **Xác nhận**
4. Thiết bị sẽ xuất hiện trong danh sách

### Quản lý thiết bị

- **Xem chi tiết**: Click vào dòng trong bảng hoặc menu `⋯` → Xem chi tiết
- **Chỉnh sửa**: Menu `⋯` → Chỉnh sửa (mở edit mode trực tiếp)
- **Xuất file**: Menu `⋯` → Xuất file (tải xuống `.xlsx`)
- **Xóa**: Menu `⋯` → Xóa (hiển thị xác nhận trước khi xóa)

### Thao tác hàng loạt

1. Tick checkbox nhiều thiết bị
2. Toolbar xuất hiện → Đổi trạng thái / Xuất file / Xóa

### Chỉnh sửa nâng cao

- Trong edit mode: chỉnh sửa trực tiếp ô dữ liệu
- Kéo thả icon ⋮⋮ để sắp xếp thứ tự tabs
- Thêm sheet mới, thêm/xóa cột
- Bấm **Lưu** để lưu và đóng modal

### Undo / Redo

- `Ctrl + Z` — Hoàn tác
- `Ctrl + Y` — Làm lại
- Hoặc sử dụng nút ↩️ ↪️ trên toolbar

---

## 📝 Scripts

| Script | Lệnh | Mô tả |
|---|---|---|
| Dev | `npm run dev` | Chạy development server (hot reload) |
| Build | `npm run build` | Build production bundle |
| Start | `npm start` | Chạy production server |
| Lint | `npm run lint` | Kiểm tra lỗi code với ESLint |

---

## 🗄️ Lưu trữ dữ liệu

Ứng dụng sử dụng **IndexedDB** (thông qua `idb-keyval`) để lưu trữ dữ liệu trực tiếp trên trình duyệt:

- ✅ **Không cần backend** — hoạt động hoàn toàn offline
- ✅ **Dữ liệu persist** — vẫn còn sau khi refresh trang
- ⚠️ **Lưu ý**: Dữ liệu chỉ tồn tại trên trình duyệt hiện tại. Xoá cache trình duyệt sẽ mất dữ liệu.

---

## 📄 License

Dự án được phân phối theo giấy phép [MIT](./License.md).

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: thêm tính năng mới"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

> **Note:** Dự án đang trong giai đoạn phát triển. Mọi đóng góp và góp ý đều được chào đón!
