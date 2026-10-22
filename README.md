# ComputerTech — Hệ thống Quản lý Bán hàng, Kho & Bảo hành / Sửa chữa Máy tính

> **Đơn vị nghiệp vụ tham khảo:** Công ty Cổ phần Máy tính Biên Hòa  
> **Phong cách thiết kế:** Giao diện Google Material Design 3 (Material You / M3) hiện đại với hệ màu Dynamic Tonal (#0B57D0 Google Blue), Navigation Drawer sáng màu dạng Pill capsule, Search Bar bo tròn M3, chuẩn Desktop 1440 × 900 px, Tiếng Việt, đơn vị VNĐ.

---

## 1. Giới thiệu dự án

**ComputerTech** là giải pháp phần mềm quản trị nội bộ dành cho các cửa hàng, trung tâm máy tính và linh kiện viễn thông. Hệ thống kết nối liền mạch giữa 4 bộ phận nghiệp vụ chính:
- **Quản trị viên (Admin):** Theo dõi toàn cảnh doanh số, nhân sự, ma trận phân quyền và báo cáo hiệu quả.
- **Nhân viên bán hàng (Sale):** Quản lý thông tin khách hàng, kiểm tra tồn kho tức thì trước khi tạo đơn, tiếp nhận thiết bị lỗi và bàn giao lại thiết bị hoàn tất cho khách.
- **Thủ kho (Kho):** Kiểm soát chính xác 3 chỉ số tồn kho (Tồn thực tế, Tồn đã giữ cho đơn hàng, Tồn khả dụng bán), quản lý nhập xuất kho và phê duyệt cấp linh kiện cho phòng kỹ thuật.
- **Kỹ thuật viên (Kỹ thuật):** Tiếp nhận phiếu sửa chữa, chẩn đoán lỗi phần cứng/phần mềm, gửi yêu cầu cấp linh kiện từ kho, thực hiện sửa chữa và kiểm tra KCS đạt chuẩn xuất xưởng.

---

## 2. Danh sách 4 tài khoản thử nghiệm tạo sẵn

Hệ thống hỗ trợ **đăng nhập nhanh 1-Click** ngay trên màn hình đăng nhập hoặc sử dụng tài khoản/mật khẩu dưới đây:

| Vai trò | Tài khoản | Mật khẩu | Họ và tên | Trách nhiệm chính |
|---|---|---|---|---|
| **Quản trị viên (Admin)** | `admin` | `123` | Trần Quản Trị | Toàn quyền quản trị hệ thống, nhân sự, báo cáo, phân quyền |
| **Bán hàng (Sale)** | `sale` | `123` | Lê Thu Trang | Tạo đơn hàng, kiểm tra tồn kho, tiếp nhận & bàn giao thiết bị |
| **Thủ kho (Kho)** | `kho` | `123` | Phạm Văn Kho | Quản lý nhập/xuất kho, duyệt cấp linh kiện thay thế |
| **Kỹ thuật viên** | `kythuat` | `123` | Đỗ Anh Tuấn | Chẩn đoán lỗi, yêu cầu linh kiện, sửa chữa và KCS kiểm tra |

*(Lưu ý: Bạn cũng có thể chuyển đổi nhanh vai trò bất kỳ lúc nào thông qua menu chọn vai trò ở góc trên thanh Header).*

---

## 3. Các kịch bản trình diễn nghiệp vụ (5 Luồng chính)

### Luồng 1: Bán hàng & Trừ tồn kho tự động
1. Đăng nhập với vai trò **Sale (Lê Thu Trang)**.
2. Vào tab **Đơn hàng** $\rightarrow$ Bấm **+ Tạo đơn hàng mới**.
3. Chọn khách hàng và linh kiện (VD: *Card ASUS Dual RTX 4060 8GB OC*), nhập số lượng hợp lệ $\rightarrow$ Bấm **Xác nhận tạo đơn**.
4. Hệ thống tự động chuyển đơn sang trạng thái `Đã xác nhận` và chuyển tồn kho của sản phẩm từ *Tồn khả dụng* sang *Tồn đã giữ*.
5. Bấm nút **Xuất kho & Hoàn tất** để hoàn tất đơn hàng và trừ tồn thực tế.

### Luồng 2: Nhập kho bổ sung
1. Đăng nhập với vai trò **Kho (Phạm Văn Kho)**.
2. Vào tab **Kho hàng** $\rightarrow$ Bấm **+ Nhập hàng mới**.
3. Chọn sản phẩm cần nhập thêm (VD: *Ổ cứng SSD Samsung 980 NVMe 1TB*), nhập số lượng và nhà cung cấp.
4. Bấm **Xác nhận nhập kho** $\rightarrow$ Hệ thống cập nhật tăng tồn thực tế & tồn khả dụng, đồng thời ghi lại vào **Lịch sử giao dịch kho**.

### Luồng 3: Quy trình 6 bước Bảo hành & Sửa chữa liên phòng ban
1. **Bước 1 (Tiếp nhận - Sale):** Sale bấm **+ Tiếp nhận thiết bị mới**, nhập thông tin máy lỗi (VD: *Laptop Dell Inspiron 15 3520 không vào được Windows*).
2. **Bước 2 (Chẩn đoán - Kỹ thuật):** Kỹ thuật viên kiểm tra phần cứng $\rightarrow$ Bấm **Bắt đầu chẩn đoán lỗi**.
3. **Bước 3 (Yêu cầu linh kiện):** Kỹ thuật xác định hỏng SSD, bấm **Yêu cầu linh kiện từ Kho**.
4. **Bước 4 (Cấp linh kiện & Sửa chữa - Kho & Kỹ thuật):** Thủ kho bấm **Kho duyệt cấp linh kiện** $\rightarrow$ Hệ thống tự động trừ kho linh kiện và chuyển cho kỹ thuật sửa chữa.
5. **Bước 5 (KCS Kiểm tra):** Kỹ thuật hoàn tất sửa chữa và test phần mềm đạt chuẩn.
6. **Bước 6 (Bàn giao - Sale):** Chuyển thiết bị ra quầy giao dịch, nhân viên Sale **Lê Thu Trang** bàn giao máy và thu phí từ khách hàng $\rightarrow$ Kết thúc phiếu sửa chữa.

### Luồng 4: Cảnh báo thông minh khi không đủ tồn khả dụng
1. Mở form **Tạo đơn hàng mới**.
2. Chọn sản phẩm có tồn thấp (VD: *SSD Samsung 980 NVMe 1TB* chỉ còn khả dụng 1 chiếc).
3. Nhập số lượng là `5`.
4. Hệ thống lập tức hiển thị khung cảnh báo màu đỏ: **"⚠ Không đủ tồn khả dụng!"**, đồng thời khóa nút xác nhận đơn cho tới khi người dùng điều chỉnh lại số lượng hợp lệ.

### Luồng 5: Kiểm soát phân quyền (Authorization)
1. Đăng nhập với vai trò **Sale** hoặc **Kỹ thuật**.
2. Thử bấm vào menu **Nhân viên & Phân quyền**.
3. Hệ thống chặn lại và hiển thị màn hình **403 — Không có quyền truy cập**, kèm nút quay về an toàn Dashboard phù hợp.

---

## 4. Hướng dẫn sử dụng
Chỉ cần mở tệp `index.html` trực tiếp trên bất kỳ trình duyệt web hiện đại nào (Google Chrome, Microsoft Edge, Firefox, Safari) mà không cần cài đặt Node.js hay web server phức tạp.
