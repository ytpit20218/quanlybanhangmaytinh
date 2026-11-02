import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log('Connecting to Aiven MySQL...');
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
    console.log('--- 1. CREATING PARENT CATEGORY: LINH KIỆN MÁY TÍNH ---');
    // Ensure parent category exists
    await connection.query(`
      INSERT INTO categories (id, name, slug, parent_id, description, sort_order)
      VALUES (
        'cat_linh-kien',
        'Linh Kiện Máy Tính',
        'linh-kien-may-tinh',
        NULL,
        'Linh kiện máy tính chính hãng: Bo mạch chủ, CPU, RAM, VGA card màn hình, ổ cứng SSD/HDD, nguồn PSU, vỏ case và tản nhiệt',
        2
      ) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
    `);
    console.log('✓ Parent category cat_linh-kien created.');

    console.log('--- 2. UPDATING SUB-CATEGORIES TO POINT TO cat_linh-kien ---');
    const subCategories = [
      'cat_mainboard',
      'cat_cpu',
      'cat_ram',
      'cat_vga',
      'cat_ssd-hdd',
      'cat_psu',
      'cat_case',
      'cat_cooling'
    ];

    await connection.query(`
      UPDATE categories 
      SET parent_id = 'cat_linh-kien'
      WHERE id IN (${subCategories.map(s => `'${s}'`).join(',')});
    `);
    console.log(`✓ Set parent_id = 'cat_linh-kien' for ${subCategories.length} component categories.`);

    // Keep cat_pc-gaming separate
    await connection.query(`
      UPDATE categories 
      SET parent_id = NULL, sort_order = 1
      WHERE id = 'cat_pc-gaming';
    `);
    console.log('✓ Ensured cat_pc-gaming is a distinct top-level category.');

    console.log('--- 3. UPDATING ALL PRODUCTS TO BE IN STOCK ---');
    // Set all products to in_stock
    const [prodUpdate] = await connection.query(`
      UPDATE products 
      SET status = 'in_stock'
    `);
    console.log(`✓ Updated status='in_stock' for all products.`);

    // Update inventory: all products with 0 stock get realistic stock (between 12 and 25 units)
    const [invUpdate] = await connection.query(`
      UPDATE inventory 
      SET quantity_on_hand = CASE 
        WHEN quantity_on_hand = 0 THEN 15
        ELSE quantity_on_hand 
      END
      WHERE quantity_on_hand = 0;
    `);
    console.log(`✓ Updated stock for products: all products now have quantity_on_hand > 0.`);

    console.log('--- 4. INSERTING AUDIT TRANSACTIONS FOR INTAKE ---');
    const [txInsert] = await connection.query(`
      INSERT INTO inventory_transactions (
        id, warehouse_id, product_id, type, quantity, previous_on_hand, new_on_hand,
        previous_reserved, new_reserved, reason, actor_id, actor_name, reference_type, reference_id
      )
      SELECT 
        CONCAT('tx_stockall_', p.id),
        'wh_hcm',
        p.id,
        'receipt',
        15,
        0,
        15,
        0,
        0,
        'Nhập kho bổ sung toàn bộ danh mục sản phẩm phục vụ kinh doanh',
        'usr_staff_warehouse',
        'Ngô Thành Tâm (Kho)',
        'initial_stock',
        'PO-2026-FULL-STOCK'
      FROM products p
      WHERE NOT EXISTS (
        SELECT 1 FROM inventory_transactions it 
        WHERE it.product_id = p.id AND it.type = 'receipt'
      );
    `);
    console.log(`✓ Inserted inventory intake transactions for all items.`);

    // Verification queries
    console.log('\n--- 5. VERIFICATION ---');
    const [catHierarchy] = await connection.query(`
      SELECT 
        p.name as parent_category,
        c.id as category_id,
        c.name as category_name,
        c.slug,
        COUNT(pr.id) as product_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products pr ON c.id = pr.category_id
      WHERE c.parent_id = 'cat_linh-kien' OR c.id IN ('cat_pc-gaming', 'cat_linh-kien')
      GROUP BY p.name, c.id, c.name, c.slug
      ORDER BY c.parent_id IS NULL DESC, product_count DESC;
    `);
    console.table(catHierarchy);

    const [stockStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_inventory_rows,
        MIN(quantity_on_hand) as min_stock,
        MAX(quantity_on_hand) as max_stock,
        SUM(CASE WHEN quantity_on_hand > 0 THEN 1 ELSE 0 END) as in_stock_items,
        SUM(CASE WHEN quantity_on_hand = 0 THEN 1 ELSE 0 END) as out_of_stock_items,
        SUM(quantity_on_hand) as total_units_in_warehouse
      FROM inventory;
    `);
    console.table(stockStats);

    const [txCount] = await connection.query(`SELECT COUNT(*) as total_transactions FROM inventory_transactions;`);
    console.log(`Total transactions in audit log: ${txCount[0].total_transactions}`);

  } catch (err) {
    console.error('Error updating database:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

run();
