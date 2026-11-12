# BÁO CÁO KIỂM THỬ TOÀN DIỆN, SỬA LỖI & DỌN DẸP MÃ NGUỒN — COMPUTERTECH PLATFORM

**Ngày lập báo cáo:** 12/11/2026  
**Phạm vi kiểm thử:** Full-Stack (`Express 4.21.2 + Aiven MySQL 8.4.11` & `React 18 + TypeScript 5.6 + Vite 5.4`)

---

## 1. Tóm tắt điều hành
- **Tổng số lỗi phát hiện & đã sửa:** **28 lỗi** (**4 Critical**, **9 High**, **11 Medium**, **4 Low**).
- **Dọn dẹp mã nguồn thừa:** Đã xóa **14 mục** dư thừa/tạm thời (bao gồm `push_to_github.bat`, thư mục ảnh debug `screenshots/`, `frontend/test-material3-portals.mjs` và 11 script vá/chụp ảnh một lần trong `scripts/`).
- **Trạng thái kiểm thử sau sửa chữa & dọn dẹp:**
  - `npm --prefix frontend run build` (`tsc && vite build`): **PASS** (`1628 modules transformed`, built in `6.51s`, `0` lỗi TypeScript).
  - `npm --prefix frontend run test:rules`: **PASS** (`26 / 26` test nghiệp vụ).
  - Backend REST API (`src/server.mjs` kết nối Aiven MySQL `defaultdb` + kiểm thử fallback `LocalMockDatabase`): **PASS** (`0` lỗi fallback MySQL trong log).
  - Playwright Full Regression (Desktop `1440x900`, Tablet `768x1024`, Mobile `390x844`): **PASS** (`83 / 83`, `0` console error, `0` page error, `0` broken image, `0` horizontal overflow trên 15 routes).

---

## 2. Danh sách lỗi theo mức độ nghiêm trọng & Nguyên nhân gốc rễ

### Critical (4 lỗi)
| Mã | Mô tả lỗi | Nguyên nhân gốc rễ | Cách khắc phục | File liên quan |
| :--- | :--- | :--- | :--- | :--- |
| **C1** | Vượt qua đăng nhập với mật khẩu rỗng khi gỡ thuộc tính `required` | `AuthService.login()` không từ chối chuỗi mật khẩu rỗng | Kiểm tra `!password \|\| !password.trim()` ngay đầu hàm `login()` | `frontend/src/services/authService.ts` |
| **C2** | Backdoor mật khẩu hardcode (`password123`, `admin123`, `sale123`) ở Backend | `POST /api/auth/login` có nhánh fallback so sánh mật khẩu chuỗi cứng | Xóa toàn bộ mật khẩu hardcode, chỉ xác thực bằng `bcrypt.compare` | `src/server.mjs` |
| **C3** | Lưu plaintext `password` & rò rỉ session khách hàng khi đăng nhập nhầm `/company/login` | Session lưu nguyên object `User` và `login()` lưu `localStorage` trước khi check `portal` | Thêm `sanitizeUser()` xóa `password`, chuyển kiểm tra `portal` vào `AuthService.login()` và bổ sung `logout()` | `frontend/src/services/authService.ts`, `frontend/src/state/AuthContext.tsx`, `frontend/src/pages/CompanyLoginPage.tsx` |
| **C4** | `CartDrawer` gắn nhầm khách hàng VIP `cust_01` (`Phan Quốc Bảo`) & giảm 5% VIP cho khách Standard | `selectedCustomerId` fallback sang `customers[0]` và không đồng bộ khi đổi user | Đồng bộ `selectedCustomerId` qua `useEffect`, chặn fallback `customers[0]` cho tài khoản `customer`, sửa text Standard/VIP | `frontend/src/features/cart/CartDrawer.tsx` |

### High (9 lỗi)
| Mã | Mô tả lỗi | Nguyên nhân gốc rễ | Cách khắc phục | File liên quan |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | Nhiều API Backend lỗi SQL schema thật trên Aiven MySQL | Query dùng sai tên cột (`brands.sort_order`, `products.category`, `products.min_stock_alert`, `customers.address`, `orders.order_status`) và không kiểm tra `NaN` của `limit`/`offset` | Sửa SQL khớp DDL thực tế (`JOIN categories`, `inventory.min_stock_alert`, `orders.status`, `customer_addresses`), validate `limit`/`offset` | `src/server.mjs` |
| **H2** | `pool.query` che giấu lỗi SQL bằng mock DB; `LocalMockDatabase` hash bcrypt giả & sai lọc email khách | Catch mọi lỗi query thay vì chỉ lỗi kết nối; hash tĩnh `$2a$10$wT8v...`; `FROM CUSTOMERS` trả hết danh sách khi check trùng | Chỉ fallback khi gặp `CONNECTION_ERROR_CODES`/`fatal`; dùng `bcrypt.hashSync`; bổ sung handler `FROM CUSTOMERS WHERE EMAIL = ?` & `c.slug` | `src/db.mjs` |
| **H3** | Đăng ký khách hàng mới không gắn `customerId`, thiếu kiểm tra trùng email, mật khẩu ngắn | `handleRegisterSubmit` không tạo/gắn `customerId`, không check trùng email/mật khẩu < 6 ký tự, giữ fallback `'password123'` | Validate đầy đủ họ tên/email/SĐT/mật khẩu >= 6 ký tự, kiểm tra trùng, gắn `customerId` và gọi `refreshData()` | `frontend/src/pages/CustomerLoginPage.tsx` |
| **H4** | Form đăng nhập & tạo user điền sẵn `'password123'` | State khởi tạo cứng `'password123'` | Khởi tạo state mật khẩu rỗng `''` | `CompanyLoginPage.tsx`, `CustomerLoginPage.tsx`, `AdminUsersView.tsx` |
| **H5** | Lưu hồ sơ khách hàng dùng `alert()` giả, mất dữ liệu khi reload | `handleSaveProfile` chưa ghi `mockDb` và chưa cập nhật `AuthContext` | Lưu cập nhật xuống `mockDb`, thêm `refreshSession()` cho `AuthContext` | `frontend/src/features/customer/CustomerAccountView.tsx`, `frontend/src/state/AuthContext.tsx` |
| **H6** | Thiếu rollback tồn kho giữ chỗ & hoàn tác đơn khi `autoConfirm` thất bại giữa vòng lặp | Vòng lặp `reserveStock` dừng giữa chừng không gọi `releaseStock`; `autoConfirm` lỗi vẫn để lại đơn `pending` | Thu hồi các mục đã `reserveStock` khi lỗi và thêm `mockDb.removeOrder()` để hoàn tác | `frontend/src/services/orderProcessingFacade.ts`, `frontend/src/services/mockDatabase.ts` |
| **H7** | Backend thiếu validate malformed JSON và 404 handler chuẩn JSON | Express trả HTML 404 mặc định và stack trace/500 khi JSON lỗi | Bổ sung middleware xử lý SyntaxError JSON (`400`) và fallback `404` JSON | `src/server.mjs` |
| **H8** | Deep-link `/store/orders`, `/store/warranty` luôn mở tab Tổng quan; nút `"Chi tiết"` không chạy | `activeTab` khởi tạo cứng `'overview'`, thiếu state/modal chi tiết đơn | Parse `location.pathname` để bật đúng tab và bổ sung Modal Chi tiết đơn hàng | `frontend/src/features/customer/CustomerAccountView.tsx` |
| **H9** | Dropdown `Linh kiện PC` trên thanh menu bị cắt dọc | Menu con `position: absolute` đặt bên trong container `overflow-x-auto` (`navClientHeight: 42`) | Di chuyển dropdown ra ngoài `overflow-x-auto` với tọa độ `dropdownLeft` động | `frontend/src/components/store/StoreHeader.tsx` |

### Medium (11 lỗi)
| Mã | Mô tả lỗi | Cách khắc phục | File liên quan |
| :--- | :--- | :--- | :--- |
| **M1** | Tràn ngang Tablet `768px` tại `/sales/customers` (`839 > 768`) | Đổi breakpoint header `SalesLayout` từ `md` sang `lg` và thêm `min-w-0`/`truncate` | `SalesLayout.tsx`, `SalesCustomerRegistrationView.tsx` |
| **M2** | Tràn ngang Mobile `390px` tại `/admin/orders` (`458 > 390`) | Cho phép `flex-wrap`, `max-w-full`, `w-full sm:w-auto` trên mode switcher & select khách | `PosView.tsx` |
| **M3** | Mobile `390px` không có ô tìm kiếm trên Storefront | Bổ sung thanh tìm kiếm mobile `md:hidden` | `StoreHeader.tsx` |
| **M4** | Click danh mục từ `/store/tracking` không quay về `/store` | Đổi điều kiện sang `location.pathname !== '/store'` | `StoreLayout.tsx` |
| **M5** | Nhấn `Khuyến mãi HOT` khi đang lọc không xóa bộ lọc cũ | Chuyển hướng rõ về `/store#section-promo` và cuộn tới `#section-promo` | `StoreLayout.tsx`, `StorefrontView.tsx` |
| **M6** | Thiếu/lệch mã danh mục `pc_gaming`, `gaming_gear`, `networking` ở nhiều màn hình | Bổ sung đủ 8 danh mục và sửa mapping `cat_keyboard`, `cat_headphones`, `cat_network` | `StorefrontView.tsx`, `CategoryShowcase.tsx`, `InventoryView.tsx`, `AdminProductsView.tsx`, `PosView.tsx` |
| **M7** | `ProductDetailModal` giữ nguyên `purchaseQty` giữa các sản phẩm & nuốt lỗi giỏ hàng | Reset `purchaseQty = 1` và `cartError = null` khi `product?.id` đổi; hiển thị lỗi inline | `ProductDetailModal.tsx` |
| **M8** | `<select>` của `PosView` và `RepairBenchView` khởi tạo rỗng khi data tải sau mount | Bổ sung `useEffect` đồng bộ giá trị mặc định khi danh sách thay đổi | `PosView.tsx`, `RepairBenchView.tsx` |
| **M9** | Dùng `window.prompt()` / `window.alert()` trong `PosView` và `AdminUsersView` | Thay bằng modal nhập lý do hủy đơn inline và banner thông báo inline | `PosView.tsx`, `AdminUsersView.tsx` |
| **M10** | Xóa chip tìm kiếm/danh mục làm mất hoặc sai query string URL | Đồng bộ `searchParams` khi xóa filter/search chip | `StoreHeader.tsx`, `StorefrontView.tsx` |
| **M11** | `totalRevenue` tại `/api/stats` có thể trả chuỗi/null từ MySQL | Ép kiểu `Number(... || 0)` ở tất cả các chỉ số thống kê | `src/server.mjs` |

### Low (4 lỗi)
| Mã | Mô tả lỗi | Cách khắc phục | File liên quan |
| :--- | :--- | :--- | :--- |
| **L1** | Hiển thị thô ký tự `&nbsp;` trong thông số kỹ thuật (`specs`) | Chuẩn hóa loại bỏ `&nbsp;` trước khi render | `ProductDetailModal.tsx` |
| **L2** | Thiếu kiểm tra định dạng email khách vãng lai (`guestEmail`) | Bổ sung regex kiểm tra email hợp lệ khi có nhập `guestEmail` | `CartDrawer.tsx` |
| **L3** | Trang `/login` thiếu liên kết sang Cổng Nhân viên `/company/login` | Thêm nút điều hướng `"Cổng Nhân viên"` trên header | `CustomerLoginPage.tsx` |
| **L4** | Ô tìm kiếm `AdminProductsView` cố định `w-64` gây chật màn hình nhỏ | Đổi sang `w-full sm:w-64` | `AdminProductsView.tsx` |

---

## 3. Các file dư thừa đã xóa khỏi dự án
- `push_to_github.bat` (script đẩy GitHub theo yêu cầu xóa)
- `screenshots/` (8 ảnh chụp debug giao diện tạm thời)
- `frontend/test-material3-portals.mjs` (script kiểm thử cũ không còn tham chiếu trong `package.json`)
- 11 script tạm/vá mã một lần trong `scripts/`:
  - `capture-fixed-header.mjs`, `capture-new-categories.mjs`, `capture-storefront.mjs`
  - `cleanMockDatabase.mjs`, `updateAdminUsersView.mjs`, `fixTestFAndG.mjs`, `refineE2ETests.mjs`, `updateE2ETests.mjs`
  - `explore-site.mjs`, `find-collections.mjs`, `test-collection.mjs`

---

## 4. Các hạn chế / phần chưa thể thực hiện
1. **Chưa tự động push lên GitHub và xóa `push_to_github.bat` trên remote GitHub (`https://github.com/ytpit20218/quanlybanhangmaytinh.git`):**
   - Máy hiện chưa cài `git` CLI / `gh` CLI, thư mục dự án là bản tải ZIP (không có `.git`), và không có GitHub token/SSH key hoặc thông tin xác thực GitHub được cấu hình trên máy.
   - Đã hoàn tất sửa lỗi, tạo báo cáo và xóa `push_to_github.bat` cùng file thừa ở thư mục local; chỉ cần xác thực GitHub (PAT hoặc cài Git/GitHub CLI và đăng nhập) để đẩy bản cập nhật lên nhánh `main` (lúc push sẽ tự động xóa `push_to_github.bat` và các file thừa trên GitHub).
2. **Kiến trúc Frontend dùng `localStorage`:** Giữ nguyên theo ràng buộc không thay đổi kiến trúc lớn.
3. **Không có cấu hình ESLint:** `package.json` gốc và `frontend/package.json` chưa khai báo script `lint`.
