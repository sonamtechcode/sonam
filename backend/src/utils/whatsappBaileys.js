/**
 * Baileys WhatsApp Service
 * Direct WhatsApp connection - NO third party API!
 * Uses official WhatsApp Web protocol
 */

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

let sock = null;
let isConnected = false;
let qrGenerated = false;

// Auth folder path
const authFolder = path.join(__dirname, '../../whatsapp-auth');

// Ensure auth folder exists
if (!fs.existsSync(authFolder)) {
  fs.mkdirSync(authFolder, { recursive: true });
}

/**
 * Connect to WhatsApp
 */
async function connectWhatsApp() {
  try {
    console.log('\n🔌 Connecting to WhatsApp...\n');

    // Load auth state
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

    // Create socket connection
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false, // We'll handle QR display ourselves
      browser: ['Hospital Management', 'Chrome', '1.0.0'],
      syncFullHistory: false
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Display QR code
      if (qr && !qrGenerated) {
        console.log('\n📱 ============ SCAN QR CODE ============\n');
        qrcode.generate(qr, { small: true });
        console.log('\n📱 Steps:');
        console.log('1. Open WhatsApp on your phone (7060985193)');
        console.log('2. Go to: Settings → Linked Devices');
        console.log('3. Tap "Link a Device"');
        console.log('4. Scan the QR code above\n');
        console.log('========================================\n');
        qrGenerated = true;
      }

      // Connection closed
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log('❌ Connection closed. Reason:', lastDisconnect?.error?.message);
        
        if (shouldReconnect) {
          console.log('🔄 Reconnecting...');
          await delay(3000);
          connectWhatsApp();
        } else {
          console.log('⚠️  Logged out. Please scan QR code again.');
          isConnected = false;
          qrGenerated = false;
        }
      }

      // Connection opened
      if (connection === 'open') {
        console.log('✅ WhatsApp Connected Successfully!\n');
        console.log('📱 Your WhatsApp is now linked!');
        console.log('🎉 Ready to send messages!\n');
        isConnected = true;
        qrGenerated = false;
      }
    });

    // Handle messages (optional - for receiving)
    sock.ev.on('messages.upsert', async ({ messages }) => {
      // You can handle incoming messages here if needed
    });

    return sock;
  } catch (error) {
    console.error('❌ WhatsApp Connection Error:', error.message);
    isConnected = false;
    return null;
  }
}

/**
 * Send WhatsApp message
 */
async function sendWhatsAppMessage(phone, message) {
  try {
    // Check if connected
    if (!sock || !isConnected) {
      console.log('⚠️  WhatsApp not connected. Connecting...');
      await connectWhatsApp();
      
      // Wait for connection
      let attempts = 0;
      while (!isConnected && attempts < 30) {
        await delay(1000);
        attempts++;
      }
      
      if (!isConnected) {
        return { 
          success: false, 
          message: 'WhatsApp not connected. Please scan QR code.' 
        };
      }
    }

    // Format phone number (WhatsApp JID format)
    const jid = `91${phone}@s.whatsapp.net`;

    // Send message
    await sock.sendMessage(jid, { text: message });

    console.log('✅ WhatsApp message sent to:', phone);
    return { success: true };
  } catch (error) {
    console.error('❌ Send Message Error:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Check if WhatsApp is connected
 */
function isWhatsAppConnected() {
  return isConnected;
}

/**
 * Disconnect WhatsApp
 */
async function disconnectWhatsApp() {
  if (sock) {
    await sock.logout();
    sock = null;
    isConnected = false;
    console.log('👋 WhatsApp disconnected');
  }
}

/**
 * Get connection status
 */
function getConnectionStatus() {
  return {
    connected: isConnected,
    socket: sock ? 'active' : 'inactive'
  };
}

module.exports = {
  connectWhatsApp,
  sendWhatsAppMessage,
  isWhatsAppConnected,
  disconnectWhatsApp,
  getConnectionStatus
};
