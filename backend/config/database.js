// backend/config/database.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ModernTech_Solutions',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // FIX: Keep connections alive to prevent morning timeouts
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  });
}

pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
  });

export default pool;