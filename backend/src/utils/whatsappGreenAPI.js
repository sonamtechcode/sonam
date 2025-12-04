const axios = require('axios');

/**
 * Green API - FREE WhatsApp Service
 * FREE Tier: 1000 messages/month
 * Setup: https://green-api.com/
 */

async function sendWhatsAppGreenAPI(phone, message) {
  try {
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const token = process.env.GREEN_API_TOKEN;

    if (!instanceId || !token) {
      console.log('⚠️  Green API not configured');
      console.log('💡 Setup: https://green-api.com/ (FREE 1000 msgs/month)');
      return { success: false, message: 'Green API not configured' };
    }

    // Green API endpoint
    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;
    
    // Send message
    const response = await axios.post(url, {
      chatId: `91${phone}@c.us`,
      message: message
    });

    console.log('✅ WhatsApp sent via Green API to:', phone);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Green API Error:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Check if Green API is configured
 */
function isGreenAPIConfigured() {
  return !!(process.env.GREEN_API_INSTANCE_ID && process.env.GREEN_API_TOKEN);
}

/**
 * Get Green API status
 */
async function getGreenAPIStatus() {
  try {
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const token = process.env.GREEN_API_TOKEN;

    if (!instanceId || !token) {
      return { configured: false };
    }

    const url = `https://api.green-api.com/waInstance${instanceId}/getStateInstance/${token}`;
    const response = await axios.get(url);

    return {
      configured: true,
      status: response.data.stateInstance,
      connected: response.data.stateInstance === 'authorized'
    };
  } catch (error) {
    return {
      configured: true,
      status: 'error',
      connected: false,
      error: error.message
    };
  }
}

module.exports = {
  sendWhatsAppGreenAPI,
  isGreenAPIConfigured,
  getGreenAPIStatus
};
