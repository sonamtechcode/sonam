const axios = require('axios');
const { sendWhatsAppMessage, isWhatsAppConnected } = require('./whatsappBaileys');

// ============================================
// SMS SERVICE (Using Fast2SMS)
// ============================================
async function sendSMS(phone, message) {
  try {
    const apiKey = process.env.SMS_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️  SMS API Key not configured');
      return { success: false, message: 'SMS API not configured' };
    }

    // Fast2SMS API
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'v3',
      sender_id: 'TXTIND',
      message: message,
      language: 'english',
      flash: 0,
      numbers: phone
    }, {
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ SMS sent to:', phone);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ SMS Error:', error.message);
    return { success: false, message: error.message };
  }
}

// ============================================
// WHATSAPP SERVICE (Multiple Options)
// ============================================

// Option 1: CallMeBot (FREE - No API Key needed!)
async function sendWhatsAppCallMeBot(phone, message) {
  try {
    const apiKey = process.env.CALLMEBOT_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️  CallMeBot API Key not configured');
      console.log('💡 Setup: Send "I allow callmebot to send me messages" to +34 644 51 44 60 on WhatsApp');
      return { success: false, message: 'CallMeBot not configured' };
    }

    // CallMeBot API (FREE!)
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=+91${phone}&text=${encodedMessage}&apikey=${apiKey}`;
    
    const response = await axios.get(url);

    console.log('✅ WhatsApp sent via CallMeBot to:', phone);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ WhatsApp Error:', error.message);
    return { success: false, message: error.message };
  }
}

// Option 2: Twilio WhatsApp
async function sendWhatsAppTwilio(phone, message) {
  try {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!twilioSid || !twilioToken) {
      console.log('⚠️  Twilio WhatsApp not configured');
      return { success: false, message: 'Twilio not configured' };
    }

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      new URLSearchParams({
        From: `whatsapp:${twilioWhatsApp}`,
        To: `whatsapp:+91${phone}`,
        Body: message
      }),
      {
        auth: {
          username: twilioSid,
          password: twilioToken
        }
      }
    );

    console.log('✅ WhatsApp sent via Twilio to:', phone);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Twilio Error:', error.message);
    return { success: false, message: error.message };
  }
}

// Option 3: Green API (FREE - 1000 msgs/month!)
async function sendWhatsAppGreenAPI(phone, message) {
  try {
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const token = process.env.GREEN_API_TOKEN;

    if (!instanceId || !token) {
      console.log('⚠️  Green API not configured');
      console.log('💡 Setup: https://green-api.com/ (FREE 1000 msgs/month)');
      return { success: false, message: 'Green API not configured' };
    }

    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;
    
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

// Option 4: WATI.io (WhatsApp Business API)
async function sendWhatsAppWATI(phone, message) {
  try {
    const watiToken = process.env.WATI_API_TOKEN;
    const watiUrl = process.env.WATI_API_URL;

    if (!watiToken || !watiUrl) {
      console.log('⚠️  WATI WhatsApp not configured');
      return { success: false, message: 'WATI not configured' };
    }

    const response = await axios.post(
      `${watiUrl}/api/v1/sendSessionMessage/+91${phone}`,
      {
        messageText: message
      },
      {
        headers: {
          'Authorization': `Bearer ${watiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp sent via WATI to:', phone);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ WATI Error:', error.message);
    return { success: false, message: error.message };
  }
}

// Main WhatsApp function - tries multiple services in priority order
async function sendWhatsApp(phone, message) {
  // Priority 1: Baileys (Direct WhatsApp - NO third party!)
  if (isWhatsAppConnected()) {
    console.log('📱 Using Baileys (Direct WhatsApp)');
    return await sendWhatsAppMessage(phone, message);
  }
  
  // Priority 2: Green API (FREE 1000 msgs/month)
  if (process.env.GREEN_API_INSTANCE_ID && process.env.GREEN_API_TOKEN) {
    console.log('📱 Using Green API');
    return await sendWhatsAppGreenAPI(phone, message);
  }
  
  // Priority 3: CallMeBot (FREE but only your number)
  if (process.env.CALLMEBOT_API_KEY) {
    console.log('📱 Using CallMeBot');
    return await sendWhatsAppCallMeBot(phone, message);
  }
  
  // Priority 4: Twilio (Paid)
  if (process.env.TWILIO_ACCOUNT_SID) {
    console.log('📱 Using Twilio');
    return await sendWhatsAppTwilio(phone, message);
  }
  
  // Priority 5: WATI (Paid)
  if (process.env.WATI_API_TOKEN) {
    console.log('📱 Using WATI');
    return await sendWhatsAppWATI(phone, message);
  }

  console.log('⚠️  No WhatsApp service configured');
  console.log('💡 Start Baileys: node whatsapp-start.js');
  return { success: false, message: 'No WhatsApp service configured' };
}

// ============================================
// APPOINTMENT NOTIFICATIONS
// ============================================

// Send appointment confirmation to patient with queue info
async function sendAppointmentConfirmation(patientPhone, patientName, doctorName, appointmentDate, appointmentTime, tokenNumber, patientsAhead, estimatedWaitTime) {
  const message = `🏥 *Appointment Confirmed!*

Dear ${patientName},

✅ Your appointment has been booked successfully!

👨‍⚕️ *Doctor:* Dr. ${doctorName}
📅 *Date:* ${appointmentDate}
⏰ *Time:* ${appointmentTime}
🎫 *Token Number:* ${tokenNumber}

📊 *Queue Status:*
👥 Patients ahead of you: ${patientsAhead}
⏱️ Estimated wait time: ${estimatedWaitTime} minutes

💡 *Important:*
• Please arrive 10 minutes early
• Keep your token number ready
• You will receive updates as the queue moves

Thank you! 🙏`;

  // Send both SMS and WhatsApp
  const smsResult = await sendSMS(patientPhone, message);
  const whatsappResult = await sendWhatsApp(patientPhone, message);

  return {
    sms: smsResult,
    whatsapp: whatsappResult
  };
}

// Send appointment notification to doctor
async function sendDoctorNotification(doctorPhone, doctorName, patientName, appointmentDate, appointmentTime) {
  const message = `Dr. ${doctorName},

New appointment scheduled:

Patient: ${patientName}
Date: ${appointmentDate}
Time: ${appointmentTime}

Please check your dashboard for details.`;

  // Send both SMS and WhatsApp
  const smsResult = await sendSMS(doctorPhone, message);
  const whatsappResult = await sendWhatsApp(doctorPhone, message);

  return {
    sms: smsResult,
    whatsapp: whatsappResult
  };
}

// Send appointment reminder (1 day before)
async function sendAppointmentReminder(patientPhone, patientName, doctorName, appointmentDate, appointmentTime) {
  const message = `Reminder: ${patientName}

Your appointment is tomorrow!

Doctor: Dr. ${doctorName}
Date: ${appointmentDate}
Time: ${appointmentTime}

See you soon!`;

  const smsResult = await sendSMS(patientPhone, message);
  const whatsappResult = await sendWhatsApp(patientPhone, message);

  return {
    sms: smsResult,
    whatsapp: whatsappResult
  };
}

// Send appointment cancellation
async function sendAppointmentCancellation(patientPhone, patientName, doctorName, appointmentDate) {
  const message = `Dear ${patientName},

Your appointment with Dr. ${doctorName} on ${appointmentDate} has been cancelled.

Please contact us to reschedule.

Thank you!`;

  const smsResult = await sendSMS(patientPhone, message);
  const whatsappResult = await sendWhatsApp(patientPhone, message);

  return {
    sms: smsResult,
    whatsapp: whatsappResult
  };
}

// Send queue update notification
async function sendQueueUpdate(patientPhone, patientName, tokenNumber, patientsAhead, estimatedWaitTime) {
  const message = `🔔 *Queue Update!*

Dear ${patientName},

Your turn is getting closer! 🎯

🎫 *Your Token:* ${tokenNumber}
👥 *Patients ahead:* ${patientsAhead}
⏱️ *Estimated wait:* ${estimatedWaitTime} minutes

${patientsAhead === 0 ? '🎉 *You are NEXT!* Please be ready!' : patientsAhead === 1 ? '⚡ *Almost your turn!* Please get ready!' : '⏳ Please wait, we will notify you again.'}

Thank you for your patience! 🙏`;

  const smsResult = await sendSMS(patientPhone, message);
  const whatsappResult = await sendWhatsApp(patientPhone, message);

  return {
    sms: smsResult,
    whatsapp: whatsappResult
  };
}

// Send "Your Turn" notification
async function sendYourTurnNotification(patientPhone, patientName, tokenNumber, doctorName) {
  const message = `🎉 *IT'S YOUR TURN!*

Dear ${patientName},

Please proceed to the consultation room NOW! 🏃

🎫 *Token Number:* ${tokenNumber}
👨‍⚕️ *Doctor:* Dr. ${doctorName}

📍 Please check the display board for room number.

Thank you! 🙏`;

  const smsResult = await sendSMS(patientPhone, message);
  const whatsappResult = await sendWhatsApp(patientPhone, message);

  return {
    sms: smsResult,
    whatsapp: whatsappResult
  };
}

// ============================================
// DEMO MODE (For testing without API keys)
// ============================================
function sendDemoNotification(phone, message) {
  console.log('\n📱 ============ DEMO NOTIFICATION ============');
  console.log('📞 To:', phone);
  console.log('💬 Message:');
  console.log(message);
  console.log('============================================\n');
  
  return {
    success: true,
    demo: true,
    message: 'Demo notification logged to console'
  };
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  sendSMS,
  sendWhatsApp,
  sendAppointmentConfirmation,
  sendDoctorNotification,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendQueueUpdate,
  sendYourTurnNotification,
  sendDemoNotification
};
