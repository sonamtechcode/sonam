const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupNotifications() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hospital_management',
      multipleStatements: true
    });

    const sql = fs.readFileSync(path.join(__dirname, '../database/notifications.sql'), 'utf8');
    await conn.query(sql);
    
    console.log('✅ Notifications and password reset tables created successfully!');
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupNotifications();
