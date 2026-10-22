/**
 * ComputerTech - Database mẫu & Cấu hình hệ thống
 * Tham khảo: Công ty Cổ phần Máy tính Biên Hòa
 */

const DEMO_USERS = [
  {
    id: "U01",
    username: "admin",
    password: "123",
    name: "Trần Quản Trị",
    role: "Admin",
    roleTitle: "Quản trị viên",
    email: "admin@computertech.vn",
    phone: "0908 111 222",
    avatar: "TQ",
    avatarBg: "#0B57D0",
    desc: "Toàn quyền quản trị: Báo cáo, Nhân sự, Phân quyền, Kho & Bán hàng"
  },
  {
    id: "U02",
    username: "sale",
    password: "123",
    name: "Lê Thu Trang",
    role: "Sale",
    roleTitle: "Nhân viên bán hàng",
    email: "trang.le@computertech.vn",
    phone: "0912 333 444",
    avatar: "LT",
    avatarBg: "#00639B",
    desc: "Tạo đơn hàng, kiểm tra tồn, tiếp nhận & bàn giao thiết bị bảo hành"
  },
  {
    id: "U03",
    username: "kho",
    password: "123",
    name: "Phạm Văn Kho",
    role: "Kho",
    roleTitle: "Thủ kho",
    email: "kho.pham@computertech.vn",
    phone: "0934 555 666",
    avatar: "PV",
    avatarBg: "#146C2E",
    desc: "Quản lý tồn kho, nhập xuất kho, phê duyệt cấp linh kiện sửa chữa"
  },
  {
    id: "U04",
    username: "kythuat",
    password: "123",
    name: "Đỗ Anh Tuấn",
    role: "Kỹ thuật",
    roleTitle: "Kỹ thuật viên",
    email: "tuan.do@computertech.vn",
    phone: "0978 777 888",
    avatar: "AT",
    avatarBg: "#B06000",
    desc: "Tiếp nhận phiếu SC, chẩn đoán lỗi, yêu cầu linh kiện, kiểm tra KCS"
  }
];

const INITIAL_PRODUCTS = [
  {
    id: "SP001",
    sku: "VGA-RTX4060",
    name: "Card đồ họa ASUS Dual RTX 4060 8GB OC",
    category: "VGA",
    unit: "Cái",
    price: 8490000,
    costPrice: 7600000,
    warrantyMonths: 36,
    stockActual: 8,
    stockHeld: 6,
    stockAvailable: 2, // Sắp hết hàng
    minAlert: 3,
    status: "Sắp hết"
  },
  {
    id: "SP002",
    sku: "RAM-DDR5-16GB",
    name: "RAM Kingston Fury Beast 16GB DDR5 5600MHz",
    category: "RAM",
    unit: "Thanh",
    price: 1450000,
    costPrice: 1200000,
    warrantyMonths: 36,
    stockActual: 15,
    stockHeld: 12,
    stockAvailable: 3,
    minAlert: 5,
    status: "Sắp hết"
  },
  {
    id: "SP003",
    sku: "SSD-NVME-1TB",
    name: "Ổ cứng SSD Samsung 980 NVMe M.2 1TB",
    category: "Ổ cứng",
    unit: "Cái",
    price: 1890000,
    costPrice: 1550000,
    warrantyMonths: 60,
    stockActual: 5,
    stockHeld: 4,
    stockAvailable: 1, // Điểm nghẽn để demo vượt tồn kho!
    minAlert: 5,
    status: "Sắp hết"
  },
  {
    id: "SP004",
    sku: "CPU-I5-13400F",
    name: "Bộ vi xử lý Intel Core i5-13400F Box Chính Hãng",
    category: "CPU",
    unit: "Hộp",
    price: 5290000,
    costPrice: 4700000,
    warrantyMonths: 36,
    stockActual: 24,
    stockHeld: 4,
    stockAvailable: 20,
    minAlert: 5,
    status: "Sẵn hàng"
  },
  {
    id: "SP005",
    sku: "MAIN-B760M",
    name: "Bo mạch chủ ASUS TUF GAMING B760M-PLUS WIFI",
    category: "Mainboard",
    unit: "Cái",
    price: 4190000,
    costPrice: 3650000,
    warrantyMonths: 36,
    stockActual: 18,
    stockHeld: 3,
    stockAvailable: 15,
    minAlert: 4,
    status: "Sẵn hàng"
  },
  {
    id: "SP006",
    sku: "PSU-CV650",
    name: "Nguồn máy tính Corsair CV650 650W 80 Plus Bronze",
    category: "Nguồn",
    unit: "Cái",
    price: 1490000,
    costPrice: 1250000,
    warrantyMonths: 36,
    stockActual: 30,
    stockHeld: 5,
    stockAvailable: 25,
    minAlert: 6,
    status: "Sẵn hàng"
  },
  {
    id: "SP007",
    sku: "LAP-DELL-3520",
    name: "Laptop Dell Inspiron 15 3520 (i5-1235U, 16GB, 512GB)",
    category: "Laptop",
    unit: "Máy",
    price: 15990000,
    costPrice: 14200000,
    warrantyMonths: 12,
    stockActual: 12,
    stockHeld: 2,
    stockAvailable: 10,
    minAlert: 3,
    status: "Sẵn hàng"
  },
  {
    id: "SP008",
    sku: "MON-LG-24MP",
    name: "Màn hình LG 24MR400-B 24 inch IPS 100Hz",
    category: "Màn hình",
    unit: "Cái",
    price: 2290000,
    costPrice: 1950000,
    warrantyMonths: 24,
    stockActual: 16,
    stockHeld: 4,
    stockAvailable: 12,
    minAlert: 5,
    status: "Sẵn hàng"
  }
];

const INITIAL_CUSTOMERS = [
  {
    id: "KH001",
    name: "Nguyễn Minh Anh",
    phone: "0903 123 456",
    email: "minhanh.nguyen@gmail.com",
    address: "Số 45, Đường 30/4, P. Trung Dũng, TP. Biên Hòa, Đồng Nai",
    totalOrders: 3,
    totalSpent: 26480000,
    type: "Khách lẻ VIP"
  },
  {
    id: "KH002",
    name: "Trần Văn Bình",
    phone: "0918 654 321",
    email: "binhtran.tech@gmail.com",
    address: "Khu phố 3, P. Tân Phong, TP. Biên Hòa, Đồng Nai",
    totalOrders: 5,
    totalSpent: 48900000,
    type: "Khách doanh nghiệp"
  },
  {
    id: "KH003",
    name: "Lê Thị Cẩm",
    phone: "0987 234 567",
    email: "cam.lethi@gmail.com",
    address: "Ấp Nhất Hòa, Xã Hiệp Hòa, TP. Biên Hòa, Đồng Nai",
    totalOrders: 1,
    totalSpent: 8490000,
    type: "Khách lẻ"
  },
  {
    id: "KH004",
    name: "Công ty TNHH Giải Pháp Số Đông Nam",
    phone: "0251 388 999",
    email: "contact@dongnamsolution.vn",
    address: "KCN Amata, P. Long Bình, TP. Biên Hòa, Đồng Nai",
    totalOrders: 8,
    totalSpent: 112500000,
    type: "Đối tác chiến lược"
  }
];

const INITIAL_ORDERS = [
  {
    id: "DH001",
    customerName: "Nguyễn Minh Anh",
    phone: "0903 123 456",
    date: "21/10/2026 09:15",
    items: [
      { sku: "VGA-RTX4060", name: "Card ASUS Dual RTX 4060 8GB OC", qty: 1, price: 8490000 },
      { sku: "RAM-DDR5-16GB", name: "RAM Kingston Fury Beast 16GB DDR5", qty: 2, price: 1450000 }
    ],
    totalAmount: 11390000,
    status: "Hoàn tất",
    statusCode: "COMPLETED",
    creator: "Lê Thu Trang",
    notes: "Khách thanh toán chuyển khoản, đã xuất kho thành công"
  },
  {
    id: "DH002",
    customerName: "Trần Văn Bình",
    phone: "0918 654 321",
    date: "21/10/2026 10:30",
    items: [
      { sku: "CPU-I5-13400F", name: "CPU Intel Core i5-13400F Box", qty: 1, price: 5290000 },
      { sku: "MAIN-B760M", name: "Mainboard ASUS TUF B760M-PLUS", qty: 1, price: 4190000 },
      { sku: "PSU-CV650", name: "Nguồn Corsair CV650 650W", qty: 1, price: 1490000 }
    ],
    totalAmount: 10970000,
    status: "Đã xác nhận",
    statusCode: "CONFIRMED",
    creator: "Lê Thu Trang",
    notes: "Đã giữ hàng trong kho, chờ khách đến nhận buổi chiều"
  },
  {
    id: "DH003",
    customerName: "Công ty TNHH Giải Pháp Số Đông Nam",
    phone: "0251 388 999",
    date: "20/10/2026 16:45",
    items: [
      { sku: "LAP-DELL-3520", name: "Laptop Dell Inspiron 15 3520", qty: 2, price: 15990000 }
    ],
    totalAmount: 31980000,
    status: "Hoàn tất",
    statusCode: "COMPLETED",
    creator: "Lê Thu Trang",
    notes: "Giao tận nơi theo hợp đồng công ty, xuất hóa đơn VAT"
  }
];

const INITIAL_SERVICES = [
  {
    id: "SC007",
    customerName: "Nguyễn Minh Anh",
    phone: "0903 123 456",
    device: "Laptop Dell Inspiron 15 3520 (Serial: DL-27X91)",
    reportedFault: "Không nhận ổ cứng SSD, máy khởi động báo 'No Bootable Device', không vào được Windows",
    accessories: "Sạc Dell Type-C 65W · Ngoại quan: Trầy nhẹ nắp lưng",
    intakeDate: "21/10/2026 10:50",
    targetDate: "22/10/2026 16:00",
    intakeStaff: "Lê Thu Trang",
    technician: "Đỗ Anh Tuấn",
    diagnosis: "SSD NVMe cũ bị chập mạch controller do quá nhiệt, mất kết nối PCIe. Cần thay mới SSD NVMe 1TB.",
    requiredPart: {
      sku: "SSD-NVME-1TB",
      name: "Ổ cứng SSD Samsung 980 NVMe M.2 1TB",
      qty: 1,
      partPrice: 1690000
    },
    partRequestStatus: "Đã duyệt cấp", // Chờ duyệt, Đã duyệt cấp, Đã xuất linh kiện
    currentStep: 5, // 1: Tiếp nhận, 2: Chẩn đoán, 3: Yêu cầu linh kiện, 4: Đang sửa, 5: Sẵn sàng bàn giao, 6: Đã trả khách
    status: "Sẵn sàng bàn giao",
    statusCode: "READY_HANDOVER",
    kcsPassed: true,
    totalCost: 1690000,
    notes: "KCS đã chạy test CrystalDiskMark & cài Windows 11 đạt chuẩn. Đang tại quầy Sale chờ khách đến nhận."
  },
  {
    id: "SC008",
    customerName: "Trần Văn Bình",
    phone: "0918 654 321",
    device: "PC Gaming i5-12400F / RTX 3060",
    reportedFault: "Chơi game nặng khoảng 15 phút là sập nguồn khởi động lại",
    accessories: "Thùng máy nguyên chiếc, không kèm cáp nguồn",
    intakeDate: "21/10/2026 14:15",
    targetDate: "23/10/2026 11:00",
    intakeStaff: "Lê Thu Trang",
    technician: "Đỗ Anh Tuấn",
    diagnosis: "Nguồn cũ bị sụt áp đường 12V khi VGA full load. Cần thay nguồn 650W.",
    requiredPart: {
      sku: "PSU-CV650",
      name: "Nguồn máy tính Corsair CV650 650W",
      qty: 1,
      partPrice: 1490000
    },
    partRequestStatus: "Chờ kho duyệt",
    currentStep: 3,
    status: "Chờ linh kiện",
    statusCode: "WAITING_PART",
    kcsPassed: false,
    totalCost: 1490000,
    notes: "Đang chờ thủ kho duyệt xuất linh kiện nguồn CV650"
  },
  {
    id: "BH012",
    customerName: "Lê Thị Cẩm",
    phone: "0987 234 567",
    device: "Card màn hình ASUS Dual RTX 4060 (BH001)",
    reportedFault: "Quạt tản nhiệt bên trái phát ra tiếng kêu rè rè lớn",
    accessories: "Chỉ nhận card, còn tem bảo hành Biên Hòa Computer",
    intakeDate: "20/10/2026 09:30",
    targetDate: "21/10/2026 17:00",
    intakeStaff: "Lê Thu Trang",
    technician: "Đỗ Anh Tuấn",
    diagnosis: "Lỏng bạc đạn quạt tản nhiệt, vệ sinh tra dầu và xiết lại khung quạt",
    requiredPart: null,
    partRequestStatus: "Không cần",
    currentStep: 6,
    status: "Đã trả khách",
    statusCode: "COMPLETED",
    kcsPassed: true,
    totalCost: 0, // Bảo hành miễn phí
    notes: "Bảo hành miễn phí theo chính sách. Khách hàng đã nhận lại thiết bị sáng nay."
  }
];

const INITIAL_STOCK_LOGS = [
  {
    id: "GD012",
    date: "21/10/2026 11:20",
    type: "XUẤT CẤP KỸ THUẬT",
    typeClass: "badge-warning",
    sku: "SSD-NVME-1TB",
    productName: "SSD Samsung 980 NVMe M.2 1TB",
    qty: -1,
    reference: "Phiếu sửa chữa SC007",
    operator: "Phạm Văn Kho",
    note: "Cấp linh kiện thay thế cho kỹ thuật viên Đỗ Anh Tuấn"
  },
  {
    id: "GD011",
    date: "21/10/2026 09:40",
    type: "XUẤT BÁN HÀNG",
    typeClass: "badge-danger",
    sku: "VGA-RTX4060",
    productName: "Card ASUS Dual RTX 4060 8GB OC",
    qty: -1,
    reference: "Đơn hàng #DH001",
    operator: "Phạm Văn Kho",
    note: "Xuất kho giao cho khách Nguyễn Minh Anh"
  },
  {
    id: "GD010",
    date: "20/10/2026 14:00",
    type: "NHẬP KHO",
    typeClass: "badge-success",
    sku: "CPU-I5-13400F",
    productName: "CPU Intel Core i5-13400F Box",
    qty: 10,
    reference: "HĐ Nhập NCC Synnex FPT",
    operator: "Phạm Văn Kho",
    note: "Nhập bổ sung nguồn hàng tháng 10/2026"
  },
  {
    id: "GD009",
    date: "19/10/2026 10:15",
    type: "NHẬP KHO",
    typeClass: "badge-success",
    sku: "RAM-DDR5-16GB",
    productName: "RAM Kingston Fury Beast 16GB DDR5",
    qty: 20,
    reference: "HĐ Nhập NCC Viễn Sơn",
    operator: "Phạm Văn Kho",
    note: "Nhập hàng theo kế hoạch tuần 3"
  }
];

const PERMISSIONS_MATRIX = [
  { module: "Tổng quan Dashboard", admin: true, sale: true, kho: true, kythuat: true },
  { module: "Tạo đơn hàng & Bán hàng", admin: true, sale: true, kho: false, kythuat: false },
  { module: "Quản lý khách hàng", admin: true, sale: true, kho: false, kythuat: false },
  { module: "Tiếp nhận & Bàn giao sửa chữa", admin: true, sale: true, kho: false, kythuat: false },
  { module: "Tổng quan tồn kho & Báo cáo kho", admin: true, sale: false, kho: true, kythuat: false },
  { module: "Nhập kho / Xuất kho / Điều chỉnh", admin: true, sale: false, kho: true, kythuat: false },
  { module: "Duyệt cấp linh kiện kỹ thuật", admin: true, sale: false, kho: true, kythuat: false },
  { module: "Tiếp nhận phiếu chẩn đoán sửa chữa", admin: true, sale: false, kho: false, kythuat: true },
  { module: "Gửi yêu cầu linh kiện thay thế", admin: true, sale: false, kho: false, kythuat: true },
  { module: "Kiểm tra chất lượng KCS thiết bị", admin: true, sale: false, kho: false, kythuat: true },
  { module: "Báo cáo doanh số & Tài chính", admin: true, sale: false, kho: false, kythuat: false },
  { module: "Quản lý nhân viên & Phân quyền", admin: true, sale: false, kho: false, kythuat: false }
];
