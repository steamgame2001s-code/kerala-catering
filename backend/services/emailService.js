// backend/services/emailService.js
// Gmail SMTP Service - Replaces SendGrid

const nodemailer = require('nodemailer');

// Create transporter once
let transporter = null;

const initTransporter = () => {
  if (!transporter && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.FROM_EMAIL || 'upasanawebemail@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      },
      // Optional: Increase timeout for slow connections
      pool: true,
      maxConnections: 1,
      maxMessages: 100
    });
    console.log('✅ Gmail SMTP configured');
  }
  return transporter;
};

// Check if email service is available
const isEmailAvailable = () => {
  return !!process.env.GMAIL_APP_PASSWORD && !!process.env.FROM_EMAIL;
};

// Send test email
const sendTestEmail = async () => {
  if (!isEmailAvailable()) {
    throw new Error('Email service not configured');
  }
  
  const transporter = initTransporter();
  const toEmail = process.env.BUSINESS_EMAIL || 'upasanacatering@gmail.com';
  
  const info = await transporter.sendMail({
    from: `"Upasana Catering" <${process.env.FROM_EMAIL}>`,
    to: toEmail,
    subject: '✅ Test Email - Upasana Catering',
    html: `
      <h1>✅ Test Email Successful!</h1>
      <p>Your catering website email system is working correctly via Gmail SMTP.</p>
      <p><strong>Provider:</strong> Gmail SMTP</p>
      <p><strong>TO:</strong> ${toEmail}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `
  });
  
  return { messageId: info.messageId };
};

// Send inquiry email
const sendInquiryEmail = async (inquiryData) => {
  const { name, phone, location, email, event, menu, comments, inquiryId } = inquiryData;
  
  if (!isEmailAvailable()) {
    throw new Error('Email service not configured');
  }
  
  const transporter = initTransporter();
  const toEmail = process.env.BUSINESS_EMAIL || 'upasanacatering@gmail.com';
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .section { margin-bottom: 20px; }
        .section-title { color: #f97316; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
        .field { margin-bottom: 8px; }
        .field-label { font-weight: bold; color: #4b5563; }
        .field-value { color: #1f2937; }
        .priority { background: #dc2626; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
        .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌟 New Menu Inquiry 🌟</h1>
          <h2>Upasana Catering Services</h2>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">
              👤 Customer Information <span class="priority">NEW INQUIRY</span>
            </div>
            <div class="field"><span class="field-label">Name:</span> <span class="field-value">${name}</span></div>
            <div class="field"><span class="field-label">Phone:</span> <span class="field-value">${phone}</span></div>
            <div class="field"><span class="field-label">Location:</span> <span class="field-value">${location}</span></div>
            <div class="field"><span class="field-label">Email:</span> <span class="field-value">${email || 'Not provided'}</span></div>
          </div>
          
          <div class="section">
            <div class="section-title">📅 Event Details</div>
            <div class="field"><span class="field-label">Event Type:</span> <span class="field-value">${event || 'Not specified'}</span></div>
            <div class="field"><span class="field-label">Preferred Menu:</span> <span class="field-value">${menu || 'Not selected'}</span></div>
          </div>
          
          ${comments ? `
          <div class="section">
            <div class="section-title">💬 Special Requests</div>
            <div style="background: #fff7ed; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
              ${comments.replace(/\n/g, '<br>')}
            </div>
          </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">📊 Inquiry Summary</div>
            <div class="field"><span class="field-label">Inquiry ID:</span> <span class="field-value">${inquiryId}</span></div>
            <div class="field"><span class="field-label">Date:</span> <span class="field-value">${new Date().toLocaleDateString('en-IN')}</span></div>
            <div class="field"><span class="field-label">Time:</span> <span class="field-value">${new Date().toLocaleTimeString('en-IN')}</span></div>
          </div>
          
          <div class="footer">
            <p><strong>Action Required:</strong> Please contact customer within 24 hours</p>
            <p><em>WhatsApp: ${phone} | Email: ${email || 'Not provided'}</em></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const info = await transporter.sendMail({
    from: `"Upasana Catering Website" <${process.env.FROM_EMAIL}>`,
    to: toEmail,
    replyTo: email || process.env.BUSINESS_EMAIL,
    subject: `🍽️ New Menu Inquiry - ${name} - ${inquiryId}`,
    html: htmlTemplate,
    text: `
      NEW MENU INQUIRY - UPASANA CATERING
      ====================================
      Name: ${name}
      Phone: ${phone}
      Location: ${location}
      Email: ${email || 'Not provided'}
      Event: ${event || 'Not specified'}
      Menu: ${menu || 'Not selected'}
      ${comments ? `Comments: ${comments}` : ''}
      Inquiry ID: ${inquiryId}
    `
  });
  
  return { messageId: info.messageId };
};

// Send password reset OTP
const sendPasswordResetOTP = async (admin, otp) => {
  if (!isEmailAvailable()) {
    throw new Error('Email service not configured');
  }
  
  const transporter = initTransporter();
  
  const info = await transporter.sendMail({
    from: `"Upasana Catering" <${process.env.FROM_EMAIL}>`,
    to: admin.email,
    subject: '🔐 Password Reset OTP - Upasana Catering',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Password Reset Request</h2>
        <p>Hello ${admin.name || admin.username},</p>
        <p>You requested to reset your password. Use the OTP below to verify your identity:</p>
        <div style="background: #fef3c7; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 10px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">Upasana Catering Services</p>
      </div>
    `,
    text: `Your OTP for password reset is: ${otp}. Valid for 10 minutes.`
  });
  
  return { messageId: info.messageId };
};

module.exports = {
  initTransporter,
  isEmailAvailable,
  sendTestEmail,
  sendInquiryEmail,
  sendPasswordResetOTP
};