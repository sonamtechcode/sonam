// Mock Database for testing without Supabase connection
const bcrypt = require('bcryptjs');

// In-memory data store
const mockData = {
  hospitals: [
    {
      id: 1,
      name: 'Solvixo Hospital',
      email: 'info@solvixo.com',
      phone: '+91-9876543210',
      address: '123 Medical Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      status: 'active'
    }
  ],
  users: [
    {
      id: 1,
      hospital_id: 1,
      username: 'admin',
      email: 'admin@solvixo.com',
      password_hash: '$2a$10$IpaP6phoNbtsAyrwICsyWOwgF/qub.uIAKt9/E2qVG961IaFEyxw6', // 123456
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      is_active: true,
      created_at: new Date()
    },
    {
      id: 2,
      hospital_id: 1,
      username: 'dr_sharma',
      email: 'dr.sharma@solvixo.com',
      password_hash: '$2a$10$IpaP6phoNbtsAyrwICsyWOwgF/qub.uIAKt9/E2qVG961IaFEyxw6', // 123456
      role: 'doctor',
      first_name: 'Rajesh',
      last_name: 'Sharma',
      department: 'Cardiology',
      is_active: true,
      created_at: new Date()
    }
  ],
  patients: [],
  appointments: [],
  doctors: []
};

// Hybrid result: array-destructurable as [rows, fields] (MySQL-style callers)
// while also exposing .rows/.rowCount (PostgreSQL-style callers)
const makeResult = (rows) => {
  const result = [rows, []];
  result.rows = rows;
  result.rowCount = rows.length;
  return result;
};

// Mock query function
const query = async (sql, params = []) => {
  console.log('📝 Mock Query:', sql.substring(0, 80) + '...');

  // SELECT users by email (with hospital join)
  if (sql.includes('SELECT u.*') && sql.includes('FROM users u') && sql.includes('WHERE u.email')) {
    const email = params[0];
    const user = mockData.users.find(u => u.email === email && u.is_active);
    if (user) {
      const hospital = mockData.hospitals.find(h => h.id === user.hospital_id);
      return makeResult([{ ...user, hospital_name: hospital?.name }]);
    }
    return makeResult([]);
  }

  // SELECT user by id (used by auth middleware to validate the token on every request)
  if (sql.includes('FROM users') && sql.includes('WHERE id')) {
    const id = params[0];
    const user = mockData.users.find(u => u.id === id && u.is_active);
    if (!user) return makeResult([]);
    const { password_hash, ...safeUser } = user;
    return makeResult([safeUser]);
  }

  // INSERT user
  if (sql.includes('INSERT INTO users')) {
    const newUser = {
      id: mockData.users.length + 1,
      hospital_id: params[0],
      username: params[1],
      email: params[2],
      password_hash: params[3],
      first_name: params[4],
      role: params[5],
      is_active: params[6],
      created_at: new Date()
    };
    mockData.users.push(newUser);
    return makeResult([{ id: newUser.id }]);
  }

  // Generic COUNT(*) queries (real Postgres always returns exactly one row here)
  if (/SELECT\s+COUNT\(\*\)/i.test(sql)) {
    return makeResult([{ count: 0 }]);
  }

  // Default response
  return makeResult([]);
};

// Mock connect function
const connect = async () => {
  return {
    query: query,
    release: () => {}
  };
};

module.exports = {
  query,
  connect,
  end: async () => {}
};
