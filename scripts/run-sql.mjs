import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function executeSqlFile() {
  console.log('Connecting to Aiven MySQL...');
  console.log(`Host: ${process.env.AIVEN_MYSQL_HOST}:${process.env.AIVEN_MYSQL_PORT}`);
  console.log(`Database: ${process.env.AIVEN_MYSQL_DATABASE}`);

  const connection = await mysql.createConnection({
    host: process.env.AIVEN_MYSQL_HOST,
    port: Number(process.env.AIVEN_MYSQL_PORT),
    user: process.env.AIVEN_MYSQL_USER,
    password: process.env.AIVEN_MYSQL_PASSWORD,
    database: process.env.AIVEN_MYSQL_DATABASE,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  try {
    const sqlPath = path.resolve('computertech_database.sql');
    console.log(`Reading SQL file from: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Executing database reset and migration on Aiven MySQL...');
    await connection.query(sqlContent);
    console.log('✓ SQL Execution completed successfully!');

    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n--- Tables in ${process.env.AIVEN_MYSQL_DATABASE} (${tables.length}) ---`);
    console.table(tables.map(t => ({ Table: Object.values(t)[0] })));

    // Verify 3 Staff Users
    console.log('\n--- Verified Staff Users (Nhân viên theo yêu cầu) ---');
    const [users] = await connection.query(
      `SELECT id, name, email, role, phone, active FROM users WHERE role IN ('admin', 'sale', 'warehouse')`
    );
    console.table(users);

    // Verify Products count & sample
    const [prodCount] = await connection.query('SELECT category, COUNT(*) as count, MIN(price) as min_price, MAX(price) as max_price FROM products GROUP BY category');
    console.log('\n--- Products by Category ---');
    console.table(prodCount);

    const [sampleProducts] = await connection.query('SELECT sku, name, price, image FROM products LIMIT 5');
    console.log('\n--- Sample Products with Real Images ---');
    console.table(sampleProducts);

  } catch (err) {
    console.error('Error executing SQL file:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

executeSqlFile();
