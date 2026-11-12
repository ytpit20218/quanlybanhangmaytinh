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
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
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

    res.json({ success: true, data: enrichedOrders });
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

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`COMPUTERTECH BACKEND REST API SERVER IS RUNNING`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
