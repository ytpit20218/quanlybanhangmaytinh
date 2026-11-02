import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const CUSTOMERS = [
  {
    id: 'cust_01',
    name: 'Minh Tuan Software Studio',
    email: 'tuan@minhstudio.dev',
    phone: '0903-882-911',
    address: 'Floor 8, Diamond Plaza, Dist 1, Ho Chi Minh City',
    tier: 'vip',
  },
  {
    id: 'cust_02',
    name: 'Lan Huong Creative',
    email: 'huong.lan@creativeart.vn',
    phone: '0912-445-667',
    address: '45 Nguyen Hue Blvd, Dist 1, Ho Chi Minh City',
    tier: 'vip',
  },
  {
    id: 'cust_03',
    name: 'Quang Anh Engineering',
    email: 'qanh@vieteng.com',
    phone: '0988-123-999',
    address: '128 Hoang Van Thu, Phu Nhuan, Ho Chi Minh City',
    tier: 'standard',
  },
  {
    id: 'cust_04',
    name: 'Thao Vy Vo',
    email: 'vy.vo@gmail.com',
    phone: '0937-554-122',
    address: '68 Vo Thi Sau, Dist 3, Ho Chi Minh City',
    tier: 'standard',
  },
  {
    id: 'cust_05',
    name: 'NovaLab Animation & VFX Studio',
    email: 'contact@novalab.design',
    phone: '0909-334-556',
    address: 'Tòa nhà Bitexco, Q1, TP.HCM',
    tier: 'vip',
  },
];

const USERS = [
  {
    id: 'usr_customer_01',
    name: 'Minh Tuan Software Studio',
    email: 'tuan@minhstudio.dev',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    active: true,
    customerId: 'cust_01',
    phone: '0903-882-911',
  },
  {
    id: 'usr_customer_02',
    name: 'Lan Huong Creative',
    email: 'huong.lan@creativeart.vn',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    active: true,
    customerId: 'cust_02',
    phone: '0912-445-667',
  },
  {
    id: 'usr_customer_03',
    name: 'Quang Anh Engineering',
    email: 'qanh@vieteng.com',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    active: true,
    customerId: 'cust_03',
    phone: '0988-123-999',
  },
  {
    id: 'usr_customer_04',
    name: 'Thảo Vy Content Creator',
    email: 'vy.vo@gmail.com',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    active: true,
    customerId: 'cust_04',
    phone: '0937-554-122',
  },
  {
    id: 'usr_customer_05',
    name: 'NovaLab Animation & VFX Studio',
    email: 'contact@novalab.design',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
    customerId: 'cust_05',
    phone: '0909-334-556',
  },
  {
    id: 'usr_admin',
    name: 'Alexander Nguyen',
    email: 'admin@computertech.vn',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'usr_admin_02',
    name: 'Hoàng Yến Tech Director',
    email: 'director@computertech.vn',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0901-234-888',
  },
  {
    id: 'usr_sale',
    name: 'Mai Tran',
    email: 'sale@computertech.vn',
    password: 'sale123',
    role: 'sale',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'usr_sale_02',
    name: 'Tuấn Kiệt Senior Consultant',
    email: 'kiet.tuan@computertech.vn',
    password: 'sale123',
    role: 'sale',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0908-776-554',
  },
  {
    id: 'usr_sale_03',
    name: 'Bích Ngọc B2B Manager',
    email: 'ngoc.bich@computertech.vn',
    password: 'sale123',
    role: 'sale',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0933-221-144',
  },
  {
    id: 'usr_warehouse',
    name: 'Duc Pham',
    email: 'warehouse@computertech.vn',
    password: 'warehouse123',
    role: 'warehouse',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'usr_warehouse_02',
    name: 'Văn Hùng Stock Supervisor',
    email: 'hung.van@computertech.vn',
    password: 'warehouse123',
    role: 'warehouse',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0977-889-112',
  },
  {
    id: 'usr_tech',
    name: 'Huy Le',
    email: 'technician@computertech.vn',
    password: 'tech123',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'usr_tech_02',
    name: 'Thanh Sơn Lead Hardware Engineer',
    email: 'son.thanh@computertech.vn',
    password: 'tech123',
    role: 'technician',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    active: true,
    phone: '0945-667-889',
  },
  {
    id: 'usr_inactive',
    name: 'Bao Hoang (Suspended Staff)',
    email: 'suspended@computertech.vn',
    password: 'password123',
    role: 'sale',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    active: false,
  },
];

const PRODUCTS = [
  {
    id: 'prod_01',
    sku: 'LTP-XPS16-U9',
    name: 'Dell XPS 16 9640 Core Ultra 9',
    category: 'laptops',
    price: 68500000,
    cost: 54000000,
    warrantyMonths: 24,
    minStockAlert: 3,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    description: 'Workstation powerhouse featuring 3.2K OLED InfinityEdge display, Intel Core Ultra 9 185H, 32GB LPDDR5X, RTX 4070.',
    specs: {
      Processor: 'Intel Core Ultra 9 185H (16-core, 5.1GHz)',
      Memory: '32GB LPDDR5X-7467MHz Dual Channel',
      Storage: '1TB M.2 PCIe Gen4 NVMe SSD',
      Display: '16.3" 3.2K (3200x2000) OLED Touch 120Hz',
      Graphics: 'NVIDIA GeForce RTX 4070 8GB GDDR6',
      Weight: '2.13 kg CNC Aluminum Chassis',
    },
    inventory: { onHand: 8, reserved: 1, location: 'Warehouse A - Bay 02' }
  },
  {
    id: 'prod_02',
    sku: 'LTP-MBP16-M3M',
    name: 'Apple MacBook Pro 16" M3 Max',
    category: 'laptops',
    price: 89990000,
    cost: 73000000,
    warrantyMonths: 12,
    minStockAlert: 2,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    description: 'Liquid Retina XDR, Apple M3 Max 16-Core CPU, 40-Core GPU, 48GB Unified Memory, 1TB SSD, Space Black.',
    specs: {
      Processor: 'Apple M3 Max 16-Core CPU (12P + 4E)',
      Memory: '48GB Unified Memory (300GB/s bandwidth)',
      Storage: '1TB Superfast PCIe NVMe SSD',
      Display: '16.2" Liquid Retina XDR (3456x2234) 120Hz ProMotion',
      Graphics: '40-Core Apple Neural / Metal GPU',
    },
    inventory: { onHand: 5, reserved: 1, location: 'Warehouse A - Bay 03 (Vault)' }
  },
  {
    id: 'prod_03',
    sku: 'GPU-RTX4090-OC',
    name: 'ASUS ROG Strix GeForce RTX 4090 OC 24GB',
    category: 'pc_parts',
    price: 54900000,
    cost: 44000000,
    warrantyMonths: 36,
    minStockAlert: 2,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    description: 'The pinnacle of desktop graphics performance. Ada Lovelace architecture, 24GB GDDR6X, 3.5-slot die-cast frame.',
    specs: {
      CUDA: '16,384 Cores',
      EngineClock: '2640 MHz (OC Mode)',
      VRAM: '24GB GDDR6X 384-bit',
      Cooling: 'Patented axial-tech fans with reverse rotation',
    },
    inventory: { onHand: 3, reserved: 1, location: 'Warehouse B - Rack 10' }
  },
  {
    id: 'prod_04',
    sku: 'CPU-AMD9950X',
    name: 'AMD Ryzen 9 9950X Zen 5 Desktop Processor',
    category: 'pc_parts',
    price: 18490000,
    cost: 14800000,
    warrantyMonths: 36,
    minStockAlert: 4,
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
    description: '16 cores, 32 threads built on revolutionary TSMC 4nm Zen 5 architecture. Socket AM5, PCIe 5.0 ready.',
    specs: {
      CoresThreads: '16 Cores / 32 Threads',
      ClockSpeed: '4.3 GHz Base / Up to 5.7 GHz Boost',
      Cache: '80MB Combined L2+L3 Cache',
    },
    inventory: { onHand: 12, reserved: 2, location: 'Warehouse B - Rack 11' }
  },
  {
    id: 'prod_05',
    sku: 'SSD-S990PRO-2TB',
    name: 'Samsung 990 PRO NVMe M.2 SSD 2TB with Heatsink',
    category: 'pc_parts',
    price: 4990000,
    cost: 3800000,
    warrantyMonths: 60,
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
    description: 'Sequential read speeds up to 7,450 MB/s. Integrated slim heatsink compatible with PS5 & PC gaming rigs.',
    specs: {
      FormFactor: 'M.2 2280 PCIe Gen 4.0 x4',
      SequentialRead: '7,450 MB/s',
      SequentialWrite: '6,900 MB/s',
    },
    inventory: { onHand: 25, reserved: 3, location: 'Warehouse B - Drawer C-04' }
  },
  {
    id: 'prod_06',
    sku: 'DSP-LG32GS95UE',
    name: 'LG UltraGear 32" OLED Dual-Hz 4K/FHD Gaming Monitor',
    category: 'displays',
    price: 34990000,
    cost: 27500000,
    warrantyMonths: 24,
    minStockAlert: 2,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    description: 'World-first Dual-Mode OLED: switch seamlessly between 4K 240Hz and FHD 480Hz. 0.03ms GtG response.',
    specs: {
      Panel: '31.5" WOLED Anti-Glare',
      Resolution: '3840x2160 (240Hz) / 1920x1080 (480Hz)',
    },
    inventory: { onHand: 4, reserved: 0, location: 'Warehouse C - Display Hall' }
  },
  {
    id: 'prod_07',
    sku: 'DSP-PROART-PA279CRV',
    name: 'ASUS ProArt Display 27" 4K HDR USB-C Professional',
    category: 'displays',
    price: 13500000,
    cost: 10400000,
    warrantyMonths: 36,
    minStockAlert: 3,
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
    description: 'Factory pre-calibrated Delta E < 2 color accuracy for creative professionals, video colorists, and CAD designers.',
    specs: {
      Panel: '27" IPS 4K UHD (3840 x 2160)',
      ColorAccuracy: 'Delta E < 2, 99% DCI-P3',
    },
    inventory: { onHand: 7, reserved: 0, location: 'Warehouse C - Display Hall' }
  },
  {
    id: 'prod_08',
    sku: 'KB-KEYCHRON-Q1PRO',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    category: 'accessories',
    price: 4950000,
    cost: 3600000,
    warrantyMonths: 12,
    minStockAlert: 4,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
    description: 'CNC full aluminum 75% QMK/VIA wireless mechanical keyboard. Double-gasket mount design, Hot-swappable.',
    specs: {
      BodyMaterial: 'Full CNC Machined 6063 Aluminum',
      Switches: 'Keychron K Pro Red Mechanical Switches',
    },
    inventory: { onHand: 15, reserved: 1, location: 'Warehouse A - Accessory Bin 01' }
  },
  {
    id: 'prod_09',
    sku: 'RAM-CORSAIR-DDR5-64G',
    name: 'Corsair DOMINATOR TITANIUM DDR5 64GB (2x32GB) 6000MHz',
    category: 'pc_parts',
    price: 8290000,
    cost: 6300000,
    warrantyMonths: 60,
    minStockAlert: 3,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80',
    description: 'Elite memory modules featuring precision die-cast aluminum heatspreaders and patented DHX cooling.',
    specs: {
      Capacity: '64GB (2x 32GB Kit)',
      Speed: 'DDR5 6000 MT/s (CL30-36-36-76)',
    },
    inventory: { onHand: 9, reserved: 2, location: 'Warehouse B - Drawer C-02' }
  },
  {
    id: 'prod_10',
    sku: 'SRV-PASTE-TF8',
    name: 'Thermal Grizzly Kryonaut Extreme 2g (Diagnostic Bench Part)',
    category: 'accessories',
    price: 390000,
    cost: 240000,
    warrantyMonths: 12,
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    description: 'Ultra high thermal conductivity paste (14.2 W/mK) for GPU/CPU service bench replacements and re-pasting.',
    specs: {
      Conductivity: '14.2 W/mK',
      OperatingTemp: '-250 °C / +350 °C',
    },
    inventory: { onHand: 30, reserved: 2, location: 'Tech Workshop - Service Cabinet' }
  },
  {
    id: 'prod_11',
    sku: 'LTP-ROG-G16-2024',
    name: 'ASUS ROG Zephyrus G16 (2024) OLED GU605',
    category: 'laptops',
    price: 62990000,
    cost: 49500000,
    warrantyMonths: 24,
    minStockAlert: 2,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    description: 'Laptop gaming siêu mỏng nhẹ cao cấp CNC nhôm nguyên khối, màn hình ROG Nebula 2.5K 240Hz OLED, Intel Core Ultra 9 185H, RTX 4080 12GB.',
    specs: {
      Processor: 'Intel Core Ultra 9 185H (16-core, 5.1GHz)',
      Memory: '32GB LPDDR5X-7467MHz Dual Channel',
      Storage: '2TB M.2 PCIe Gen4 NVMe SSD',
      Display: '16" 2.5K (2560x1600) 240Hz 0.2ms OLED DCI-P3 100%',
      Graphics: 'NVIDIA GeForce RTX 4080 12GB GDDR6 (115W TGP)',
      Weight: '1.85 kg CNC Aluminum Eclipse Gray',
    },
    inventory: { onHand: 6, reserved: 1, location: 'Warehouse A - Bay 04' }
  },
  {
    id: 'prod_12',
    sku: 'LTP-THINKPAD-X1C12',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12 Ultra 7',
    category: 'laptops',
    price: 56990000,
    cost: 45000000,
    warrantyMonths: 36,
    minStockAlert: 3,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    description: 'Biểu tượng doanh nhân đỉnh cao với khung sợi carbon siêu bền chuẩn quân đội MIL-STD-810H, Intel Core Ultra 7 155H, màn hình 2.8K OLED 120Hz.',
    specs: {
      Processor: 'Intel Core Ultra 7 155H (16-core NPU AI Boost)',
      Memory: '32GB LPDDR5X-6400MHz',
      Storage: '1TB PCIe Performance Gen4 SSD',
      Display: '14" 2.8K (2880x1800) OLED 120Hz HDR 500 True Black',
      Weight: '1.09 kg Carbon Fiber & Recycled Magnesium',
    },
    inventory: { onHand: 9, reserved: 2, location: 'Warehouse A - Bay 05' }
  },
  {
    id: 'prod_13',
    sku: 'GPU-MSI-4080S-SUPRIM',
    name: 'MSI GeForce RTX 4080 SUPER 16G SUPRIM X',
    category: 'pc_parts',
    price: 34990000,
    cost: 28500000,
    warrantyMonths: 36,
    minStockAlert: 2,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    description: 'Card đồ họa flagship dòng SUPRIM với vỏ nhôm phay xước cao cấp, tản nhiệt buồng hơi TRI FROZR 3S, quạt TORX FAN 5.0 và Dual BIOS Silent/Gaming.',
    specs: {
      CUDA: '10,240 Cores',
      BoostClock: '2640 MHz (Extreme Performance)',
      VRAM: '16GB GDDR6X 256-bit 23Gbps',
      Power: '16-pin 12VHPWR (850W PSU recommended)',
      Cooling: 'Vapor Chamber + Tri Frozr 3S',
    },
    inventory: { onHand: 7, reserved: 1, location: 'Warehouse B - Rack 08' }
  },
  {
    id: 'prod_14',
    sku: 'MB-ROG-Z790-HERO',
    name: 'ASUS ROG MAXIMUS Z790 HERO BTF Motherboard',
    category: 'pc_parts',
    price: 17890000,
    cost: 14200000,
    warrantyMonths: 36,
    minStockAlert: 3,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    description: 'Bo mạch chủ cao cấp chuyên ép xung và Gaming, 20+1 pha nguồn 90A, hỗ trợ DDR5-8000+ MT/s, 5 khe M.2 NVMe (1x PCIe 5.0), Wi-Fi 7 và Thunderbolt 4.',
    specs: {
      Socket: 'LGA1700 (Intel 14th/13th/12th Gen)',
      VRM: '20+1 Power Stages (90A)',
      Memory: '4x DIMM DDR5 Dual Channel up to 192GB (8000+ OC)',
      Expansion: '2x PCIe 5.0 x16 SafeSlots',
      Networking: 'Intel 2.5Gb Ethernet & Intel Wi-Fi 7',
    },
    inventory: { onHand: 10, reserved: 0, location: 'Warehouse B - Rack 03' }
  },
  {
    id: 'prod_15',
    sku: 'CLR-ICUE-LINK-TITAN360',
    name: 'Corsair iCUE LINK TITAN 360 RX RGB Liquid Cooler',
    category: 'pc_parts',
    price: 5490000,
    cost: 4100000,
    warrantyMonths: 60,
    minStockAlert: 4,
    image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=800&auto=format&fit=crop&q=80',
    description: 'Tản nhiệt nước AIO 360mm công nghệ một dây cáp nối tiếp iCUE LINK độc quyền, động cơ FlowDrive 3 pha siêu êm, quạt RX120 RGB áp suất tĩnh cao.',
    specs: {
      Radiator: '360mm Aluminum (397mm x 120mm x 27mm)',
      Fans: '3x RX120 RGB Magnetic Dome Bearing (up to 2100 RPM)',
      ColdPlate: 'Split-flow copper with pre-applied XTM70 paste',
      Compatibility: 'Intel LGA1700/1851 & AMD AM5/AM4',
    },
    inventory: { onHand: 14, reserved: 2, location: 'Warehouse B - Rack 15' }
  },
  {
    id: 'prod_16',
    sku: 'CSE-NZXT-H9-FLOW',
    name: 'NZXT H9 Flow Dual-Chamber Panoramic Mid-Tower Case',
    category: 'pc_parts',
    price: 4350000,
    cost: 3200000,
    warrantyMonths: 24,
    minStockAlert: 3,
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80',
    description: 'Vỏ case máy tính thiết kế 2 khoang góc nhìn kính toàn cảnh liền mạch không cột góc, tối ưu luồng gió tản nhiệt cho các cấu hình GPU khủng.',
    specs: {
      Chamber: 'Dual-Chamber Layout with perforated top/side mesh',
      RadiatorSupport: 'Up to 3x 360mm Radiators simultaneously',
      GPUClearance: 'Up to 435mm length',
      PreInstalledFans: '4x 120mm Quiet Airflow Fans',
      Dimensions: '495mm x 290mm x 466mm',
    },
    inventory: { onHand: 8, reserved: 1, location: 'Warehouse C - Pallet Case 02' }
  },
  {
    id: 'prod_17',
    sku: 'DSP-NEO-G9-57',
    name: 'Samsung Odyssey Neo G9 57" Dual 4K Mini-LED Curved Monitor',
    category: 'displays',
    price: 59990000,
    cost: 47000000,
    warrantyMonths: 24,
    minStockAlert: 1,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    description: 'Màn hình cong chơi game Dual 4K UHD đầu tiên trên thế giới tỉ lệ 32:9 (7680x2160), tần số quét 240Hz, công nghệ Quantum Mini-LED 2,392 vùng sáng.',
    specs: {
      Panel: '57" Quantum Mini-LED 1000R Curved (32:9 Super Ultra-Wide)',
      Resolution: 'Dual UHD 7680 x 2160 @ 240Hz',
      ResponseTime: '1ms (GtG)',
      PeakBrightness: '1000 nits (VESA DisplayHDR 1000)',
      Connectivity: 'DisplayPort 2.1 (UHBR13.5), 3x HDMI 2.1',
    },
    inventory: { onHand: 3, reserved: 0, location: 'Warehouse C - Pallet Display 04' }
  },
  {
    id: 'prod_18',
    sku: 'DSP-DELL-U3224KB',
    name: 'Dell UltraSharp 32 6K Thunderbolt 4 Monitor (U3224KB)',
    category: 'displays',
    price: 68900000,
    cost: 55000000,
    warrantyMonths: 36,
    minStockAlert: 2,
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
    description: 'Màn hình 6K (6144 x 3456) công nghệ IPS Black đầu tiên trên thế giới, tích hợp Webcam 4K HDR Sony STARVIS, micro chống ồn và Thunderbolt 4 140W PD.',
    specs: {
      Resolution: '6K 6144 x 3456 @ 60Hz (223 PPI)',
      Panel: 'IPS Black technology (2000:1 contrast ratio)',
      ColorAccuracy: '99% DCI-P3, 100% sRGB, Delta E < 1.5',
      HubPorts: 'Thunderbolt 4 with 140W Power Delivery, 2.5GbE LAN, 5x USB-A/C',
      IntegratedCamera: '4K dual-gain HDR sensor with auto-framing',
    },
    inventory: { onHand: 4, reserved: 1, location: 'Warehouse C - Vault Display 01' }
  },
  {
    id: 'prod_19',
    sku: 'MSE-LOGI-GPX2',
    name: 'Logitech G PRO X SUPERLIGHT 2 Wireless Gaming Mouse',
    category: 'accessories',
    price: 3490000,
    cost: 2600000,
    warrantyMonths: 24,
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    description: 'Chuột gaming không dây Esports biểu tượng nặng chỉ 60g, cảm biến HERO 2 độ phân giải 44,000 DPI, switch lai quang-cơ LIGHTFORCE tốc độ ánh sáng.',
    specs: {
      Sensor: 'HERO 2 (100 - 44,000 DPI, 888 IPS, 88G)',
      PollingRate: 'Up to 4000Hz (4K report rate)',
      Weight: '60g Ultra-lightweight',
      Switches: 'LIGHTFORCE Optical-Mechanical Hybrid',
      BatteryLife: 'Up to 95 hours constant motion',
    },
    inventory: { onHand: 28, reserved: 3, location: 'Warehouse A - Shelf 01' }
  },
  {
    id: 'prod_20',
    sku: 'HDS-STEEL-NOVAPRO',
    name: 'SteelSeries Arctis Nova Pro Wireless High-Res Headset',
    category: 'accessories',
    price: 8990000,
    cost: 6800000,
    warrantyMonths: 24,
    minStockAlert: 3,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    description: 'Tai nghe không dây chuẩn Audiophile với màng loa High-Res Neodymium, chống ồn chủ động 4 mic Hybrid ANC, trạm phát Base Station kép và thay pin nóng liên tục.',
    specs: {
      Drivers: 'High-Res 40mm Neodymium (10 - 40,000 Hz)',
      NoiseCancellation: '4-mic Hybrid Active Noise Cancellation (ANC)',
      DualWireless: '2.4GHz Quantum 2.0 Gaming + Bluetooth 5.0 simultaneously',
      BatterySystem: 'Infinity Power System (2 hot-swappable batteries, unlimited play)',
      BaseStation: 'Multi-System Connect OLED Base Station with 10-band EQ',
    },
    inventory: { onHand: 16, reserved: 2, location: 'Warehouse A - Shelf 03' }
  },
];

async function seedData() {
  console.log('--- Synchronizing Customers, Users & Products to Aiven MySQL ---');
  const connection = await mysql.createConnection({
    host: process.env.AIVEN_MYSQL_HOST,
    port: Number(process.env.AIVEN_MYSQL_PORT),
    user: process.env.AIVEN_MYSQL_USER,
    password: process.env.AIVEN_MYSQL_PASSWORD,
    database: process.env.AIVEN_MYSQL_DATABASE,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // 1. Customers
    console.log(`Upserting ${CUSTOMERS.length} customers...`);
    for (const c of CUSTOMERS) {
      await connection.query(
        `INSERT INTO customers (id, name, email, phone, address, tier)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), address=VALUES(address), tier=VALUES(tier)`,
        [c.id, c.name, c.email, c.phone, c.address, c.tier]
      );
    }

    // 2. Users
    console.log(`Upserting ${USERS.length} users...`);
    for (const u of USERS) {
      await connection.query(
        `INSERT INTO users (id, name, email, password, role, avatar, active, customer_id, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password), role=VALUES(role), avatar=VALUES(avatar), active=VALUES(active), customer_id=VALUES(customer_id), phone=VALUES(phone)`,
        [u.id, u.name, u.email, u.password, u.role, u.avatar, u.active, u.customerId || null, u.phone || null]
      );
    }

    // 3. Products & Inventory
    console.log(`Upserting ${PRODUCTS.length} products & inventory...`);
    for (const p of PRODUCTS) {
      await connection.query(
        `INSERT INTO products (id, sku, name, category, price, cost, warranty_months, specs, image, min_stock_alert, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE sku=VALUES(sku), name=VALUES(name), category=VALUES(category), price=VALUES(price), cost=VALUES(cost), warranty_months=VALUES(warranty_months), specs=VALUES(specs), image=VALUES(image), min_stock_alert=VALUES(min_stock_alert), description=VALUES(description)`,
        [p.id, p.sku, p.name, p.category, p.price, p.cost, p.warrantyMonths, JSON.stringify(p.specs), p.image, p.minStockAlert, p.description]
      );

      if (p.inventory) {
        await connection.query(
          `INSERT INTO inventory (product_id, quantity_on_hand, quantity_reserved, location)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity_on_hand=VALUES(quantity_on_hand), quantity_reserved=VALUES(quantity_reserved), location=VALUES(location)`,
          [p.id, p.inventory.onHand, p.inventory.reserved, p.inventory.location]
        );
      }
    }

    console.log('\n--- Synchronization Completed Successfully! ---');
    const [cCount] = await connection.query('SELECT COUNT(*) as cnt FROM customers');
    const [uCount] = await connection.query('SELECT COUNT(*) as cnt FROM users');
    const [pCount] = await connection.query('SELECT COUNT(*) as cnt FROM products');
    const [iCount] = await connection.query('SELECT COUNT(*) as cnt FROM inventory');

    console.log(`- Customers in DB: ${cCount[0].cnt}`);
    console.log(`- Users in DB:     ${uCount[0].cnt}`);
    console.log(`- Products in DB:  ${pCount[0].cnt}`);
    console.log(`- Inventory in DB: ${iCount[0].cnt}`);

    // Show breakdown of users by role (Phân quyền)
    const [roleBreakdown] = await connection.query(
      `SELECT role, COUNT(*) as total_users, SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active_users
       FROM users GROUP BY role`
    );
    console.log('\n--- User Role Distribution (Phân quyền người dùng) ---');
    console.table(roleBreakdown);

    // Show breakdown of products by category
    const [catBreakdown] = await connection.query(
      `SELECT category, COUNT(*) as total_products, MIN(price) as min_price, MAX(price) as max_price
       FROM products GROUP BY category`
    );
    console.log('\n--- Product Category Distribution ---');
    console.table(catBreakdown);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedData();
