-- =====================================================================
-- COMPUTERTECH E-COMMERCE & ENTERPRISE MANAGEMENT SYSTEM
-- Target Engine: MySQL 8.0+ / 8.4+ (Aiven.io Cloud MySQL)
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Generated at: 2026-10-30
-- Description: Xóa sạch dữ liệu cũ và khởi tạo lại toàn bộ Schema + Dữ liệu
-- Staff: Nguyễn Minh Kiệt (Admin), Nguyễn Việt Anh (Sale), Ngô Thành Tâm (Kho)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. DROP EXISTING TABLES (Clean Slate Wipeout)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `app_notifications`;
DROP TABLE IF EXISTS `repair_histories`;
DROP TABLE IF EXISTS `repair_tickets`;
DROP TABLE IF EXISTS `inventory_transactions`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `inventory`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `customers`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 2. CREATE SCHEMAS
-- ---------------------------------------------------------------------

-- Bảng Khách hàng
CREATE TABLE `customers` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `tier` ENUM('standard', 'vip') DEFAULT 'standard',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Người dùng & Phân quyền (Users & RBAC)
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin', 'sale', 'warehouse', 'technician') NOT NULL,
  `avatar` VARCHAR(512) DEFAULT NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `customer_id` VARCHAR(64) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_customer` (`customer_id`),
  CONSTRAINT `fk_users_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Sản phẩm (Products Catalog)
CREATE TABLE `products` (
  `id` VARCHAR(64) NOT NULL,
  `sku` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('laptops', 'pc_parts', 'displays', 'accessories') NOT NULL,
  `price` BIGINT NOT NULL,
  `cost` BIGINT NOT NULL,
  `warranty_months` INT NOT NULL DEFAULT 12,
  `specs` JSON DEFAULT NULL,
  `image` VARCHAR(512) DEFAULT NULL,
  `min_stock_alert` INT NOT NULL DEFAULT 5,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Tồn kho (Inventory Matrix)
CREATE TABLE `inventory` (
  `product_id` VARCHAR(64) NOT NULL,
  `quantity_on_hand` INT NOT NULL DEFAULT 0,
  `quantity_reserved` INT NOT NULL DEFAULT 0,
  `location` VARCHAR(128) DEFAULT NULL,
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Đơn hàng (Orders)
CREATE TABLE `orders` (
  `id` VARCHAR(64) NOT NULL,
  `order_number` VARCHAR(64) NOT NULL UNIQUE,
  `customer_id` VARCHAR(64) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `subtotal` BIGINT NOT NULL,
  `discount_amount` BIGINT NOT NULL DEFAULT 0,
  `total_amount` BIGINT NOT NULL,
  `payment_status` ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  `payment_method` ENUM('cash', 'bank_transfer', 'card') NOT NULL DEFAULT 'cash',
  `pricing_strategy_name` VARCHAR(128) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_customer` (`customer_id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Chi tiết Đơn hàng (Order Items)
CREATE TABLE `order_items` (
  `id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_sku` VARCHAR(64) NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` BIGINT NOT NULL,
  `subtotal` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Lịch sử Giao dịch Kho (Inventory Transactions)
CREATE TABLE `inventory_transactions` (
  `id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `type` ENUM('receipt', 'issue', 'adjustment', 'reserve', 'release') NOT NULL,
  `quantity` INT NOT NULL,
  `previous_on_hand` INT NOT NULL,
  `new_on_hand` INT NOT NULL,
  `previous_reserved` INT NOT NULL,
  `new_reserved` INT NOT NULL,
  `reason` TEXT NOT NULL,
  `actor_id` VARCHAR(64) NOT NULL,
  `actor_name` VARCHAR(255) NOT NULL,
  `reference_type` ENUM('order', 'repair', 'manual_adjustment', 'initial_stock') NOT NULL,
  `reference_id` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inv_tx_product` (`product_id`),
  CONSTRAINT `fk_inv_tx_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Phiếu Sửa chữa / Bảo hành (Repair Tickets)
CREATE TABLE `repair_tickets` (
  `id` VARCHAR(64) NOT NULL,
  `ticket_number` VARCHAR(64) NOT NULL UNIQUE,
  `customer_id` VARCHAR(64) NOT NULL,
  `device_name` VARCHAR(255) NOT NULL,
  `serial_number` VARCHAR(128) DEFAULT NULL,
  `issue_description` TEXT NOT NULL,
  `diagnostic_notes` TEXT DEFAULT NULL,
  `status` ENUM('intake', 'diagnosing', 'waiting_parts', 'in_progress', 'repaired', 'cancelled', 'handed_over') NOT NULL DEFAULT 'intake',
  `technician_id` VARCHAR(64) DEFAULT NULL,
  `technician_name` VARCHAR(255) DEFAULT NULL,
  `estimated_cost` BIGINT DEFAULT 0,
  `labor_fee` BIGINT DEFAULT 0,
  `parts_used` JSON DEFAULT NULL,
  `final_cost` BIGINT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_repair_status` (`status`),
  KEY `idx_repair_customer` (`customer_id`),
  CONSTRAINT `fk_repair_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Lịch sử Tiến trình Sửa chữa (Repair Histories)
CREATE TABLE `repair_histories` (
  `id` VARCHAR(64) NOT NULL,
  `ticket_id` VARCHAR(64) NOT NULL,
  `ticket_number` VARCHAR(64) NOT NULL,
  `previous_status` ENUM('intake', 'diagnosing', 'waiting_parts', 'in_progress', 'repaired', 'cancelled', 'handed_over') NOT NULL,
  `new_status` ENUM('intake', 'diagnosing', 'waiting_parts', 'in_progress', 'repaired', 'cancelled', 'handed_over') NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `actor_id` VARCHAR(64) NOT NULL,
  `actor_name` VARCHAR(255) NOT NULL,
  `parts_added` JSON DEFAULT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_repair_history_ticket` (`ticket_id`),
  CONSTRAINT `fk_repair_histories_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `repair_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Thông báo Hệ thống (App Notifications)
CREATE TABLE `app_notifications` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `severity` ENUM('info', 'success', 'warning', 'alert') NOT NULL DEFAULT 'info',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `link_to` JSON DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. INSERT CLEAN SEED DATA
-- ---------------------------------------------------------------------

-- 3.1 Khách hàng mẫu
INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `tier`) VALUES
('cust_01', 'Minh Tuấn Software Studio', 'tuan@minhstudio.dev', '0903-882-911', 'Tầng 8, Diamond Plaza, Quận 1, TP. Hồ Chí Minh', 'vip'),
('cust_02', 'Lan Hương Creative Studio', 'huong.lan@creativeart.vn', '0912-445-667', '45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', 'vip'),
('cust_03', 'Quang Anh Engineering', 'qanh@vieteng.com', '0988-123-999', '128 Hoàng Văn Thụ, Phú Nhuận, TP. Hồ Chí Minh', 'standard');

-- 3.2 Người dùng nội bộ (ĐÚNG 3 NHÂN VIÊN THEO YÊU CẦU) + Khách hàng
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `active`, `customer_id`, `phone`) VALUES
-- 1. Admin: Nguyễn Minh Kiệt
('usr_staff_admin', 'Nguyễn Minh Kiệt', 'minhkiet@computertech.vn', 'admin123', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', TRUE, NULL, '0901-888-999'),

-- 2. Sale: Nguyễn Việt Anh
('usr_staff_sale', 'Nguyễn Việt Anh', 'vietanh@computertech.vn', 'sale123', 'sale', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', TRUE, NULL, '0908-776-554'),

-- 3. Kho: Ngô Thành Tâm
('usr_staff_warehouse', 'Ngô Thành Tâm', 'thanhtam@computertech.vn', 'warehouse123', 'warehouse', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', TRUE, NULL, '0977-889-112'),

-- Tài khoản Khách hàng mua sắm Storefront
('usr_cust_01', 'Minh Tuấn Software Studio', 'tuan@minhstudio.dev', 'password123', 'customer', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', TRUE, 'cust_01', '0903-882-911'),
('usr_cust_02', 'Lan Hương Creative Studio', 'huong.lan@creativeart.vn', 'password123', 'customer', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', TRUE, 'cust_02', '0912-445-667');

-- 3.3 Danh mục Sản phẩm (HÌNH ẢNH THẬT CHẤT LƯỢNG CAO TỪ UNSPLASH)
INSERT INTO `products` (`id`, `sku`, `name`, `category`, `price`, `cost`, `warranty_months`, `specs`, `image`, `min_stock_alert`, `description`) VALUES
(
  'prod_01',
  'LTP-MBP16-M3M',
  'Apple MacBook Pro 16" M3 Max Space Black',
  'laptops',
  89990000,
  73000000,
  12,
  '{"CPU": "Apple M3 Max 16-Core", "GPU": "40-Core GPU", "RAM": "48GB Unified Memory", "SSD": "1TB NVMe Superfast", "Display": "16.2 inch Liquid Retina XDR 120Hz ProMotion"}',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  2,
  'Đỉnh cao máy trạm di động cho đồ họa chuyên nghiệp, render video 8K ProRes và dựng mô hình 3D mượt mà.'
),
(
  'prod_02',
  'LTP-XPS16-U9',
  'Dell XPS 16 9640 Core Ultra 9 185H OLED',
  'laptops',
  68500000,
  54000000,
  24,
  '{"CPU": "Intel Core Ultra 9 185H (16-core, 5.1GHz)", "RAM": "32GB LPDDR5X-7467MHz", "SSD": "1TB M.2 PCIe Gen4", "GPU": "NVIDIA GeForce RTX 4070 8GB", "Display": "16.3 inch 3.2K OLED Touch 120Hz"}',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
  3,
  'Thiết kế nhôm nguyên khối cắt CNC tinh xảo, kính cường lực Gorilla Glass và màn hình vô cực OLED sống động.'
),
(
  'prod_03',
  'LTP-ROG-G16-2024',
  'ASUS ROG Zephyrus G16 (2024) OLED Gaming',
  'laptops',
  62990000,
  49500000,
  24,
  '{"CPU": "Intel Core Ultra 9 185H NPU AI", "RAM": "32GB LPDDR5X-7467MHz", "SSD": "2TB PCIe Gen4 NVMe", "GPU": "NVIDIA RTX 4080 12GB GDDR6", "Display": "16 inch 2.5K 240Hz 0.2ms OLED Nebula"}',
  'https://images.unsplash.com/photo-1547659165-68bd40a0856c?w=800&auto=format&fit=crop&q=80',
  2,
  'Laptop gaming mỏng nhẹ cao cấp nhất của dòng ROG với dải đèn chéo Slash Lighting độc bản.'
),
(
  'prod_04',
  'GPU-RTX4090-OC',
  'ASUS ROG Strix GeForce RTX 4090 OC 24GB',
  'pc_parts',
  54900000,
  44000000,
  36,
  '{"CUDA": "16,384 Cores", "Clock": "2640 MHz (OC Mode)", "VRAM": "24GB GDDR6X 384-bit", "Power": "16-pin 12VHPWR (850W+ PSU)", "Cooling": "Patented Axial-tech 3.5 slot"}',
  'https://images.unsplash.com/photo-1601153211050-ae2e1fa428d7?w=800&auto=format&fit=crop&q=80',
  2,
  'Card màn hình mạnh nhất thế giới kiến trúc Ada Lovelace, tối ưu ray tracing và AI deep learning.'
),
(
  'prod_05',
  'GPU-MSI-4080S-SUPRIM',
  'MSI GeForce RTX 4080 SUPER 16G SUPRIM X',
  'pc_parts',
  34990000,
  28500000,
  36,
  '{"CUDA": "10,240 Cores", "BoostClock": "2640 MHz", "VRAM": "16GB GDDR6X 256-bit", "Cooling": "TRI FROZR 3S Vapor Chamber"}',
  'https://images.unsplash.com/photo-1761132046162-01e1b6d29dd7?w=800&auto=format&fit=crop&q=80',
  2,
  'Card đồ họa phân khúc siêu cao cấp với lớp vỏ nhôm phay xước, quạt TORX 5.0 và Dual BIOS êm ái.'
),
(
  'prod_06',
  'CPU-AMD9950X',
  'AMD Ryzen 9 9950X Zen 5 Desktop Processor',
  'pc_parts',
  18490000,
  14800000,
  36,
  '{"Cores": "16 Cores / 32 Threads", "BaseClock": "4.3 GHz", "BoostClock": "5.7 GHz", "Cache": "80MB L2+L3", "Socket": "AM5", "TDP": "170W"}',
  'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
  4,
  'Vi xử lý 16 nhân 32 luồng kiến trúc Zen 5 4nm tiên tiến, hỗ trợ chuẩn PCIe 5.0 và bộ nhớ DDR5 EXPO.'
),
(
  'prod_07',
  'MB-ROG-Z790-HERO',
  'ASUS ROG MAXIMUS Z790 HERO BTF Motherboard',
  'pc_parts',
  17890000,
  14200000,
  36,
  '{"Socket": "LGA1700", "VRM": "20+1 Power Stages 90A", "RAM": "4x DDR5 8000+ MHz (OC)", "M2": "5x NVMe Slots", "Network": "Wi-Fi 7 & 2.5GbE"}',
  'https://images.unsplash.com/photo-1556742419-3d4480213f85?w=800&auto=format&fit=crop&q=80',
  3,
  'Bo mạch chủ chuyên ép xung cao cấp, giấu toàn bộ dây cáp ra mặt sau bo mạch (BTF layout).'
),
(
  'prod_08',
  'SSD-S990PRO-2TB',
  'Samsung 990 PRO NVMe M.2 SSD 2TB Heatsink',
  'pc_parts',
  4990000,
  3800000,
  60,
  '{"ReadSpeed": "7,450 MB/s", "WriteSpeed": "6,900 MB/s", "Interface": "PCIe Gen 4.0 x4, NVMe 2.0", "Heatsink": "Anodized Aluminum Built-in"}',
  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
  5,
  'Ổ cứng thể rắn tốc độ đọc đỉnh 7,450 MB/s, tích hợp tản nhiệt nguyên bản tương thích PC và PS5.'
),
(
  'prod_09',
  'RAM-CORSAIR-DDR5-64G',
  'Corsair DOMINATOR TITANIUM DDR5 64GB (2x32GB)',
  'pc_parts',
  8290000,
  6300000,
  60,
  '{"Capacity": "64GB (2x 32GB Kit)", "Speed": "6000 MT/s (CL30)", "Cooling": "DHX Patented Aluminum", "Profile": "Intel XMP 3.0 & AMD EXPO"}',
  'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
  3,
  'Kit RAM DDR5 cao cấp với thanh tản nhiệt tháo rời, hiệu năng cực cao và ổn định cho máy trạm.'
),
(
  'prod_10',
  'CSE-NZXT-H9-FLOW',
  'NZXT H9 Flow Panoramic Dual-Chamber Case',
  'pc_parts',
  4350000,
  3200000,
  24,
  '{"Layout": "Dual-Chamber", "Glass": "Seamless Curved View", "FanSupport": "Up to 10 Fans / 3x 360mm Radiator", "GPUClearance": "435mm"}',
  'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80',
  3,
  'Vỏ case bể cá không cột góc kính cường lực, thiết kế 2 khoang thoáng khí tối ưu cho cấu hình máy khủng.'
),
(
  'prod_11',
  'DSP-LG32GS95UE',
  'LG UltraGear 32" OLED Dual-Hz 4K/FHD 240Hz',
  'displays',
  34990000,
  27500000,
  24,
  '{"Panel": "31.5 inch WOLED Anti-Glare", "DualMode": "4K 240Hz hoặc FHD 480Hz", "ResponseTime": "0.03ms (GtG)", "HDR": "DisplayHDR True Black 400"}',
  'https://images.unsplash.com/photo-1569496507125-e82f47abe651?w=800&auto=format&fit=crop&q=80',
  2,
  'Màn hình Gaming OLED chế độ kép đầu tiên trên thế giới: Chuyển đổi linh hoạt giữa 4K 240Hz và FHD 480Hz.'
),
(
  'prod_12',
  'DSP-PROART-PA279CRV',
  'ASUS ProArt Display 27" 4K HDR USB-C Professional',
  'displays',
  13500000,
  10400000,
  36,
  '{"Panel": "27 inch IPS 4K UHD (3840x2160)", "Color": "Delta E < 2, 99% DCI-P3, 99% Adobe RGB", "USB_C": "96W Power Delivery Hub"}',
  'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
  3,
  'Màn hình đồ họa màu sắc chuẩn điện ảnh cân màu xuất xưởng Calman Verified cho studio đồ họa.'
),
(
  'prod_13',
  'KB-KEYCHRON-Q1PRO',
  'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
  'accessories',
  4950000,
  3600000,
  12,
  '{"Body": "CNC Machined 6063 Aluminum", "Mount": "Double-Gasket Mount", "Switches": "Keychron K Pro Red Pre-lubed", "Wireless": "Bluetooth 5.1 & Type-C"}',
  'https://plus.unsplash.com/premium_photo-1683543124615-fb42e42c6201?w=800&auto=format&fit=crop&q=80',
  4,
  'Bàn phím cơ không dây layout 75% vỏ nhôm CNC nguyên khối hỗ trợ tùy biến QMK/VIA mượt mà.'
),
(
  'prod_14',
  'MSE-LOGI-GPX2',
  'Logitech G PRO X SUPERLIGHT 2 Wireless Mouse',
  'accessories',
  3490000,
  2600000,
  24,
  '{"Sensor": "HERO 2 44,000 DPI", "PollingRate": "Up to 4000Hz (4K)", "Weight": "60g Ultra-lightweight", "Switches": "LIGHTFORCE Hybrid Optical-Mechanical"}',
  'https://images.unsplash.com/photo-1725440158599-ba334deda71c?w=800&auto=format&fit=crop&q=80',
  5,
  'Chuột thể thao điện tử nhẹ kỷ lục 60g, switch lai quang-cơ độ bền vô đối và cảm biến chính xác tuyệt đối.'
),
(
  'prod_15',
  'HDS-STEEL-NOVAPRO',
  'SteelSeries Arctis Nova Pro Wireless High-Res Headset',
  'accessories',
  8990000,
  6800000,
  24,
  '{"Drivers": "High-Res 40mm Neodymium 10-40,000Hz", "ANC": "4-mic Hybrid Active Noise Cancellation", "Battery": "Hot-swappable dual battery system"}',
  'https://images.unsplash.com/photo-1636487658538-ce06868f2ff0?w=800&auto=format&fit=crop&q=80',
  3,
  'Tai nghe không dây chống ồn chủ động đẳng cấp Audiophile, trạm phát Base Station kép và thay pin nóng liên tục.'
);

-- 3.4 Quản lý Tồn kho (Inventory Matching Products)
INSERT INTO `inventory` (`product_id`, `quantity_on_hand`, `quantity_reserved`, `location`) VALUES
('prod_01', 8, 1, 'Kho A - Kệ 01 (Vault)'),
('prod_02', 10, 1, 'Kho A - Kệ 02'),
('prod_03', 6, 0, 'Kho A - Kệ 03'),
('prod_04', 5, 1, 'Kho B - Kệ Linh kiện 01'),
('prod_05', 7, 1, 'Kho B - Kệ Linh kiện 02'),
('prod_06', 15, 2, 'Kho B - Tủ CPU 01'),
('prod_07', 12, 0, 'Kho B - Kệ Mainboard 01'),
('prod_08', 25, 3, 'Kho B - Hộc SSD 04'),
('prod_09', 14, 2, 'Kho B - Hộc RAM 02'),
('prod_10', 8, 1, 'Kho C - Pallet Case 01'),
('prod_11', 4, 0, 'Kho C - Khu Màn hình 01'),
('prod_12', 7, 0, 'Kho C - Khu Màn hình 02'),
('prod_13', 20, 2, 'Kho A - Kệ Phụ kiện 01'),
('prod_14', 30, 4, 'Kho A - Kệ Phụ kiện 02'),
('prod_15', 16, 1, 'Kho A - Kệ Phụ kiện 03');

-- 3.5 Đơn hàng mẫu ban đầu
INSERT INTO `orders` (`id`, `order_number`, `customer_id`, `status`, `subtotal`, `discount_amount`, `total_amount`, `payment_status`, `payment_method`, `pricing_strategy_name`, `notes`) VALUES
('ord_1001', 'ORD-2026-1001', 'cust_01', 'completed', 89990000, 4499500, 85490500, 'paid', 'bank_transfer', 'VIP Privilege (5%)', 'Giao hàng văn phòng Diamond Plaza, xuất VAT đầy đủ.'),
('ord_1002', 'ORD-2026-1002', 'cust_02', 'confirmed', 54900000, 2745000, 52155000, 'paid', 'card', 'VIP Privilege (5%)', 'Giao hỏa tốc 2H studio đường Nguyễn Huệ.');

-- 3.6 Chi tiết Đơn hàng mẫu
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `product_sku`, `quantity`, `unit_price`, `subtotal`) VALUES
('item_01', 'ord_1001', 'prod_01', 'Apple MacBook Pro 16" M3 Max Space Black', 'LTP-MBP16-M3M', 1, 89990000, 89990000),
('item_02', 'ord_1002', 'prod_04', 'ASUS ROG Strix GeForce RTX 4090 OC 24GB', 'GPU-RTX4090-OC', 1, 54900000, 54900000);

-- 3.7 Lịch sử xuất nhập kho mẫu
INSERT INTO `inventory_transactions` (`id`, `product_id`, `type`, `quantity`, `previous_on_hand`, `new_on_hand`, `previous_reserved`, `new_reserved`, `reason`, `actor_id`, `actor_name`, `reference_type`, `reference_id`) VALUES
('tx_01', 'prod_01', 'receipt', 10, 0, 10, 0, 0, 'Nhập kho chính hãng từ Nhà phân phối Apple', 'usr_staff_warehouse', 'Ngô Thành Tâm (Kho)', 'initial_stock', 'PO-2026-001'),
('tx_02', 'prod_01', 'issue', 1, 10, 9, 1, 0, 'Xuất kho hoàn tất đơn hàng ORD-2026-1001', 'usr_staff_sale', 'Nguyễn Việt Anh (Sale)', 'order', 'ord_1001');

-- 3.8 Phiếu sửa chữa / bảo hành mẫu
INSERT INTO `repair_tickets` (`id`, `ticket_number`, `customer_id`, `device_name`, `serial_number`, `issue_description`, `diagnostic_notes`, `status`, `technician_id`, `technician_name`, `estimated_cost`, `labor_fee`, `final_cost`) VALUES
('rpr_2001', 'RPR-2026-2001', 'cust_01', 'Workstation PC Dual RTX 4090', 'CT-WS-9921', 'Kiểm tra bảo dưỡng tản nhiệt nước định kỳ', 'Nhiệt độ full load 68 độ C, hoàn hảo.', 'repaired', 'usr_staff_warehouse', 'Ngô Thành Tâm', 1500000, 500000, 500000);

-- 3.9 Thông báo hệ thống
INSERT INTO `app_notifications` (`id`, `title`, `message`, `severity`, `is_read`, `link_to`) VALUES
('notif_01', 'Hệ thống đã khởi tạo thành công', 'Cơ sở dữ liệu COMPUTERTECH đã được làm mới toàn diện trên Aiven MySQL.', 'success', FALSE, '{"module": "dashboard"}');

-- =====================================================================
-- HOÀN TẤT KHỞI TẠO CƠ SỞ DỮ LIỆU COMPUTERTECH
-- =====================================================================
