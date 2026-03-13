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

// Mock query function
const query = async (sql, params = []) => {
  console.log('📝 Mock Query:', sql.substring(0, 80) + '...');

  // SELECT users by email (with hospital join)
  if (sql.includes('SELECT u.*') && sql.includes('FROM users u') && sql.includes('WHERE u.email')) {
    const email = params[0];
    const user = mockData.users.find(u => u.email === email && u.is_active);
    if (user) {
      const hospital = mockData.hospitals.find(h => h.id === user.hospital_id);
      return {
        rows: [{ ...user, hospital_name: hospital?.name }],
        rowCount: 1
      };
    }
    return {
      rows: [],
      rowCount: 0
    };
  }

  // SELECT user by id
  if (sql.includes('SELECT u.id, u.email') && sql.includes('WHERE u.id')) {
    const id = params[0];
    const user = mockData.users.find(u => u.id === id);
    return {
      rows: user ? [{ ...user, password_hash: undefined }] : [],
      rowCount: user ? 1 : 0
    };
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
    return {
      rows: [{ id: newUser.id }],
      rowCount: 1
    };
  }

  // Default response
  return {
    rows: [],
    rowCount: 0
  };
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
