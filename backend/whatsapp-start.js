/**
 * Start WhatsApp Connection
 * Run this ONCE to connect your WhatsApp
 * Keep it running in background
 */

const { connectWhatsApp, sendWhatsAppMessage } = require('./src/utils/whatsappBaileys');

console.log('🚀 Starting WhatsApp Service...\n');
console.log('📱 This will connect your WhatsApp (7060985193) to the system\n');
console.log('⚠️  IMPORTANT: Keep this terminal open!\n');

// Connect WhatsApp
connectWhatsApp().then(async (sock) => {
  if (sock) {
    console.log('✅ WhatsApp service started!\n');
    console.log('💡 Now you can:');
    console.log('   1. Start backend server: npm start');
    console.log('   2. Book appointments');
    console.log('   3. Messages will be sent automatically!\n');
    
    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down WhatsApp service...');
      process.exit(0);
    });
  }
});

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Error:', error.message);
});
