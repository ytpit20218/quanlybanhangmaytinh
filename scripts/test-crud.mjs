import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testCrud() {
  console.log('=== TESTING REAL READ & WRITE ON AIVEN MYSQL ===\n');

  const connection = await mysql.createConnection({
    host: process.env.AIVEN_MYSQL_HOST,
    port: Number(process.env.AIVEN_MYSQL_PORT),
    user: process.env.AIVEN_MYSQL_USER,
    password: process.env.AIVEN_MYSQL_PASSWORD,
    database: process.env.AIVEN_MYSQL_DATABASE,
    ssl: { rejectUnauthorized: false },
  });

  const timestamp = Date.now();
  const testCustomerId = `test_cust_${timestamp}`;
  const testUserId = `test_user_${timestamp}`;
  const testProductId = `test_prod_${timestamp}`;
  const testOrderId = `test_ord_${timestamp}`;
  const testTicketId = `test_rep_${timestamp}`;

  try {
    // 1. WRITE: Customer
    console.log('1. [WRITE] Inserting test Customer...');
    await connection.query(
      `INSERT INTO customers (id, name, email, phone, address, tier) VALUES (?, ?, ?, ?, ?, ?)`,
      [testCustomerId, 'Aiven QA Test Customer', `test_${timestamp}@computertech.vn`, '0909123456', '72 Le Thanh Ton, Q1, TP.HCM', 'vip']
    );
    console.log('   ✓ Customer created successfully');

    // 2. WRITE: User
    console.log('2. [WRITE] Inserting test User linked to Customer...');
    await connection.query(
      `INSERT INTO users (id, name, email, password, role, customer_id, phone, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'Aiven QA Test Customer', `test_${timestamp}@computertech.vn`, 'hashed_pw_test', 'customer', testCustomerId, '0909123456', true]
    );
    console.log('   ✓ User created successfully');

    // 3. WRITE: Product & Inventory
    console.log('3. [WRITE] Inserting test Product & Inventory (with JSON specs)...');
    const specs = JSON.stringify({ cpu: 'Intel Core i9-14900K', ram: '64GB DDR5', gpu: 'RTX 4090 24GB' });
    await connection.query(
      `INSERT INTO products (id, sku, name, category, price, cost, warranty_months, specs, min_stock_alert, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testProductId, `SKU-AIVEN-${timestamp}`, 'ComputerTech SuperWorkstation Pro', 'pc_parts', 95000000, 78000000, 36, specs, 2, 'Workstation for deep learning & 3D']
    );
    await connection.query(
      `INSERT INTO inventory (product_id, quantity_on_hand, quantity_reserved, location) VALUES (?, ?, ?, ?)`,
      [testProductId, 15, 2, 'KHO-A1-TANG2']
    );
    console.log('   ✓ Product & Inventory record created successfully');

    // 4. WRITE: Order & Order Items within a Transaction
    console.log('4. [WRITE: TRANSACTION] Creating Order & Order Items...');
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO orders (id, order_number, customer_id, status, subtotal, discount_amount, total_amount, payment_status, payment_method, pricing_strategy_name, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testOrderId, `ORD-${timestamp}`, testCustomerId, 'pending', 95000000, 4750000, 90250000, 'paid', 'bank_transfer', 'VIP Partner 5%', 'Giao hang gio hanh chinh']
    );

    await connection.query(
      `INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [`item_${timestamp}`, testOrderId, testProductId, 'ComputerTech SuperWorkstation Pro', `SKU-AIVEN-${timestamp}`, 1, 95000000, 95000000]
    );

    await connection.commit();
    console.log('   ✓ Transaction committed: Order & Order Item created');

    // 5. WRITE: Repair Ticket
    console.log('5. [WRITE] Creating Repair Ticket...');
    await connection.query(
      `INSERT INTO repair_tickets (id, ticket_number, customer_id, device_name, serial_number, issue_description, status, final_cost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testTicketId, `REP-${timestamp}`, testCustomerId, 'Custom Liquid Cooling PC', `SN-${timestamp}`, 'Bao duong tan nhiet nuoc dinh ky', 'intake', 1500000]
    );
    console.log('   ✓ Repair Ticket created');

    // 6. READ TESTS
    console.log('\n--- VERIFYING READ OPERATIONS ---');

    // Read 1: Customer + User join
    const [userCustRows] = await connection.query(
      `SELECT u.id as user_id, u.email, u.role, c.id as customer_id, c.name, c.tier
       FROM users u
       JOIN customers c ON u.customer_id = c.id
       WHERE u.id = ?`,
      [testUserId]
    );
    console.log('6. [READ] Customer & User Join Query:');
    console.table(userCustRows);

    // Read 2: Product + Inventory available stock
    const [prodRows] = await connection.query(
      `SELECT p.id, p.sku, p.name, p.price, p.specs,
              i.quantity_on_hand, i.quantity_reserved,
              (i.quantity_on_hand - i.quantity_reserved) as quantity_available,
              i.location
       FROM products p
       JOIN inventory i ON p.id = i.product_id
       WHERE p.id = ?`,
      [testProductId]
    );
    console.log('7. [READ] Product & Inventory Calculated Stock:');
    console.table(prodRows);

    // Read 3: Order with items
    const [orderRows] = await connection.query(
      `SELECT o.order_number, o.status, o.total_amount, o.payment_status,
              oi.product_name, oi.quantity, oi.unit_price, oi.subtotal
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ?`,
      [testOrderId]
    );
    console.log('8. [READ] Order & Order Items Query:');
    console.table(orderRows);

    // 7. CLEANUP TEST DATA (keep database pristine)
    console.log('\n--- CLEANING UP TEST RECORD ---');
    await connection.query(`DELETE FROM repair_tickets WHERE id = ?`, [testTicketId]);
    await connection.query(`DELETE FROM orders WHERE id = ?`, [testOrderId]);
    await connection.query(`DELETE FROM products WHERE id = ?`, [testProductId]);
    await connection.query(`DELETE FROM users WHERE id = ?`, [testUserId]);
    await connection.query(`DELETE FROM customers WHERE id = ?`, [testCustomerId]);
    console.log('✓ Test data cleaned up successfully without affecting production structure.');

    console.log('\n=== ALL AIVEN MYSQL READ & WRITE TESTS PASSED! ===');
  } catch (err) {
    console.error('CRUD Test Error:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

testCrud();
