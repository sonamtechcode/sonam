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
    
    try {
      // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc if needed
      let pgSql = sql;
      let pgParams = params || [];
      
      if (sql.includes('?')) {
        let placeholderIndex = 1;
        pgSql = sql.replace(/\?/g, () => `$${placeholderIndex++}`);
      }
      
      const result = await pool.query(pgSql, pgParams);

      // Hybrid result: array-destructurable as [rows, fields] (MySQL-style callers)
      // while also exposing .rows/.rowCount/.fields (PostgreSQL-style callers)
      const hybrid = [result.rows, result.fields];
      hybrid.rows = result.rows;
      hybrid.rowCount = result.rowCount;
      hybrid.fields = result.fields;
      return hybrid;
    } catch (error) {
      console.error('Query error:', {
        sql: sql.substring(0, 100),
        error: error.message
      });
      throw error;
    }
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
