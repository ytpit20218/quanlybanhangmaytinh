import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const poolConfig = {
  host: process.env.AIVEN_MYSQL_HOST || 'localhost',
  port: Number(process.env.AIVEN_MYSQL_PORT || 3306),
  user: process.env.AIVEN_MYSQL_USER || 'root',
  password: process.env.AIVEN_MYSQL_PASSWORD || '',
  database: process.env.AIVEN_MYSQL_DATABASE || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (process.env.AIVEN_MYSQL_SSL === 'REQUIRED' || process.env.AIVEN_MYSQL_HOST?.includes('aivencloud.com')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = mysql.createPool(poolConfig);

export async function checkConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as connected, DATABASE() as db, VERSION() as version');
    return { ok: true, info: rows[0] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
