// backend/test-sendgrid-simple.js
const sgMail = require('@sendgrid/mail');

async function testSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.error('❌ SENDGRID_API_KEY is not set in environment variables');
    console.log('Get a free SendGrid account at: https://sendgrid.com');
    console.log('Then add: SENDGRID_API_KEY=SG.your-actual-key-here');
    return;
  }
  
  console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
  
  try {
    sgMail.setApiKey(apiKey);
    
    const msg = {
      to: 'upasanacatering@gmail.com',
      from: {
        email: 'upasanawebemail@gmail.com',
        name: 'Upasana Catering Test'
      },
      subject: 'SendGrid Test',
      text: 'This is a test email from SendGrid.',
      html: '<strong>SendGrid is working!</strong>'
    };
    
    console.log('📤 Sending test email...');
    const response = await sgMail.send(msg);
    
    console.log('✅ Email sent successfully!');
    console.log('Status:', response[0].statusCode);
    console.log('Message ID:', response[0].headers['x-message-id']);
    
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your sender email in SendGrid dashboard');
    console.log('2. Check API key permissions (needs Mail Send)');
    console.log('3. Check if email is verified in SendGrid');
  }
}

testSendGrid();