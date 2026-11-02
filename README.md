# ComputerTech — Precision Hardware Retail & Technical Operations Platform

## Tổng quan dự án

**ComputerTech** là nền tảng quản trị bán lẻ thiết bị phần cứng, máy tính cao cấp, quản lý kho đa điểm, quầy thu ngân (POS), quản lý bảo hành và điều phối kỹ thuật sửa chữa theo tiêu chuẩn công nghiệp.

Hệ thống được tổ chức phân tách rõ ràng thành hai phân hệ độc lập:
- **`frontend/`**: Ứng dụng Single Page Application (React 18 + TypeScript + Vite + Tailwind CSS + Material 3 Design).
- **`backend/`**: Hệ thống máy chủ REST API (Express + Node.js) và quản trị cơ sở dữ liệu (MySQL / Aiven Cloud + Migrations & Seeds).

---

## 🏛️ Cấu trúc dự án (Project Architecture)

```
banhang/
├── frontend/                     # Phân hệ Giao diện người dùng (Frontend)
│   ├── src/                      # Toàn bộ mã nguồn React + TypeScript
│   ├── index.html                # Trang khởi đầu Vite
│   ├── vite.config.ts            # Cấu hình Vite
│   ├── tsconfig.json             # Cấu hình TypeScript
│   ├── tailwind.config.js        # Cấu hình Tailwind CSS
│   ├── postcss.config.js         # Cấu hình PostCSS
│   ├── package.json              # Quản lý thư viện Frontend
│   ├── test-business-rules.mjs   # Bộ kiểm thử quy tắc nghiệp vụ
│   ├── test-e2e-browser.mjs      # Bộ kiểm thử E2E giao diện
│   └── README.md                 # Tài liệu hướng dẫn Frontend
│
├── backend/                      # Phân hệ Máy chủ & Dữ liệu (Backend)
│   ├── src/
│   │   ├── db.mjs                # Quản lý Connection Pool kết nối MySQL
│   │   └── server.mjs            # REST API Server Express (Port 5000)
│   ├── database/                 # Tập tin lược đồ và dữ liệu DDL (.sql)
│   ├── data/                     # Dữ liệu mẫu (Scraped data)
│   ├── scripts/                  # Kịch bản migrate, seed, kiểm thử DB
│   ├── secrets/                  # Chứng chỉ SSL và cấu hình bảo mật
│   ├── .env                      # Cấu hình kết nối Aiven MySQL
│   ├── package.json              # Quản lý thư viện Backend
│   └── README.md                 # Tài liệu hướng dẫn Backend
│
├── start.bat                     # Tệp tiện ích khởi chạy nhanh cả hệ thống trên Windows
├── start.cmd                     # Tệp lệnh tắt
├── push_to_github.bat            # Tệp tự động hóa commit và đẩy mã nguồn lên GitHub
├── package.json                  # Cấu hình Workspace gốc điều phối chung
└── README.md                     # Tài liệu tổng thể dự án
```

---

## 🚀 Hướng dẫn khởi chạy nhanh

### Cách 1: Khởi chạy nhanh bằng `start.bat` (Khuyên dùng trên Windows)
Chỉ cần nhấp đúp vào tệp **`start.bat`** tại thư mục gốc. Hệ thống sẽ tự động:
1. Kiểm tra và cài đặt các thư viện cần thiết cho cả `frontend` và `backend`.
2. Khởi chạy **Backend API Server** tại `http://localhost:5000`.
3. Khởi chạy **Frontend Web** tại `http://localhost:5173`.
4. Tự động mở trình duyệt web đến giao diện chính.

---

### Cách 2: Khởi chạy bằng lệnh từ thư mục gốc

```bash
# 1. Cài đặt toàn bộ thư viện cho cả hai phân hệ
npm run install:all

# 2. Chạy đồng thời hoặc riêng biệt:
# Chạy Frontend:
npm run dev:frontend

# Chạy Backend API:
npm run dev:backend
```

---

### Cách 3: Khởi chạy riêng từng phân hệ

#### 🖥️ Khởi chạy Frontend:
```bash
cd frontend
npm install
npm run dev
```
Truy cập: [http://localhost:5173](http://localhost:5173)

#### ⚙️ Khởi chạy Backend:
```bash
cd backend
npm install
npm run dev
```
API Server: [http://localhost:5000](http://localhost:5000) (Kiểm tra sức khỏe: `http://localhost:5000/api/health`)

---

## 💾 Quản lý Cơ sở dữ liệu (MySQL / Aiven Cloud)

Từ thư mục gốc hoặc thư mục `backend/`:

```bash
# Kiểm tra kết nối và cấu trúc bảng
npm run db:inspect

# Tạo các bảng mới (Migration)
npm run db:migrate

# Nạp dữ liệu mẫu ban đầu (Seed)
npm run db:seed

# Kiểm tra CRUD thực tế
npm run db:test

# Tái tạo toàn diện cơ sở dữ liệu
npm run db:rebuild
```

---

## 🔑 Tài khoản đăng nhập hệ thống

- **Khách hàng bán lẻ & VIP** (`/login`):
  - `bao.gamer@gmail.com` / `password123` (Phan Quốc Bảo - VIP Gamer, Chiết khấu 5%)
  - `thutrang.arch@gmail.com` / `password123` (Đặng Thu Trang - Standard Designer)
  - `hai.vu@techvision.vn` / `password123` (Vũ Đức Hải - Doanh nghiệp TechVision)
- **Cổng nhân sự nội bộ** (`/company/login`):
  - **Quản trị viên (Admin)**: `admin@computertech.vn` / `admin123` (Nguyễn Minh Kiệt - Quyền toàn diện)
  - **Bán hàng (Sale)**: `sale@computertech.vn` / `sale123` (Nguyễn Việt Anh - POS & Bán lẻ)
  - **Kho vận (Warehouse)**: `warehouse@computertech.vn` / `warehouse123` (Ngô Thành Tâm - Quản lý kho)
  - **Kỹ thuật viên (Technician)**: `tech@computertech.vn` / `tech123` (Trần Quang Huy - Bàn sửa chữa & Lab)
