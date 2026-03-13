const mysql = require('mysql2/promise');

let pool = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

const createPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
    connectionTimeout: 10000
  });
};

// Initialize pool
try {
  pool = createPool();
  console.log('📦 Database pool created');
} catch (err) {
  console.error('❌ Failed to create database pool:', err.message);
}

// Test connection asynchronously (non-blocking)
const testConnection = async () => {
  if (!pool) {
    console.warn('⚠️  Database pool not initialized');
    return false;
  }

  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (err) {
    connectionAttempts++;
    console.warn(`⚠️  Database connection attempt ${connectionAttempts}/${MAX_RETRIES} failed:`, err.message);
    
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`   Retrying in 5 seconds...`);
      setTimeout(testConnection, 5000);
    } else {
      console.warn('⚠️  Max connection attempts reached. Server will continue without database.');
      console.warn('💡 Make sure these environment variables are set:');
      console.warn('   - DB_HOST');
      console.warn('   - DB_USER');
      console.warn('   - DB_PASSWORD');
      console.warn('   - DB_NAME');
    }
    return false;
  }
};

// Test connection after a short delay (non-blocking)
setTimeout(testConnection, 1000);

module.exports = pool;
