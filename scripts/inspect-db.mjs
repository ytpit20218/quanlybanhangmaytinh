import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function inspectDatabase() {
  console.log('Connecting to Aiven MySQL...');
  console.log(`Host: ${process.env.AIVEN_MYSQL_HOST}:${process.env.AIVEN_MYSQL_PORT}`);
  console.log(`User: ${process.env.AIVEN_MYSQL_USER}`);
  console.log(`Database: ${process.env.AIVEN_MYSQL_DATABASE}`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.AIVEN_MYSQL_HOST,
      port: Number(process.env.AIVEN_MYSQL_PORT),
      user: process.env.AIVEN_MYSQL_USER,
      password: process.env.AIVEN_MYSQL_PASSWORD,
      database: process.env.AIVEN_MYSQL_DATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('Successfully connected to Aiven MySQL via SSL/TLS!');

    // 1. Check version & current context
    const [info] = await connection.query('SELECT VERSION() as version, CURRENT_USER() as user, DATABASE() as db, @@ssl_cipher as cipher');
    console.log('\n--- Server Info ---');
    console.log(info[0]);

    // 2. Check existing tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n--- Existing Tables in ' + process.env.AIVEN_MYSQL_DATABASE + ' ---');
    if (tables.length === 0) {
      console.log('No tables found. Database is currently empty.');
    } else {
      console.log(tables);
      for (const row of tables) {
        const tableName = Object.values(row)[0];
        const [columns] = await connection.query(`DESCRIBE \`${tableName}\``);
        console.log(`\nTable Schema [${tableName}]:`);
        console.table(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key, Default: c.Default })));
      }
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

inspectDatabase();
