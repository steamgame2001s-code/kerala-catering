// backend/routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email endpoint
router.get('/test-email', async (req, res) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself first for testing
      subject: 'Test Email from Upasana Catering',
      text: 'This is a test email from your catering website backend.',
      html: '<h1>Test Email Successful!</h1><p>Your catering website email system is working.</p>'
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
    
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
});

// Send inquiry email endpoint
router.post('/send-inquiry-email', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      location, 
      email, 
      event, 
      menu, 
      comments,
      inquiryId 
    } = req.body;
    
    if (!name || !phone || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const formattedDate = new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const mailOptions = {
      from: `"Upasana Catering Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Sends to your business email
      replyTo: email || process.env.EMAIL_USER, // Customer email for reply
      subject: `🍽️ New Menu Inquiry - ${name} - ${inquiryId}`,
      html: `
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
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px; }
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
                  ${comments}
                </div>
              </div>
              ` : ''}
              
              <div class="section">
                <div class="section-title">📊 Inquiry Summary</div>
                <div class="field"><span class="field-label">Inquiry ID:</span> <span class="field-value">${inquiryId}</span></div>
                <div class="field"><span class="field-label">Date:</span> <span class="field-value">${formattedDate}</span></div>
                <div class="field"><span class="field-label">Time:</span> <span class="field-value">${formattedTime}</span></div>
                <div class="field"><span class="field-label">Source:</span> <span class="field-value">Website Menu Page</span></div>
              </div>
              
              <div class="footer">
                <p><strong>Action Required:</strong> Please contact customer within 24 hours</p>
                <p><em>WhatsApp: ${phone} | Email: ${email || 'Use reply-to address'}</em></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        NEW MENU INQUIRY - UPASANA CATERING
        ====================================
        
        Customer Information:
        --------------------
        Name: ${name}
        Phone: ${phone}
        Location: ${location}
        Email: ${email || 'Not provided'}
        
        Event Details:
        --------------
        Event Type: ${event || 'Not specified'}
        Preferred Menu: ${menu || 'Not selected'}
        
        ${comments ? `Special Requests:\n${comments}\n\n` : ''}
        
        Inquiry Summary:
        ---------------
        Inquiry ID: ${inquiryId}
        Date: ${formattedDate}
        Time: ${formattedTime}
        Source: Website Menu Page
        
        ====================================
        ACTION REQUIRED: Contact within 24 hours
        WhatsApp: ${phone}
        ${email ? `Email: ${email}` : ''}
      `
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`✅ Inquiry email sent for ID: ${inquiryId}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Inquiry email sent successfully',
      inquiryId: inquiryId
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send inquiry email',
      error: error.message 
    });
  }
});

module.exports = router;