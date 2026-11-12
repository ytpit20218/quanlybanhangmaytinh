// =====================================================================
// ComputerTech Platform - Database Connection & Mock Fallback Layer
// Hỗ trợ kết nối kép: Aiven Cloud / Local MySQL hoặc tự động Fallback
// sang Local In-Memory Mock Database khi chưa có MySQL server.
// =====================================================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let mysqlPool = null;
let isRealDbConnected = false;
let realDbError = null;

// Khởi tạo cấu hình MySQL
const poolConfig = {
  host: process.env.AIVEN_MYSQL_HOST || 'localhost',
  port: Number(process.env.AIVEN_MYSQL_PORT || 3306),
  user: process.env.AIVEN_MYSQL_USER || 'root',
  password: process.env.AIVEN_MYSQL_PASSWORD || '',
  database: process.env.AIVEN_MYSQL_DATABASE || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2500, // Timeout nhanh trong 2.5s nếu không kết nối được
};

if (
  process.env.AIVEN_MYSQL_SSL === 'REQUIRED' ||
  process.env.AIVEN_MYSQL_HOST?.includes('aivencloud.com')
) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

try {
  mysqlPool = mysql.createPool(poolConfig);
} catch (err) {
  realDbError = err;
}

// =====================================================================
// LOCAL MOCK DATABASE (Khởi tạo sẵn từ data/scraped_products.json)
// =====================================================================
class LocalMockDatabase {
  constructor() {
    this.categories = [
      { id: 'cat_pc_gaming', name: 'PC Gaming & Đồ Họa', slug: 'pc-gaming', sort_order: 1 },
      { id: 'cat_laptops', name: 'Laptop & Workstation', slug: 'laptop', sort_order: 2 },
      { id: 'cat_pc_parts', name: 'Linh Kiện Máy Tính', slug: 'pc-parts', sort_order: 3 },
      { id: 'cat_displays', name: 'Màn Hình Hiển Thị', slug: 'monitors', sort_order: 4 },
      { id: 'cat_gear', name: 'Gaming Gear & Phụ Kiện', slug: 'gaming-gear', sort_order: 5 },
      { id: 'cat_networking', name: 'Mạng & Camera An Ninh', slug: 'networking', sort_order: 6 },
    ];

    this.brands = [
      { id: 'br_asus', name: 'ASUS', slug: 'asus', sort_order: 1 },
      { id: 'br_gigabyte', name: 'GIGABYTE', slug: 'gigabyte', sort_order: 2 },
      { id: 'br_msi', name: 'MSI', slug: 'msi', sort_order: 3 },
      { id: 'br_intel', name: 'Intel', slug: 'intel', sort_order: 4 },
      { id: 'br_amd', name: 'AMD', slug: 'amd', sort_order: 5 },
      { id: 'br_corsair', name: 'Corsair', slug: 'corsair', sort_order: 6 },
      { id: 'br_kingston', name: 'Kingston', slug: 'kingston', sort_order: 7 },
      { id: 'br_samsung', name: 'Samsung', slug: 'samsung', sort_order: 8 },
    ];

    this.customers = [
      {
        id: 'cust_01',
        name: 'Trần Văn An',
        email: 'an.tran@gmail.com',
        phone: '0903-123-456',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        tier: 'vip',
        created_at: new Date('2026-10-01').toISOString(),
      },
      {
        id: 'cust_02',
        name: 'Lê Hoàng Long',
        email: 'long.le@gmail.com',
        phone: '0918-987-654',
        address: '456 Lê Lợi, TP. Biên Hòa, Đồng Nai',
        tier: 'standard',
        created_at: new Date('2026-10-15').toISOString(),
      },
    ];

    this.users = [
      {
        id: 'usr_staff_admin',
        name: 'Nguyễn Minh Kiệt',
        email: 'admin@computertech.vn',
        password_hash: bcrypt.hashSync(process.env.MOCK_ADMIN_PASSWORD || 'admin123', 8),
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        active: 1,
        phone: '0901-888-999',
      },
      {
        id: 'usr_staff_sale',
        name: 'Nguyễn Việt Anh',
        email: 'sale@computertech.vn',
        password_hash: bcrypt.hashSync(process.env.MOCK_SALE_PASSWORD || 'sale123', 8),
        role: 'sale',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        active: 1,
        phone: '0908-776-554',
      },
      {
        id: 'usr_staff_warehouse',
        name: 'Ngô Thành Tâm',
        email: 'warehouse@computertech.vn',
        password_hash: bcrypt.hashSync(process.env.MOCK_WAREHOUSE_PASSWORD || 'warehouse123', 8),
        role: 'warehouse',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        active: 1,
        phone: '0977-889-112',
      },
      {
        id: 'usr_staff_tech',
        name: 'Trần Kỹ Thuật',
        email: 'tech@computertech.vn',
        password_hash: bcrypt.hashSync(process.env.MOCK_TECH_PASSWORD || 'tech123', 8),
        role: 'technician',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        active: 1,
        phone: '0933-222-111',
      },
      {
        id: 'usr_cust_01',
        name: 'Trần Văn An',
        email: 'customer@gmail.com',
        password_hash: bcrypt.hashSync(process.env.MOCK_CUSTOMER_PASSWORD || 'password123', 8),
        role: 'customer',
        customer_id: 'cust_01',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        active: 1,
        phone: '0903-123-456',
      },
    ];

    this.orders = [
      {
        id: 'ord_101',
        order_number: 'ORD-20261030-001',
        customer_id: 'cust_01',
        order_status: 'completed',
        status: 'completed',
        subtotal: 18500000,
        discount_amount: 500000,
        total_amount: 18000000,
        payment_status: 'paid',
        payment_method: 'bank_transfer',
        created_at: new Date('2026-10-28').toISOString(),
      },
    ];

    this.order_items = [
      {
        id: 'oi_01',
        order_id: 'ord_101',
        product_id: 'prod_1073687023',
        product_name: 'PC Gaming BHC Ares Gen 4th',
        quantity: 1,
        unit_price: 7890000,
      },
    ];

    this.products = [];
    this.inventory = {};
    this.loadProductsFromScrapedData();
  }

  loadProductsFromScrapedData() {
    try {
      const dataFilePath = path.resolve(__dirname, '../data/scraped_products.json');
      if (fs.existsSync(dataFilePath)) {
        const raw = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        const list = raw.products || [];

        this.products = list.map((p, idx) => {
          const id = `prod_${p.source_id || idx + 1}`;
          const primaryImg =
            p.images && p.images[0]
              ? p.images[0].image_url
              : 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800';

          const onHand = 10 + (idx % 25);
          const reserved = idx % 5 === 0 ? 2 : 0;

          this.inventory[id] = {
            product_id: id,
            quantity_on_hand: onHand,
            quantity_reserved: reserved,
            location: `KHO-A${(idx % 10) + 1}`,
            min_stock_alert: 3,
            last_updated: new Date().toISOString(),
          };

          return {
            id,
            sku: p.sku || `SKU-${1000 + idx}`,
            name: p.name,
            category: p.category_slug || 'pc_parts',
            price: Number(p.price || 0),
            cost: Number(p.cost_price || Math.round(Number(p.price || 0) * 0.8)),
            warranty_months: p.warranty_months || 24,
            image: primaryImg,
            specs: p.specs || {},
            min_stock_alert: 3,
            description: p.description || '',
            created_at: new Date(Date.now() - idx * 3600000).toISOString(),
            on_hand: onHand,
            reserved: reserved,
            available: onHand - reserved,
          };
        });
      }
    } catch (e) {
      console.warn('[Mock DB] Khong doc duoc file scraped_products.json:', e.message);
    }
  }

  async handleQuery(query, params = []) {
    const q = query.trim().toUpperCase();

    // 1. Health check
    if (q.includes('SELECT 1 AS CONNECTED')) {
      return [
        [
          {
            connected: 1,
            db: 'local_mock_db',
            version: '8.4.0-mock (Local In-Memory Fallback)',
          },
        ],
        [],
      ];
    }

    // 2. Categories
    if (q.includes('FROM CATEGORIES')) {
      return [this.categories, []];
    }

    // 3. Brands
    if (q.includes('FROM BRANDS')) {
      return [this.brands, []];
    }

    // 4. Products detail
    if (q.includes('FROM PRODUCTS') && q.includes('WHERE P.ID = ?')) {
      const targetId = params[0];
      const found = this.products.find((p) => p.id === targetId);
      return [found ? [found] : [], []];
    }

    // 5. Products list with filters
    if (q.includes('FROM PRODUCTS') && !q.includes('COUNT(*)')) {
      let result = [...this.products];
      let pIdx = 0;

      if (query.includes('c.slug = ?')) {
        const cat = String(params[pIdx++] || '').toLowerCase();
        // Skip remaining category OR parameters (p.category_id = ? OR c.slug = ? OR c.parent_id = ?)
        if (query.includes('p.category_id = ?')) pIdx++;
        if (query.includes('c.parent_id = ?')) pIdx++;
        result = result.filter((p) => {
          const pc = String(p.category || '').toLowerCase();
          return pc === cat || `cat_${pc}` === cat || (cat === 'cat_linh-kien' && ['cpu', 'mainboard', 'ram', 'ssd-hdd', 'vga', 'psu', 'case', 'cooling'].includes(pc));
        });
      } else if (query.includes('p.category = ?')) {
        const cat = params[pIdx++];
        result = result.filter(
          (p) => p.category?.toLowerCase() === cat?.toLowerCase()
        );
      }

      if (query.includes('p.name LIKE ?')) {
        const search = String(params[pIdx++] || '').replace(/%/g, '').toLowerCase();
        pIdx++; // skip second LIKE ?
        if (search) {
          result = result.filter(
            (p) =>
              p.name?.toLowerCase().includes(search) ||
              p.sku?.toLowerCase().includes(search)
          );
        }
      }

      const limit = Number(params[pIdx++] ?? 100);
      const offset = Number(params[pIdx++] ?? 0);
      const paged = result.slice(offset, offset + limit);

      return [paged, []];
    }

    // 6. Inventory
    if (q.includes('FROM INVENTORY')) {
      if (q.includes('COUNT(*)')) {
        const lowStock = this.products.filter(
          (p) => p.on_hand - p.reserved <= p.min_stock_alert
        ).length;
        return [[{ low_stock_count: lowStock }], []];
      }

      const invList = this.products.map((p) => ({
        product_id: p.id,
        product_name: p.name,
        sku: p.sku,
        category: p.category,
        min_stock_alert: p.min_stock_alert,
        quantity_on_hand: p.on_hand,
        quantity_reserved: p.reserved,
        quantity_available: p.on_hand - p.reserved,
        location: this.inventory[p.id]?.location || 'KHO-A1',
      }));
      return [invList, []];
    }

    // 7. Customers
    if (q.includes('INSERT INTO CUSTOMERS')) {
      const [id, customer_code, name, email, phone, tier] = params;
      if (this.customers.some((c) => c.email.toLowerCase() === String(email || '').toLowerCase())) {
        const dupErr = new Error('Duplicate email entry');
        dupErr.code = 'ER_DUP_ENTRY';
        throw dupErr;
      }
      const newCust = {
        id,
        customer_code,
        name,
        email,
        phone: phone || null,
        tier: tier || 'standard',
        created_at: new Date().toISOString(),
      };
      this.customers.unshift(newCust);
      return [{ affectedRows: 1 }, []];
    }

    if (q.includes('INSERT INTO CUSTOMER_ADDRESSES')) {
      const [, customerId, , , addressLine] = params;
      const target = this.customers.find((c) => c.id === customerId);
      if (target && addressLine) target.address = addressLine;
      return [{ affectedRows: 1 }, []];
    }

    if (q.includes('FROM CUSTOMERS WHERE EMAIL = ?')) {
      const email = String(params[0] || '').toLowerCase();
      const found = this.customers.filter((c) => c.email?.toLowerCase() === email);
      return [found, []];
    }

    if (q.includes('FROM CUSTOMERS')) {
      return [this.customers, []];
    }

    // 8. Orders
    if (q.includes('FROM ORDERS')) {
      if (q.includes('COUNT(*)')) {
        return [[{ total_orders: this.orders.length }], []];
      }
      if (q.includes('SUM(TOTAL_AMOUNT)')) {
        const completedOnly = q.includes("STATUS = 'COMPLETED'");
        const rev = this.orders
          .filter((o) => !completedOnly || (o.status || o.order_status) === 'completed')
          .reduce((sum, o) => sum + (o.total_amount || 0), 0);
        return [[{ total_revenue: rev }], []];
      }
      return [this.orders, []];
    }

    if (q.includes('FROM ORDER_ITEMS')) {
      return [this.order_items, []];
    }

    // 9. Auth users
    if (q.includes('FROM USERS WHERE EMAIL = ?')) {
      const email = params[0];
      const found = this.users.find(
        (u) => u.email.toLowerCase() === email?.toLowerCase() && u.active === 1
      );
      return [found ? [found] : [], []];
    }

    // 10. Product count
    if (q.includes('SELECT COUNT(*) AS TOTAL_PRODUCTS FROM PRODUCTS')) {
      return [[{ total_products: this.products.length }], []];
    }

    return [[], []];
  }
}

const mockDb = new LocalMockDatabase();

const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ECONNRESET',
  'EAI_AGAIN',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
]);

let initConnectionPromise = null;
function ensureInitialCheck() {
  if (!initConnectionPromise) {
    initConnectionPromise = checkConnection();
  }
  return initConnectionPromise;
}

// =====================================================================
// WRAPPER POOL (MySQL hoặc Mock fallback chỉ khi mất kết nối)
// =====================================================================
export const pool = {
  async query(query, params = []) {
    await ensureInitialCheck();
    if (isRealDbConnected && mysqlPool) {
      try {
        return await mysqlPool.query(query, params);
      } catch (err) {
        if (CONNECTION_ERROR_CODES.has(err?.code) || err?.fatal === true) {
          isRealDbConnected = false;
          console.warn(`[MySQL Connection Lost] Fallback sang Mock DB: ${err.message}`);
          return mockDb.handleQuery(query, params);
        }
        throw err;
      }
    }
    return mockDb.handleQuery(query, params);
  },
};

export async function checkConnection() {
  if (mysqlPool) {
    try {
      const [rows] = await mysqlPool.query(
        'SELECT 1 as connected, DATABASE() as db, VERSION() as version'
      );
      isRealDbConnected = true;
      return { ok: true, mode: 'mysql', info: rows[0] };
    } catch (err) {
      isRealDbConnected = false;
      const errMsg =
        err.message ||
        err.code ||
        (err.errors ? err.errors.map((e) => e.message || e.code).join('; ') : String(err));

      return {
        ok: true,
        mode: 'local_mock',
        notice: 'Dang chay che do Local Mock Database (MySQL chua khoi dong hoac chua cau hinh .env)',
        mysql_error: errMsg,
        info: {
          connected: 1,
          db: 'local_mock_db',
          version: `Local Mock (Data: ${mockDb.products.length} San pham)`,
        },
      };
    }
  }

  return {
    ok: true,
    mode: 'local_mock',
    info: {
      connected: 1,
      db: 'local_mock_db',
      version: `Local Mock (Data: ${mockDb.products.length} San pham)`,
    },
  };
}
