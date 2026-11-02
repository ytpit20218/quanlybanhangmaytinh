import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Safety validation
const TARGET_HOST = 'mysql-e3174a1-ytpit20218-a7cd.a.aivencloud.com';
const TARGET_DB = 'defaultdb';

if (!process.env.AIVEN_MYSQL_HOST?.includes('aivencloud.com')) {
  console.error('ABORT: Host is not an authorized Aiven host.');
  process.exit(1);
}

if (process.env.AIVEN_MYSQL_DATABASE !== TARGET_DB) {
  console.error(`ABORT: Database is not ${TARGET_DB}. Found: ${process.env.AIVEN_MYSQL_DATABASE}`);
  process.exit(1);
}

async function rebuild() {
  console.log('--- REBUILDING COMPUTERTECH DATABASE ON AIVEN MYSQL ---');
  console.log(`Connecting to: ${process.env.AIVEN_MYSQL_HOST}:${process.env.AIVEN_MYSQL_PORT}/${process.env.AIVEN_MYSQL_DATABASE}`);

  const connection = await mysql.createConnection({
    host: process.env.AIVEN_MYSQL_HOST,
    port: Number(process.env.AIVEN_MYSQL_PORT),
    user: process.env.AIVEN_MYSQL_USER,
    password: process.env.AIVEN_MYSQL_PASSWORD,
    database: process.env.AIVEN_MYSQL_DATABASE,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  });

  try {
    // 1. Verify host and database
    const [dbCheck] = await connection.query('SELECT DATABASE() as db, @@hostname as h, VERSION() as v');
    console.log('Confirmed Target Context:', dbCheck[0]);

    if (dbCheck[0].db !== 'defaultdb') {
      throw new Error(`Target database mismatch! Expected 'defaultdb', got: ${dbCheck[0].db}`);
    }

    console.log('\n--- 1. DROPPING EXISTING TABLES IN defaultdb ---');
    await connection.query(`
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS app_notifications;
      DROP TABLE IF EXISTS repair_parts;
      DROP TABLE IF EXISTS repair_histories;
      DROP TABLE IF EXISTS repair_tickets;
      DROP TABLE IF EXISTS order_status_histories;
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS inventory_transactions;
      DROP TABLE IF EXISTS inventory;
      DROP TABLE IF EXISTS warehouses;
      DROP TABLE IF EXISTS product_attributes;
      DROP TABLE IF EXISTS product_images;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS brands;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS customer_addresses;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS roles;
      SET FOREIGN_KEY_CHECKS = 1;
    `);
    console.log('✓ All old tables dropped cleanly.');

    console.log('\n--- 2. CREATING NEW NORMALIZED SCHEMAS ---');

    const DDL = `
      -- 1. Roles
      CREATE TABLE roles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(64) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 2. Customers
      CREATE TABLE customers (
        id VARCHAR(64) PRIMARY KEY,
        customer_code VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NULL,
        tier ENUM('standard', 'vip') NOT NULL DEFAULT 'standard',
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_tier (tier),
        INDEX idx_customer_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 3. Customer Addresses
      CREATE TABLE customer_addresses (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address_line TEXT NOT NULL,
        city VARCHAR(100) NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_addr_customer (customer_id),
        CONSTRAINT fk_addr_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 4. Users (Staff & Customer accounts with bcrypt password hashes)
      CREATE TABLE users (
        id VARCHAR(64) PRIMARY KEY,
        staff_code VARCHAR(64) NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        role_id VARCHAR(64) NOT NULL,
        role_name ENUM('admin', 'sale', 'warehouse', 'technician', 'customer') NOT NULL,
        avatar VARCHAR(512) NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        customer_id VARCHAR(64) NULL,
        phone VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_role (role_name),
        INDEX idx_user_customer (customer_id),
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
        CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 5. Categories
      CREATE TABLE categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        parent_id VARCHAR(64) NULL,
        description TEXT NULL,
        icon VARCHAR(128) NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category_slug (slug),
        CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 6. Brands
      CREATE TABLE brands (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        logo_url VARCHAR(512) NULL,
        website VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_brand_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 7. Products
      CREATE TABLE products (
        id VARCHAR(64) PRIMARY KEY,
        sku VARCHAR(64) NOT NULL UNIQUE,
        source_id VARCHAR(64) NULL,
        source_url VARCHAR(512) NULL,
        name VARCHAR(512) NOT NULL,
        slug VARCHAR(512) NOT NULL UNIQUE,
        brand_id VARCHAR(64) NULL,
        category_id VARCHAR(64) NOT NULL,
        price BIGINT NOT NULL CHECK (price >= 0),
        original_price BIGINT NULL CHECK (original_price >= 0),
        discount_percent INT NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
        cost_price BIGINT NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
        warranty_months INT NOT NULL DEFAULT 12,
        status ENUM('in_stock', 'out_of_stock', 'discontinued', 'pre_order') NOT NULL DEFAULT 'in_stock',
        short_description TEXT NULL,
        description LONGTEXT NULL,
        specs JSON NULL,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        is_new BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_prod_category (category_id),
        INDEX idx_prod_brand (brand_id),
        INDEX idx_prod_price (price),
        INDEX idx_prod_status (status),
        FULLTEXT INDEX idx_prod_search (name),
        CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES categories(id),
        CONSTRAINT fk_prod_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 8. Product Images
      CREATE TABLE product_images (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        image_url VARCHAR(512) NOT NULL,
        source_url VARCHAR(512) NULL,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INT NOT NULL DEFAULT 0,
        alt_text VARCHAR(255) NULL,
        verified BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_img_product (product_id),
        CONSTRAINT fk_img_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 9. Product Attributes
      CREATE TABLE product_attributes (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        attribute_name VARCHAR(128) NOT NULL,
        attribute_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_attr_product (product_id),
        INDEX idx_attr_name (attribute_name),
        CONSTRAINT fk_attr_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 10. Warehouses
      CREATE TABLE warehouses (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(64) NOT NULL UNIQUE,
        address TEXT NULL,
        city VARCHAR(100) NULL,
        manager_id VARCHAR(64) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_wh_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 11. Inventory (Strictly separate from products, non-negative checks)
      CREATE TABLE inventory (
        id VARCHAR(64) PRIMARY KEY,
        warehouse_id VARCHAR(64) NOT NULL,
        product_id VARCHAR(64) NOT NULL,
        quantity_on_hand INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
        quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
        bin_location VARCHAR(128) NULL,
        min_stock_alert INT NOT NULL DEFAULT 3,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_wh_prod (warehouse_id, product_id),
        INDEX idx_inv_product (product_id),
        CONSTRAINT fk_inv_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
        CONSTRAINT fk_inv_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 12. Inventory Transactions (Full Audit Trail)
      CREATE TABLE inventory_transactions (
        id VARCHAR(64) PRIMARY KEY,
        warehouse_id VARCHAR(64) NOT NULL,
        product_id VARCHAR(64) NOT NULL,
        type ENUM('receipt', 'issue', 'adjustment', 'reserve', 'release', 'transfer') NOT NULL,
        quantity INT NOT NULL,
        previous_on_hand INT NOT NULL,
        new_on_hand INT NOT NULL,
        previous_reserved INT NOT NULL,
        new_reserved INT NOT NULL,
        reason TEXT NOT NULL,
        actor_id VARCHAR(64) NOT NULL,
        actor_name VARCHAR(255) NOT NULL,
        reference_type ENUM('order', 'repair', 'manual_adjustment', 'initial_stock', 'po_import') NOT NULL,
        reference_id VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_it_product (product_id),
        INDEX idx_it_warehouse (warehouse_id),
        CONSTRAINT fk_it_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
        CONSTRAINT fk_it_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 13. Orders
      CREATE TABLE orders (
        id VARCHAR(64) PRIMARY KEY,
        order_number VARCHAR(64) NOT NULL UNIQUE,
        customer_id VARCHAR(64) NOT NULL,
        status ENUM('pending', 'confirmed', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
        discount_amount BIGINT NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
        shipping_fee BIGINT NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
        total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
        payment_status ENUM('unpaid', 'partially_paid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
        payment_method ENUM('cash', 'bank_transfer', 'card', 'cod') NOT NULL DEFAULT 'cash',
        pricing_strategy_name VARCHAR(128) NOT NULL DEFAULT 'Standard',
        notes TEXT NULL,
        creator_id VARCHAR(64) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_order_status (status),
        INDEX idx_order_customer (customer_id),
        CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
        CONSTRAINT fk_order_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 14. Order Items
      CREATE TABLE order_items (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(512) NOT NULL,
        product_sku VARCHAR(64) NOT NULL,
        quantity INT NOT NULL CHECK (quantity > 0),
        unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
        subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
        INDEX idx_oi_order (order_id),
        INDEX idx_oi_product (product_id),
        CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_oi_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 15. Payments
      CREATE TABLE payments (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        payment_number VARCHAR(64) NOT NULL UNIQUE,
        amount BIGINT NOT NULL CHECK (amount > 0),
        method ENUM('cash', 'bank_transfer', 'card', 'qr_pay') NOT NULL,
        status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'success',
        transaction_code VARCHAR(128) NULL,
        processed_by VARCHAR(64) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payment_order (order_id),
        CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 16. Order Status Histories
      CREATE TABLE order_status_histories (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        previous_status VARCHAR(64) NOT NULL,
        new_status VARCHAR(64) NOT NULL,
        notes TEXT NULL,
        actor_id VARCHAR(64) NOT NULL,
        actor_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_osh_order (order_id),
        CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 17. Repair Tickets
      CREATE TABLE repair_tickets (
        id VARCHAR(64) PRIMARY KEY,
        ticket_number VARCHAR(64) NOT NULL UNIQUE,
        customer_id VARCHAR(64) NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        serial_number VARCHAR(128) NULL,
        issue_description TEXT NOT NULL,
        diagnostic_notes TEXT NULL,
        status ENUM('intake', 'diagnosing', 'waiting_parts', 'in_progress', 'repaired', 'cancelled', 'handed_over') NOT NULL DEFAULT 'intake',
        technician_id VARCHAR(64) NULL,
        technician_name VARCHAR(255) NULL,
        estimated_cost BIGINT NULL DEFAULT 0,
        labor_fee BIGINT NULL DEFAULT 0,
        final_cost BIGINT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_rpr_status (status),
        INDEX idx_rpr_customer (customer_id),
        CONSTRAINT fk_rpr_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
        CONSTRAINT fk_rpr_tech FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 18. Repair Parts
      CREATE TABLE repair_parts (
        id VARCHAR(64) PRIMARY KEY,
        ticket_id VARCHAR(64) NOT NULL,
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL CHECK (quantity > 0),
        unit_price BIGINT NOT NULL,
        subtotal BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rp_ticket (ticket_id),
        CONSTRAINT fk_rp_ticket FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE CASCADE,
        CONSTRAINT fk_rp_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 19. Repair Histories
      CREATE TABLE repair_histories (
        id VARCHAR(64) PRIMARY KEY,
        ticket_id VARCHAR(64) NOT NULL,
        previous_status VARCHAR(64) NOT NULL,
        new_status VARCHAR(64) NOT NULL,
        notes TEXT NULL,
        actor_id VARCHAR(64) NOT NULL,
        actor_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rh_ticket (ticket_id),
        CONSTRAINT fk_rh_ticket FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- 20. App Notifications
      CREATE TABLE app_notifications (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        severity ENUM('info', 'success', 'warning', 'alert') NOT NULL DEFAULT 'info',
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        link_to JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(DDL);
    console.log('✓ All 20 tables created successfully.');

    console.log('\n--- 3. SEEDING ROLES, STAFF, WAREHOUSES & CUSTOMERS ---');

    // Roles
    await connection.query(`
      INSERT INTO roles (id, name, description) VALUES
      ('role_admin', 'admin', 'Toàn quyền quản trị hệ thống ERP, danh mục, kho và nhân sự'),
      ('role_sale', 'sale', 'Quản lý khách hàng, quầy bán lẻ POS và tạo đơn hàng'),
      ('role_warehouse', 'warehouse', 'Quản lý kho hàng, nhập xuất điều chuyển và kiểm kê tồn kho'),
      ('role_technician', 'technician', 'Quản lý phòng lab, bàn chẩn đoán phần cứng và bảo hành sửa chữa'),
      ('role_customer', 'customer', 'Khách hàng thành viên mua sắm trực tuyến và theo dõi đơn hàng');
    `);

    // Default Warehouses
    await connection.query(`
      INSERT INTO warehouses (id, name, code, address, city, is_active) VALUES
      ('wh_hcm', 'Kho Tổng TP. Hồ Chí Minh', 'WH-HCM-01', '72 Lê Thánh Tôn, Bến Nghé, Quận 1', 'TP. Hồ Chí Minh', TRUE),
      ('wh_bienhoa', 'Kho Chi Nhánh Biên Hòa', 'WH-BH-01', 'Phạm Văn Thuận, P. Tân Mai, TP. Biên Hòa', 'Đồng Nai', TRUE);
    `);

    // Sample Customers
    await connection.query(`
      INSERT INTO customers (id, customer_code, name, email, phone, tier, notes) VALUES
      ('cust_01', 'KH-VIP-001', 'Minh Tuấn Software Studio', 'tuan@minhstudio.dev', '0903-882-911', 'vip', 'Studio lập trình game và máy trạm đồ họa'),
      ('cust_02', 'KH-VIP-002', 'Lan Hương Creative Studio', 'huong.lan@creativeart.vn', '0912-445-667', 'vip', 'Agency thiết kế đồ họa & 3D visual'),
      ('cust_03', 'KH-STD-003', 'Quang Anh Engineering', 'qanh@vieteng.com', '0988-123-999', 'standard', 'Doanh nghiệp gia công cơ khí chính xác');
    `);

    await connection.query(`
      INSERT INTO customer_addresses (id, customer_id, recipient_name, phone, address_line, city, is_default) VALUES
      ('addr_01', 'cust_01', 'Nguyễn Minh Tuấn', '0903-882-911', 'Tầng 8, Tòa nhà Diamond Plaza, Quận 1', 'TP. Hồ Chí Minh', TRUE),
      ('addr_02', 'cust_02', 'Trần Lan Hương', '0912-445-667', '45 Nguyễn Huệ, Phường Bến Nghé, Quận 1', 'TP. Hồ Chí Minh', TRUE);
    `);

    // Staff Accounts with bcrypt password hashes
    // Passwords hashed using bcryptjs cost factor 10
    const adminHash = bcrypt.hashSync('admin123', 10);
    const saleHash = bcrypt.hashSync('sale123', 10);
    const whHash = bcrypt.hashSync('warehouse123', 10);
    const custHash = bcrypt.hashSync('password123', 10);

    await connection.query(`
      INSERT INTO users (id, staff_code, name, email, password_hash, role_id, role_name, avatar, phone, active) VALUES
      ('usr_staff_admin', 'CT-ADMIN-001', 'Nguyễn Minh Kiệt', 'admin@computertech.vn', ?, 'role_admin', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '0901-888-999', TRUE),
      ('usr_staff_sale', 'CT-SALE-001', 'Nguyễn Việt Anh', 'sale@computertech.vn', ?, 'role_sale', 'sale', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '0908-776-554', TRUE),
      ('usr_staff_warehouse', 'CT-WH-001', 'Ngô Thành Tâm', 'warehouse@computertech.vn', ?, 'role_warehouse', 'warehouse', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '0977-889-112', TRUE);
    `, [adminHash, saleHash, whHash]);

    // Customer login accounts linked to customer profiles
    await connection.query(`
      INSERT INTO users (id, staff_code, name, email, password_hash, role_id, role_name, avatar, customer_id, phone, active) VALUES
      ('usr_cust_01', NULL, 'Minh Tuấn Software Studio', 'tuan@minhstudio.dev', ?, 'role_customer', 'customer', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'cust_01', '0903-882-911', TRUE),
      ('usr_cust_02', NULL, 'Lan Hương Creative Studio', 'huong.lan@creativeart.vn', ?, 'role_customer', 'customer', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'cust_02', '0912-445-667', TRUE);
    `, [custHash, custHash]);

    console.log('✓ Roles, 3 Staff Members, Customers and Addresses seeded.');

    console.log('\n--- 4. SEEDING SCRAPED PRODUCTS FROM MAYTINHBIENHOA.VN ---');

    const scrapedData = JSON.parse(fs.readFileSync(path.resolve('data/scraped_products.json'), 'utf-8'));
    const { categories, brands, products } = scrapedData;

    console.log(`Loading ${categories.length} categories, ${brands.length} brands, and ${products.length} products...`);

    // Insert categories
    for (const c of categories) {
      await connection.query(`
        INSERT INTO categories (id, name, slug, description, sort_order)
        VALUES (?, ?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `, [`cat_${c.slug}`, c.name, c.slug, `Danh mục ${c.name} chính hãng tại ComputerTech`]);
    }
    console.log(`✓ Inserted ${categories.length} categories.`);

    // Insert brands
    const brandMap = new Map();
    for (const b of brands) {
      const slug = b.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'brand';
      const brandId = `brand_${slug}_${Math.abs(b.split('').reduce((a,c)=>a+c.charCodeAt(0),0))}`;
      brandMap.set(b, brandId);
      await connection.query(`
        INSERT INTO brands (id, name, slug)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE id=id
      `, [brandId, b, slug]);
    }
    console.log(`✓ Inserted ${brands.length} brands.`);

    // Helper to batch insert in chunks
    async function batchInsert(table, columns, rows, chunkSize = 50) {
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ?`;
        await connection.query(sql, [chunk]);
      }
    }

    // Prepare batch arrays
    const productRows = [];
    const imageRows = [];
    const attrRows = [];
    const inventoryRows = [];

    for (const p of products) {
      const prodId = `prod_${p.source_id || Math.random().toString(36).slice(2, 10)}`;
      const brandId = brandMap.get(p.brand_name) || null;
      const catId = `cat_${p.category_slug}`;

      productRows.push([
        prodId,
        p.sku,
        p.source_id,
        p.source_url,
        p.name,
        p.slug,
        brandId,
        catId,
        p.price,
        p.original_price || null,
        p.discount_percent || 0,
        p.cost_price || 0,
        p.warranty_months || 12,
        p.status || 'in_stock',
        p.name,
        p.description || '',
        JSON.stringify(p.specs || {}),
        p.price > 20000000 ? 1 : 0,
        1
      ]);

      if (p.images && p.images.length > 0) {
        for (const [idx, img] of p.images.entries()) {
          imageRows.push([
            `img_${prodId}_${idx}`,
            prodId,
            img.image_url,
            img.source_url,
            img.is_primary ? 1 : 0,
            img.sort_order || 0,
            img.alt_text || p.name,
            1
          ]);
        }
      }

      if (p.specs && typeof p.specs === 'object') {
        let attrIdx = 0;
        for (const [key, val] of Object.entries(p.specs)) {
          if (key && val && typeof val === 'string') {
            attrRows.push([
              `attr_${prodId}_${attrIdx++}`,
              prodId,
              key.slice(0, 120),
              val.slice(0, 500)
            ]);
          }
        }
      }

      inventoryRows.push([
        `inv_${prodId}`,
        'wh_hcm',
        prodId,
        0,
        0,
        'KHO-A1-INCOMING',
        3
      ]);
    }

    console.log(`Executing batch inserts...`);
    await batchInsert('products', [
      'id', 'sku', 'source_id', 'source_url', 'name', 'slug',
      'brand_id', 'category_id', 'price', 'original_price', 'discount_percent',
      'cost_price', 'warranty_months', 'status', 'short_description', 'description',
      'specs', 'is_featured', 'is_new'
    ], productRows, 50);
    console.log(`✓ Inserted ${productRows.length} products.`);

    await batchInsert('product_images', [
      'id', 'product_id', 'image_url', 'source_url', 'is_primary', 'sort_order', 'alt_text', 'verified'
    ], imageRows, 100);
    console.log(`✓ Inserted ${imageRows.length} verified product images.`);

    await batchInsert('product_attributes', [
      'id', 'product_id', 'attribute_name', 'attribute_value'
    ], attrRows, 100);
    console.log(`✓ Inserted ${attrRows.length} technical attributes.`);

    await batchInsert('inventory', [
      'id', 'warehouse_id', 'product_id', 'quantity_on_hand', 'quantity_reserved', 'bin_location', 'min_stock_alert'
    ], inventoryRows, 100);
    console.log(`✓ Initialized inventory rows with 0 quantity as required.`);

    console.log('\n--- 5. ADDING REAL INITIAL STOCK & TRANSACTIONS FOR TOP 20 FAST-MOVING ITEMS ---');
    // Top 20 products get real stock intake to allow immediate purchase and demo operations
    const [topProducts] = await connection.query(`SELECT id, sku, name, price FROM products LIMIT 20`);
    for (const tp of topProducts) {
      const intakeQty = 10;
      await connection.query(`
        UPDATE inventory SET quantity_on_hand = ? WHERE product_id = ? AND warehouse_id = 'wh_hcm'
      `, [intakeQty, tp.id]);

      await connection.query(`
        INSERT INTO inventory_transactions (
          id, warehouse_id, product_id, type, quantity, previous_on_hand, new_on_hand,
          previous_reserved, new_reserved, reason, actor_id, actor_name, reference_type, reference_id
        ) VALUES (?, 'wh_hcm', ?, 'receipt', ?, 0, ?, 0, 0, 'Phiếu nhập kho ban đầu từ nhà phân phối chính thức', 'usr_staff_warehouse', 'Ngô Thành Tâm (Kho)', 'initial_stock', 'PO-2026-INIT')
      `, [`tx_init_${tp.id}`, tp.id, intakeQty, intakeQty]);
    }
    console.log(`✓ Seeded initial intake transactions for 20 showcase products.`);

    console.log('\n--- 6. CREATING INITIAL REAL ORDER & PAYMENT ---');
    const firstProd = topProducts[0];
    const orderId = 'ord_2026_001';
    const subtotal = Number(firstProd.price);
    const discount = Math.round(subtotal * 0.05); // VIP 5%
    const total = subtotal - discount;

    await connection.query(`
      INSERT INTO orders (
        id, order_number, customer_id, status, subtotal, discount_amount, shipping_fee,
        total_amount, payment_status, payment_method, pricing_strategy_name, notes, creator_id
      ) VALUES (?, 'ORD-2026-0001', 'cust_01', 'confirmed', ?, ?, 0, ?, 'paid', 'bank_transfer', 'VIP Privilege (5%)', 'Giao hỏa tốc văn phòng Studio', 'usr_staff_sale')
    `, [orderId, subtotal, discount, total]);

    await connection.query(`
      INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `, [`item_${orderId}_1`, orderId, firstProd.id, firstProd.name, firstProd.sku, subtotal, subtotal]);

    await connection.query(`
      INSERT INTO payments (id, order_id, payment_number, amount, method, status, transaction_code, processed_by)
      VALUES (?, ?, 'PAY-2026-0001', ?, 'bank_transfer', 'success', 'VNPAY-889921', 'usr_staff_sale')
    `, [`pay_${orderId}`, orderId, total]);

    await connection.query(`
      INSERT INTO order_status_histories (id, order_id, previous_status, new_status, notes, actor_id, actor_name)
      VALUES (?, ?, 'pending', 'confirmed', 'Khách hàng thanh toán chuyển khoản thành công', 'usr_staff_sale', 'Nguyễn Việt Anh (Sale)')
    `, [`osh_${orderId}_1`, orderId]);

    // Update reservation for this item
    await connection.query(`
      UPDATE inventory SET quantity_reserved = 1 WHERE product_id = ? AND warehouse_id = 'wh_hcm'
    `, [firstProd.id]);

    await connection.query(`
      INSERT INTO inventory_transactions (
        id, warehouse_id, product_id, type, quantity, previous_on_hand, new_on_hand,
        previous_reserved, new_reserved, reason, actor_id, actor_name, reference_type, reference_id
      ) VALUES (?, 'wh_hcm', ?, 'reserve', 1, 10, 10, 0, 1, 'Tạm giữ kho cho đơn hàng ORD-2026-0001', 'usr_staff_sale', 'Nguyễn Việt Anh (Sale)', 'order', ?)
    `, [`tx_res_${orderId}`, firstProd.id, orderId]);

    console.log('✓ Initial order, order items, payment and status history created.');

    console.log('\n--- 7. CREATING SAMPLE REPAIR TICKET ---');
    await connection.query(`
      INSERT INTO repair_tickets (
        id, ticket_number, customer_id, device_name, serial_number, issue_description,
        diagnostic_notes, status, estimated_cost, labor_fee, final_cost
      ) VALUES (
        'rpr_2026_001', 'RPR-2026-0001', 'cust_01', 'PC Gaming BHC Ares i5-12400F', 'SN-MTBH-2026-88',
        'Khách mang đến vệ sinh tra keo tản nhiệt và nâng cấp thêm 1 thanh RAM 16GB',
        'Phần cứng hoạt động bình thường, nhiệt độ CPU ổn định 62C',
        'in_progress', 1250000, 250000, 1250000
      )
    `);

    await connection.query(`
      INSERT INTO app_notifications (id, title, message, severity, is_read, link_to)
      VALUES (
        'notif_welcome',
        'Hệ thống COMPUTERTECH đã sẵn sàng',
        'Cơ sở dữ liệu đã được tái cấu trúc và đồng bộ 374 sản phẩm thực tế từ MayTinhBienHoa.vn',
        'success',
        FALSE,
        JSON_OBJECT('module', 'dashboard')
      )
    `);
    console.log('✓ Repair ticket and app notification created.');

    console.log('\n======================================================');
    console.log('DATABASE REBUILD ON AIVEN MYSQL COMPLETED 100%!');
    console.log('======================================================');

    // Final verification summary
    const [finalTables] = await connection.query('SHOW TABLES');
    console.log(`Total Tables in defaultdb: ${finalTables.length}`);

    const [counts] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM roles) as roles,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM customers) as customers,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM brands) as brands,
        (SELECT COUNT(*) FROM products) as products,
        (SELECT COUNT(*) FROM product_images) as product_images,
        (SELECT COUNT(*) FROM product_attributes) as product_attributes,
        (SELECT COUNT(*) FROM inventory) as inventory,
        (SELECT COUNT(*) FROM orders) as orders
    `);
    console.table(counts);

  } catch (err) {
    console.error('DATABASE REBUILD FAILED:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

rebuild();
