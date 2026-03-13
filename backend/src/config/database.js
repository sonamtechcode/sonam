const { Pool } = require('pg');

let pool = null;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

const createPool = () => {
  try {
    return new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management',
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  } catch (err) {
    console.error('❌ Failed to create database pool:', err.message);
    return null;
  }
};

// Initialize pool immediately
pool = createPool();
if (pool) {
  console.log('📦 Database pool created');
}

// Test connection asynchronously (non-blocking)
const testConnection = async () => {
  if (!pool) {
    console.warn('⚠️  Database pool not initialized');
    return false;
  }

  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
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
      console.warn('   - DB_PORT');
      console.warn('   - DB_USER');
      console.warn('   - DB_PASSWORD');
      console.warn('   - DB_NAME');
    }
    return false;
  }
};

// Test connection after a short delay (non-blocking)
setTimeout(testConnection, 1000);

// Export pool or a mock if pool creation failed
module.exports = pool || {
  query: async () => {
    throw new Error('Database pool not initialized. Check environment variables.');
  },
  connect: async () => {
    throw new Error('Database pool not initialized. Check environment variables.');
  }
};
