// backend/config/database.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  // PRODUCTION (Cloud / Aiven / Render)
  // Cloud databases REQUIRE an SSL connection
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true
    }
  });
} else {
  // DEVELOPMENT (Localhost)
  // Local databases do NOT use SSL, and will crash if you try to force it
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Removed hardcoded password for GitHub safety
    database: process.env.DB_NAME || 'ModernTech_Solutions',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
    // Notice: NO 'ssl' property here, so localhost works perfectly
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