const { Pool } = require('pg');
const mockDatabase = require('./mockDatabase');

let pool = null;
let connectionAttempts = 0;
const MAX_RETRIES = 1;
let useMockDatabase = false;

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
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
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
    useMockDatabase = true;
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
      console.warn('⚠️  Using mock database for development');
      useMockDatabase = true;
    }
    return false;
  }
};

// Test connection after a short delay (non-blocking)
setTimeout(testConnection, 1000);

// Export pool with fallback to mock database
module.exports = {
  query: async (sql, params) => {
    if (useMockDatabase) {
      return mockDatabase.query(sql, params);
    }
    return pool.query(sql, params);
  },
  connect: async () => {
    if (useMockDatabase) {
      return mockDatabase.connect();
    }
    return pool.connect();
  },
  end: async () => {
    if (!useMockDatabase && pool) {
      return pool.end();
    }
  }
};
