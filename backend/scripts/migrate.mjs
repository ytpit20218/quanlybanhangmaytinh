import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const DDL_STATEMENTS = [
  // 1. Customers Table
  `CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    tier ENUM('standard', 'vip') DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 2. Users Table
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'sale', 'warehouse', 'technician') NOT NULL,
    avatar VARCHAR(512),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    customer_id VARCHAR(64),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_customer (customer_id),
    CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 3. Products Table
  `CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category ENUM('laptops', 'pc_parts', 'displays', 'accessories') NOT NULL,
    price BIGINT NOT NULL,
    cost BIGINT NOT NULL,
    warranty_months INT NOT NULL DEFAULT 12,
    specs JSON,
    image VARCHAR(512),
    min_stock_alert INT NOT NULL DEFAULT 5,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_products_category (category)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 4. Inventory Table
  `CREATE TABLE IF NOT EXISTS inventory (
    product_id VARCHAR(64) PRIMARY KEY,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    location VARCHAR(128),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 5. Orders Table
  `CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    customer_id VARCHAR(64) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    subtotal BIGINT NOT NULL,
    discount_amount BIGINT NOT NULL DEFAULT 0,
    total_amount BIGINT NOT NULL,
    payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    payment_method ENUM('cash', 'bank_transfer', 'card') NOT NULL DEFAULT 'cash',
    pricing_strategy_name VARCHAR(128) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_status (status),
    INDEX idx_orders_customer (customer_id),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 6. Order Items Table
  `CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(64) NOT NULL,
    quantity INT NOT NULL,
    unit_price BIGINT NOT NULL,
    subtotal BIGINT NOT NULL,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 7. Inventory Transactions Table
  `CREATE TABLE IF NOT EXISTS inventory_transactions (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    type ENUM('receipt', 'issue', 'adjustment', 'reserve', 'release') NOT NULL,
    quantity INT NOT NULL,
    previous_on_hand INT NOT NULL,
    new_on_hand INT NOT NULL,
    previous_reserved INT NOT NULL,
    new_reserved INT NOT NULL,
    reason TEXT NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    reference_type ENUM('order', 'repair', 'manual_adjustment', 'initial_stock') NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inv_tx_product (product_id),
    CONSTRAINT fk_inv_tx_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 8. Repair Tickets Table
  `CREATE TABLE IF NOT EXISTS repair_tickets (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(64) NOT NULL UNIQUE,
    customer_id VARCHAR(64) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(128),
    issue_description TEXT NOT NULL,
    diagnostic_notes TEXT,
    status ENUM('intake', 'diagnosing', 'waiting_parts', 'in_progress', 'repaired', 'cancelled', 'handed_over') NOT NULL DEFAULT 'intake',
    technician_id VARCHAR(64),
    technician_name VARCHAR(255),
    estimated_cost BIGINT DEFAULT 0,
    labor_fee BIGINT DEFAULT 0,
    parts_used JSON,
    final_cost BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_repair_status (status),
    INDEX idx_repair_customer (customer_id),
    CONSTRAINT fk_repair_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 9. Repair Histories Table
  `CREATE TABLE IF NOT EXISTS repair_histories (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) NOT NULL,
    ticket_number VARCHAR(64) NOT NULL,
    previous_status ENUM('intake', 'diagnosing', 'waiting_parts', 'in_progress', 'repaired', 'cancelled', 'handed_over') NOT NULL,
    new_status ENUM('intake', 'diagnosing', 'waiting_parts', 'in_progress', 'repaired', 'cancelled', 'handed_over') NOT NULL,
    notes TEXT,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    parts_added JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_repair_history_ticket (ticket_id),
    CONSTRAINT fk_repair_histories_ticket FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 10. App Notifications Table
  `CREATE TABLE IF NOT EXISTS app_notifications (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('info', 'success', 'warning', 'alert') NOT NULL DEFAULT 'info',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_to JSON
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
];

async function runMigration() {
  console.log('--- Starting Safe Migration on Aiven MySQL ---');
  const connection = await mysql.createConnection({
    host: process.env.AIVEN_MYSQL_HOST,
    port: Number(process.env.AIVEN_MYSQL_PORT),
    user: process.env.AIVEN_MYSQL_USER,
    password: process.env.AIVEN_MYSQL_PASSWORD,
    database: process.env.AIVEN_MYSQL_DATABASE,
    ssl: { rejectUnauthorized: false },
  });

  try {
    for (const ddl of DDL_STATEMENTS) {
      const match = ddl.match(/CREATE TABLE IF NOT EXISTS ([a-z_]+)/);
      const tableName = match ? match[1] : 'unknown';
      process.stdout.write(`Creating table: ${tableName.padEnd(25)} ... `);
      await connection.query(ddl);
      console.log('✓ OK');
    }

    console.log('\n--- Migration Completed Successfully! ---');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`Total tables in ${process.env.AIVEN_MYSQL_DATABASE}: ${tables.length}`);
    console.table(tables.map(t => ({ Table: Object.values(t)[0] })));
  } catch (err) {
    console.error('\nMigration failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
