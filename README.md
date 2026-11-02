# ComputerTech — Backend Service & Database Management

Module Backend của hệ thống **ComputerTech Platform**, quản lý kết nối cơ sở dữ liệu Aiven MySQL, hệ thống di chuyển dữ liệu (Migrations & Seeds), và cung cấp REST API Server cho các hoạt động bán hàng, quản lý kho và dịch vụ kỹ thuật.

---

## 📁 Cấu trúc thư mục Backend

```
backend/
├── src/
│   ├── db.mjs                    # Cấu hình Pool kết nối MySQL2 (hỗ trợ SSL/TLS Aiven)
│   └── server.mjs                # REST API Server Express (port 5000)
├── database/
│   ├── computertech_database.sql # Bản DDL Schema & Dữ liệu cốt lõi
│   └── computertech_full_schema_and_seed.sql # Bản Dump hoàn chỉnh (Schema + 80+ sản phẩm)
├── data/
│   └── scraped_products.json     # Dữ liệu sản phẩm mẫu đã bóc tách từ maytinhbienhoa.vn
├── scripts/
│   ├── migrate.mjs               # Khởi tạo bảng cơ sở dữ liệu (DDL)
│   ├── seed-db.mjs               # Nạp dữ liệu mẫu ban đầu
│   ├── inspect-db.mjs            # Kiểm tra trạng thái và schema database
│   ├── test-crud.mjs             # Kiểm tra quyền đọc/ghi trên MySQL
│   ├── rebuild-database.mjs      # Tái tạo và làm mới toàn bộ database
│   └── run-sql.mjs               # Thực thi tệp SQL trực tiếp
├── secrets/
│   ├── ca.pem                    # Chứng chỉ SSL kết nối Aiven
│   └── mysql.env                 # Biến môi trường kết nối MySQL
├── .env                          # File cấu hình biến môi trường kết nối
├── .env.example                  # Mẫu biến môi trường
└── package.json                  # Dependencies: express, cors, mysql2, dotenv, bcryptjs
```

---

## 🚀 Hướng dẫn cài đặt & khởi chạy

### 1. Cài đặt thư viện:
```bash
cd backend
npm install
```

### 2. Cấu hình biến môi trường (`.env`):
Tạo file `.env` (hoặc sao chép từ `.env.example`):
```env
AIVEN_MYSQL_HOST=mysql-e3174a1-ytpit20218-a7cd.a.aivencloud.com
AIVEN_MYSQL_PORT=28015
AIVEN_MYSQL_USER=avnadmin
AIVEN_MYSQL_PASSWORD=your_password_here
AIVEN_MYSQL_DATABASE=defaultdb
AIVEN_MYSQL_SSL=REQUIRED
PORT=5000
```

### 3. Khởi chạy REST API Server:
```bash
# Chạy môi trường phát triển (tự động reload khi sửa code)
npm run dev

# Hoặc chạy môi trường Production
npm start
```
API Server sẽ lắng nghe tại: `http://localhost:5000`

---

## 📡 Danh sách REST API Endpoints

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra trạng thái Server & kết nối MySQL |
| `GET` | `/api/products` | Danh sách sản phẩm (hỗ trợ lọc theo `category`, tìm kiếm theo `search`) |
| `GET` | `/api/products/:id` | Chi tiết sản phẩm theo ID |
| `GET` | `/api/categories` | Danh sách danh mục sản phẩm |
| `GET` | `/api/brands` | Danh sách thương hiệu |
| `GET` | `/api/inventory` | Ma trận tồn kho (`on_hand`, `reserved`, `available`) |
| `GET` | `/api/customers` | Danh sách khách hàng |
| `POST` | `/api/customers` | Thêm mới hồ sơ khách hàng |
| `GET` | `/api/orders` | Danh sách đơn hàng kèm chi tiết sản phẩm |
| `POST` | `/api/auth/login` | Xác thực đăng nhập nhân sự / khách hàng |
| `GET` | `/api/stats` | Thống kê tổng quan doanh thu, tồn kho và đơn hàng |

---

## 🛠️ Các lệnh quản lý Database

```bash
# Kiểm tra kết nối và các bảng hiện có
npm run db:inspect

# Khởi tạo bảng DDL mới
npm run db:migrate

# Nạp dữ liệu hạt giống (Seed)
npm run db:seed

# Kiểm tra đọc / ghi CRUD thực tế
npm run db:test

# Tái tạo và cập nhật toàn bộ database sạch
npm run db:rebuild
```
