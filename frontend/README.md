# ComputerTech — Frontend Web Application

Module Frontend của hệ thống **ComputerTech Platform**, phát triển trên nền tảng **React 18 + TypeScript + Vite + Tailwind CSS**, áp dụng thiết kế Material 3 và kiến trúc Tri-Workspace.

---

## 📁 Cấu trúc thư mục Frontend

```
frontend/
├── src/
│   ├── app/                      # App component và cấu hình Router
│   ├── components/               # Các UI component chung, layout, Material 3 kit
│   ├── domain/                   # State Machines và bộ quy tắc Business Rules
│   ├── factories/                # Factory pattern tạo đơn hàng, phiếu sửa chữa
│   ├── features/                 # Các module nghiệp vụ (POS, Kho, Sửa chữa, Bán hàng, Admin...)
│   ├── layouts/                  # Layout cho từng vai trò người dùng
│   ├── pages/                    # Các trang đăng nhập và điều hướng
│   ├── services/                 # LocalStorage persistence, Facade, Event Bus
│   ├── state/                    # React Context (AuthContext, AppContext)
│   ├── strategies/               # Strategy Pattern tính giá và chiết khấu
│   ├── styles/                   # Global CSS & Tailwind imports
│   ├── theme/                    # Material 3 Design Tokens
│   ├── types/                    # Định nghĩa kiểu dữ liệu TypeScript
│   ├── main.tsx                  # Điểm khởi chạy React DOM
│   └── vite-env.d.ts             # TypeScript definitions cho Vite
├── index.html                    # Single Page Application HTML shell
├── package.json                  # Cấu hình dependencies frontend
├── postcss.config.js             # PostCSS config
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript compiler options
├── vite.config.ts                # Vite build configuration
├── test-business-rules.mjs       # Unit test bộ quy tắc nghiệp vụ
├── test-e2e-browser.mjs          # End-to-end browser test tự động
└── test-material3-portals.mjs    # Test kiểm tra Material 3 portals
```

---

## 🚀 Hướng dẫn cài đặt & khởi chạy

### 1. Cài đặt thư viện:
```bash
cd frontend
npm install
```

### 2. Khởi chạy Development Server:
```bash
npm run dev
```
Truy cập giao diện: [http://localhost:5173](http://localhost:5173)

### 3. Đóng gói cho Production:
```bash
npm run build
```

### 4. Kiểm tra trước bản build (Preview):
```bash
npm run preview
```

### 5. Chạy kiểm thử tự động:
```bash
# Kiểm thử Business Rules
npm run test:rules

# Kiểm thử giao diện End-to-End
npm run test:e2e
```
