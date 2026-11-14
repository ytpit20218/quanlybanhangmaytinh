import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { pool, checkConnection } from './db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  next(err);
});

function sendServerError(res, err) {
  console.error('[API Error]', err?.message || err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

// 1. Health check & DB status
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkConnection();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'ComputerTech Backend API',
    database: dbStatus,
  });
});

// 2. Categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    sendServerError(res, err);
  }
});

// 3. Brands
app.get('/api/brands', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM brands ORDER BY name ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    sendServerError(res, err);
  }
});

// 4. Products with filters
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, limit = '100', offset = '0' } = req.query;
    if (!/^\d+$/.test(String(limit)) || !/^\d+$/.test(String(offset))) {
      return res.status(400).json({ success: false, message: 'limit and offset must be non-negative integers' });
    }
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);
    if (parsedLimit < 1 || parsedLimit > 500) {
      return res.status(400).json({ success: false, message: 'limit must be between 1 and 500' });
    }

    let query = `
      SELECT p.*,
             c.slug AS category,
             c.name AS category_name,
             b.name AS brand_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) AS image,
             COALESCE(i.quantity_on_hand, 0) as on_hand,
             COALESCE(i.quantity_reserved, 0) as reserved,
             (COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0)) as available
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      const cat = String(category).trim();
      query += ' AND (p.category_id = ? OR c.slug = ? OR c.parent_id = ?)';
      params.push(cat, cat, cat);
    }
    const searchClean = typeof search === 'string' ? search.trim() : '';
    if (searchClean) {
      const escapedSearch = searchClean.replace(/[\\%_]/g, '\\$&');
      query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
      params.push(`%${escapedSearch}%`, `%${escapedSearch}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parsedLimit, parsedOffset);

    const [rows] = await pool.query(query, params);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    sendServerError(res, err);
  }
});

// 5. Product Detail
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*,
              c.slug AS category,
              c.name AS category_name,
              b.name AS brand_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) AS image,
              COALESCE(i.quantity_on_hand, 0) as on_hand,
              COALESCE(i.quantity_reserved, 0) as reserved,
              (COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0)) as available
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    sendServerError(res, err);
  }
});

// 6. Inventory Matrix
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, i.bin_location as location, p.name as product_name, p.sku,
             COALESCE(c.slug, p.category_id) as category,
             (i.quantity_on_hand - i.quantity_reserved) as quantity_available
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY quantity_available ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    sendServerError(res, err);
  }
});

// 7. Customers
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*,
             (SELECT ca.address_line
              FROM customer_addresses ca
              WHERE ca.customer_id = c.id
              ORDER BY ca.is_default DESC, ca.created_at DESC
              LIMIT 1) AS address
      FROM customers c
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    sendServerError(res, err);
  }
});

app.post('/api/customers', async (req, res) => {
  let createdCustomerId = null;
  try {
    const { id, name, email, phone = null, address = null, tier = 'standard' } = req.body || {};
    const nameClean = typeof name === 'string' ? name.trim() : '';
    const emailClean = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const tierClean = typeof tier === 'string' ? tier.trim().toLowerCase() : '';
    const phoneClean = typeof phone === 'string' ? phone.trim() || null : null;
    const addressClean = typeof address === 'string' ? address.trim() || null : null;

    if (!nameClean || nameClean.length > 255 || !emailClean || emailClean.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return res.status(400).json({ success: false, message: 'Valid name and email are required' });
    }
    if (phoneClean && phoneClean.length > 50) {
      return res.status(400).json({ success: false, message: 'phone must be at most 50 characters' });
    }
    if (!['standard', 'vip'].includes(tierClean)) {
      return res.status(400).json({ success: false, message: 'tier must be standard or vip' });
    }
    if (id !== undefined && (typeof id !== 'string' || !id.trim() || id.trim().length > 64)) {
      return res.status(400).json({ success: false, message: 'id must be a non-empty string up to 64 characters' });
    }

    const uniq = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const customerId = typeof id === 'string' ? id.trim() : `cust_${uniq}`;
    const customerCode = `KH-${uniq}`;

    await pool.query(
      'INSERT INTO customers (id, customer_code, name, email, phone, tier) VALUES (?, ?, ?, ?, ?, ?)',
      [customerId, customerCode, nameClean, emailClean, phoneClean, tierClean]
    );
    createdCustomerId = customerId;

    if (addressClean) {
      await pool.query(
        'INSERT INTO customer_addresses (id, customer_id, recipient_name, phone, address_line, is_default) VALUES (?, ?, ?, ?, ?, 1)',
        [`addr_${uniq}`, customerId, nameClean, phoneClean || '', addressClean]
      );
    }

    res.status(201).json({
      success: true,
      data: { id: customerId, customer_code: customerCode, name: nameClean, email: emailClean, phone: phoneClean, address: addressClean, tier: tierClean },
    });
  } catch (err) {
    if (createdCustomerId) {
      await pool.query('DELETE FROM customers WHERE id = ?', [createdCustomerId]).catch(() => {});
    }
    if (err?.code === 'ER_DUP_ENTRY') {
      const msg = String(err.message || '').toLowerCase();
      return res.status(409).json({
        success: false,
        message: msg.includes('primary') || msg.includes('customer_code')
          ? 'Customer ID already exists'
          : 'Customer email already exists',
      });
    }
    sendServerError(res, err);
  }
});

// 8. Orders
app.get('/api/orders', async (req, res) => {
  try {
    const { status, payment_status, payment_method, search, limit = '200', offset = '0' } = req.query;
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (payment_status) {
      query += ' AND payment_status = ?';
      params.push(payment_status);
    }
    if (payment_method) {
      query += ' AND payment_method = ?';
      params.push(payment_method);
    }
    if (search) {
      query += ' AND (order_number LIKE ? OR payment_code LIKE ? OR id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit) || 200, Number(offset) || 0);

    const [orders] = await pool.query(query, params);
    const [items] = await pool.query('SELECT * FROM order_items');
    
    // Group items by order_id
    const itemsByOrder = items.reduce((acc, item) => {
      acc[item.order_id] = acc[item.order_id] || [];
      acc[item.order_id].push(item);
      return acc;
    }, {});

    const enrichedOrders = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    res.json({ success: true, total: enrichedOrders.length, data: enrichedOrders });
  } catch (err) {
    sendServerError(res, err);
  }
});

// 9. Auth Login (Users & Staff)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const emailClean = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const passwordClean = typeof password === 'string' ? password : '';

    if (!emailClean || !passwordClean) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND active = 1', [emailClean]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or account inactive' });
    }

    const user = rows[0];
    const hash = user.password_hash || '';
    const isMatch = hash.startsWith('$2') && (await bcrypt.compare(passwordClean, hash));

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { password: _, password_hash: __, ...userSafe } = user;
    if (!userSafe.role && userSafe.role_name) {
      userSafe.role = userSafe.role_name;
    }
    res.json({ success: true, user: userSafe });
  } catch (err) {
    sendServerError(res, err);
  }
});

// 10. Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) as total_products FROM products');
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status = 'completed'");
    const [[{ low_stock_count }]] = await pool.query(`
      SELECT COUNT(*) as low_stock_count 
      FROM inventory i 
      JOIN products p ON i.product_id = p.id 
      WHERE (i.quantity_on_hand - i.quantity_reserved) <= i.min_stock_alert
    `);

    res.json({
      success: true,
      data: {
        totalProducts: Number(total_products),
        totalOrders: Number(total_orders),
        totalRevenue: Number(total_revenue),
        lowStockCount: Number(low_stock_count),
      },
    });
  } catch (err) {
    sendServerError(res, err);
  }
});

app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ComputerTech API Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 540px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: #064e3b; color: #34d399; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
    .dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; box-shadow: 0 0 8px #34d399; }
    h1 { margin: 0 0 12px 0; font-size: 22px; color: #fff; }
    p { margin: 0 0 20px 0; color: #94a3b8; line-height: 1.5; font-size: 14px; }
    .endpoint { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px 14px; font-family: monospace; font-size: 13px; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> HỆ THỐNG ĐANG HOẠT ĐỘNG (ONLINE)</div>
    <h1>ComputerTech Backend REST API</h1>
    <p>Hệ thống máy chủ dịch vụ bán hàng và quản lý linh kiện máy tính ComputerTech.</p>
    <div class="endpoint"><a href="/api/health" style="color: inherit; text-decoration: none;">GET /api/health</a></div>
  </div>
</body>
</html>`);
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`COMPUTERTECH BACKEND REST API SERVER IS RUNNING`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ LỖI: Cổng ${PORT} đang bị chiếm dụng bởi một tiến trình khác (EADDRINUSE).`);
    console.error(`👉 Bạn có thể chạy lại file start.bat để tự động dọn dẹp và giải phóng cổng.`);
    process.exit(1);
  } else {
    console.error('Lỗi khởi động Server:', err);
  }
});

export { app, server };

