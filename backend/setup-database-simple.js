require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Setting up Hospital Management Database...\n');

  try {
    // Create connection (without database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL\n');

    // Read and execute unified schema
    console.log('📋 Running unified schema...');
    const schemaPath = path.join(__dirname, '../database/unified-complete-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✅ Schema executed successfully\n');

    // Verify tables
    await connection.query('USE hospital_management');
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n✅ Database: hospital_management`);
    console.log(`✅ Total Tables: ${tables.length}`);
    console.log('\n📋 Tables Created:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    console.log('\n🔐 Default Login:');
    console.log('   Email: admin@hospital.com');
    console.log('   Password: admin123');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Start frontend: cd ../frontend/frontend && npm run dev');
    console.log('   3. Login and enjoy!\n');

    await connection.end();

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check MySQL is running');
    console.error('   2. Verify .env credentials');
    console.error('   3. Ensure user has CREATE DATABASE permission\n');
    process.exit(1);
  }
}

setupDatabase();
