// backend/services/sendgridService.js
const sgMail = require('@sendgrid/mail');

class SendGridService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('⚠️ SENDGRID_API_KEY not found. Emails may fail.');
        return false;
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.initialized = true;
      
      console.log('✅ SendGrid initialized for:', {
        from: process.env.FROM_EMAIL || 'Not set',
        to: process.env.BUSINESS_EMAIL || 'Not set'
      });
      return true;
    } catch (error) {
      console.error('❌ SendGrid init error:', error.message);
      return false;
    }
  }

  // Send test email
  async sendTestEmail() {
    if (!this.initialized) {
      throw new Error('SendGrid not initialized');
    }

    const toEmail = process.env.BUSINESS_EMAIL || 'upasanacatering@gmail.com';
    const fromEmail = process.env.FROM_EMAIL || 'upasanawebemail@gmail.com';
    const fromName = process.env.FROM_NAME || 'Upasana Catering Website';

    const msg = {
      to: toEmail,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: '✅ SendGrid Test - Upasana Catering',
      text: `This is a test email from your catering website.\n\nFROM: ${fromEmail}\nTO: ${toEmail}\nTime: ${new Date().toLocaleString()}\nProvider: SendGrid`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f97316; color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0;">✅ SendGrid Test</h1>
            <p style="margin: 10px 0 0 0;">Upasana Catering Website</p>
          </div>
          <div style="background: #f9fafb; padding: 30px;">
            <p>Hello,</p>
            <p>Your SendGrid email configuration is working!</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <p><strong>Email Details:</strong></p>
              <p><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
              <p><strong>To:</strong> ${toEmail}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Provider:</strong> SendGrid</p>
              <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Connected ✓</span></p>
            </div>
            <p>You can now receive:</p>
            <ul>
              <li>Customer inquiries from website</li>
              <li>Admin password reset emails</li>
              <li>Booking confirmations</li>
            </ul>
            <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p><strong>Upasana Catering Services</strong></p>
              <p>Website: www.yourwebsite.com</p>
            </div>
          </div>
        </div>
      `
    };

    try {
      console.log(`📤 Sending test email via SendGrid:`);
      console.log(`   FROM: ${fromEmail}`);
      console.log(`   TO: ${toEmail}`);
      
      const response = await sgMail.send(msg);
      
      console.log(`✅ Test email sent!`);
      console.log(`   Status: ${response[0].statusCode}`);
      console.log(`   Message ID: ${response[0].headers['x-message-id']}`);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        statusCode: response[0].statusCode,
        from: fromEmail,
        to: toEmail
      };
    } catch (error) {
      console.error('SendGrid error:', error.message);
      if (error.response) {
        console.error('Error details:', JSON.stringify(error.response.body, null, 2));
      }
      throw error;
    }
  }

  // Send inquiry email from FoodMenu form
  async sendInquiryEmail(inquiryData) {
    if (!this.initialized) {
      throw new Error('SendGrid not initialized');
    }

    const {
      name,
      phone,
      location,
      email,
      event,
      menu,
      comments
    } = inquiryData;

    const inquiryId = `INQ${Date.now().toString().slice(-6)}`;
    const toEmail = process.env.BUSINESS_EMAIL || 'upasanacatering@gmail.com';
    const fromEmail = process.env.FROM_EMAIL || 'upasanawebemail@gmail.com';
    const fromName = process.env.FROM_NAME || 'Upasana Catering Website';

    // HTML template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
          .header { background: #f97316; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; }
          .content { padding: 30px; }
          .section { margin-bottom: 25px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .field { margin-bottom: 10px; padding: 5px 0; }
          .label { font-weight: bold; color: #4b5563; display: inline-block; width: 120px; }
          .value { color: #1f2937; }
          .priority { background: #dc2626; color: white; padding: 5px 12px; border-radius: 15px; font-size: 12px; margin-left: 10px; }
          .actions { text-align: center; margin: 25px 0; }
          .btn { display: inline-block; background: #f97316; color: white; padding: 10px 20px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ New Menu Inquiry <span class="priority">HIGH PRIORITY</span></h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Upasana Catering Services</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h3 style="color: #f97316; margin-top: 0;">👤 Customer Information</h3>
              <div class="field"><span class="label">Name:</span> <span class="value">${name}</span></div>
              <div class="field"><span class="label">Phone:</span> <span class="value"><strong>${phone}</strong></span></div>
              <div class="field"><span class="label">Location:</span> <span class="value">${location}</span></div>
              <div class="field"><span class="label">Email:</span> <span class="value">${email || 'Not provided'}</span></div>
            </div>
            
            <div class="section">
              <h3 style="color: #f97316; margin-top: 0;">📅 Event Details</h3>
              <div class="field"><span class="label">Event Type:</span> <span class="value">${event || 'Not specified'}</span></div>
              <div class="field"><span class="label">Preferred Menu:</span> <span class="value">${menu || 'Not selected'}</span></div>
            </div>
            
            ${comments ? `
            <div class="section">
              <h3 style="color: #f97316; margin-top: 0;">💬 Special Requests</h3>
              <div style="background: #fff7ed; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316; margin-top: 10px;">
                ${comments.replace(/\n/g, '<br>')}
              </div>
            </div>
            ` : ''}
            
            <div class="actions">
              <a href="tel:${phone}" class="btn">📞 Call Customer</a>
              <a href="https://wa.me/91${phone.replace(/\D/g, '')}" class="btn" style="background: #25D366;">💬 WhatsApp</a>
            </div>
            
            <div class="footer">
              <p><strong>Inquiry ID:</strong> ${inquiryId}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
              <p><strong>Source:</strong> Website Menu Page</p>
              <p><em>⚠️ Please contact customer within 24 hours</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Text version
    const textTemplate = `
      🍽️ NEW MENU INQUIRY - UPASANA CATERING
      ========================================
      
      Inquiry ID: ${inquiryId}
      Priority: HIGH
      
      👤 CUSTOMER INFORMATION
      -----------------------
      Name: ${name}
      Phone: ${phone}
      Location: ${location}
      Email: ${email || 'Not provided'}
      
      📅 EVENT DETAILS
      ----------------
      Event Type: ${event || 'Not specified'}
      Preferred Menu: ${menu || 'Not selected'}
      
      ${comments ? `💬 SPECIAL REQUESTS:\n${comments}\n\n` : ''}
      
      📊 INQUIRY SUMMARY
      ------------------
      Time: ${new Date().toLocaleString('en-IN')}
      Source: Website Menu Page
      
      🚀 ACTION REQUIRED
      ------------------
      Please contact customer within 24 hours!
      
      Quick Actions:
      • Call: ${phone}
      • WhatsApp: https://wa.me/91${phone.replace(/\D/g, '')}
      ${email ? `• Email: ${email}` : ''}
      
      ========================================
      Upasana Catering Services
      Sent via SendGrid from Website
    `;

    const msg = {
      to: toEmail,
      from: {
        email: fromEmail,
        name: fromName
      },
      replyTo: email || fromEmail,
      subject: `🍽️ New Inquiry from ${name} - ${inquiryId}`,
      html: htmlTemplate,
      text: textTemplate,
      // Add custom headers
      headers: {
        'X-Inquiry-ID': inquiryId,
        'X-Priority': '1',
        'X-Customer-Name': name,
        'X-Customer-Phone': phone
      }
    };

    try {
      console.log(`📤 Sending inquiry via SendGrid:`);
      console.log(`   Customer: ${name} (${phone})`);
      console.log(`   To: ${toEmail}`);
      console.log(`   Inquiry ID: ${inquiryId}`);
      
      const response = await sgMail.send(msg);
      
      console.log(`✅ Inquiry sent via SendGrid!`);
      console.log(`   Status: ${response[0].statusCode}`);
      
      return {
        success: true,
        inquiryId,
        sendGridResponse: {
          statusCode: response[0].statusCode,
          messageId: response[0].headers['x-message-id']
        }
      };
    } catch (error) {
      console.error('SendGrid inquiry error:', error.message);
      if (error.response) {
        console.error('Error details:', JSON.stringify(error.response.body, null, 2));
      }
      throw error;
    }
  }

  // Send OTP for password reset
  async sendPasswordResetOTP(adminData, otp) {
    if (!this.initialized) {
      throw new Error('SendGrid not initialized');
    }

    const { email, username } = adminData;
    const fromEmail = process.env.FROM_EMAIL || 'upasanawebemail@gmail.com';
    const fromName = process.env.FROM_NAME || 'Upasana Catering Admin';

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
          .header { background: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; }
          .content { padding: 30px; }
          .otp-box { 
            background: #374151; 
            color: white; 
            padding: 25px; 
            font-size: 36px; 
            font-weight: bold; 
            text-align: center; 
            letter-spacing: 8px;
            border-radius: 10px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .warning { 
            background: #fef3c7; 
            border-left: 5px solid #f59e0b; 
            padding: 20px; 
            margin: 25px 0;
            border-radius: 8px;
          }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Upasana Catering Admin Portal</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${username}</strong>,</p>
            
            <p>You requested to reset your password. Use this OTP to continue:</p>
            
            <div class="otp-box">${otp}</div>
            
            <div class="warning">
              <h4 style="color: #92400e; margin-top: 0;">⚠️ Security Information</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This OTP is valid for <strong>10 minutes only</strong></li>
                <li><strong>Never share this OTP</strong> with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password will not change unless you complete the reset process</li>
              </ul>
            </div>
            
            <div class="footer">
              <p><strong>Upasana Catering Admin</strong></p>
              <p>Time: ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
      🔐 PASSWORD RESET OTP - UPASANA CATERING ADMIN
      ==============================================
      
      Hello ${username},
      
      You requested to reset your password for the Admin Portal.
      
      YOUR OTP: ${otp}
      
      ⚠️ SECURITY:
      • This OTP is valid for 10 minutes only
      • Never share this OTP with anyone
      • If you didn't request this, please ignore this email
      
      Time: ${new Date().toLocaleString('en-IN')}
      Email: ${email}
      
      ==============================================
      Upasana Catering Admin Portal
      This is an automated email. Please do not reply.
    `;

    const msg = {
      to: email,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: '🔐 Password Reset OTP - Upasana Catering Admin',
      html: htmlTemplate,
      text: textTemplate
    };

    try {
      console.log(`📤 Sending password reset OTP via SendGrid to: ${email}`);
      
      const response = await sgMail.send(msg);
      
      console.log(`✅ Password reset OTP sent!`);
      console.log(`   Status: ${response[0].statusCode}`);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id']
      };
    } catch (error) {
      console.error('SendGrid OTP error:', error.message);
      throw error;
    }
  }
}

module.exports = new SendGridService();