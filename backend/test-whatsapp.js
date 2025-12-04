const axios = require('axios');
require('dotenv').config();

async function testWhatsApp() {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const token = process.env.GREEN_API_TOKEN;

  console.log('🔍 Testing Green API WhatsApp...\n');
  console.log('Instance ID:', instanceId);
  console.log('Token:', token.substring(0, 20) + '...\n');

  // Check status
  try {
    console.log('📡 Checking connection status...');
    const statusUrl = `https://7105.api.green-api.com/waInstance${instanceId}/getStateInstance/${token}`;
    const statusResponse = await axios.get(statusUrl);
    
    console.log('Status:', statusResponse.data.stateInstance);
    
    if (statusResponse.data.stateInstance === 'notAuthorized') {
      console.log('\n❌ WhatsApp Not Connected!');
      console.log('\n📱 Scan QR Code:');
      console.log(`https://7105.api.green-api.com/waInstance${instanceId}/qr/${token}`);
      console.log('\nSteps:');
      console.log('1. Open above URL in browser');
      console.log('2. Scan QR code with WhatsApp');
      console.log('3. Run this script again\n');
      return;
    }

    if (statusResponse.data.stateInstance === 'authorized') {
      console.log('✅ WhatsApp Connected!\n');
      
      // Send test message
      console.log('📤 Sending test message to 7060985193...');
      const sendUrl = `https://7105.api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;
      
      const response = await axios.post(sendUrl, {
        chatId: '917060985193@c.us',
        message: '🎉 Test message from Hospital Management System!\n\nWhatsApp notifications are working! ✅'
      });

      console.log('✅ Message sent successfully!');
      console.log('Message ID:', response.data.idMessage);
      console.log('\n📱 Check WhatsApp on 7060985193!\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testWhatsApp();
