// In backend/server.js - UPDATE THE FORGOT PASSWORD ENDPOINT
app.post('/api/admin/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('\n🔐 === FORGOT PASSWORD REQUEST ===');
    console.log(`📧 Requested email: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const admin = await Admin.findOne({ email: email.toLowerCase().trim(), isActive: true });
    
    if (!admin) {
      console.log(`⚠️ Admin not found: ${email}`);
      // Return success for security
      return res.json({
        success: true,
        message: 'If an admin with this email exists, an OTP has been sent'
      });
    }
    
    console.log(`✅ Admin found: ${admin.email} (${admin.username})`);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    admin.resetPasswordOTP = otp;
    admin.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();
    
    console.log(`🔑 OTP Generated: ${otp}`);
    
    // Check if email service is available
    const emailAvailable = sendGridService.isEmailAvailable();
    
    if (!emailAvailable) {
      console.log('⚠️ Email service not available');
      
      // For development/testing, return OTP in response
      // In production, you should handle this differently
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      if (isDevelopment) {
        return res.json({
          success: true,
          message: 'OTP generated (Email service not configured)',
          otp: otp, // ONLY for development/testing
          email: email,
          note: 'Set SENDGRID_API_KEY in environment variables to enable email'
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Email service not configured',
          suggestion: 'Please contact administrator or check email configuration'
        });
      }
    }
    
    // Send immediate response
    res.json({
      success: true,
      message: 'OTP has been sent to your email',
      email: email
    });
    
    // Try to send email ASYNCHRONOUSLY
    setTimeout(async () => {
      try {
        await sendGridService.sendPasswordResetOTP(admin, otp);
        console.log(`✅ OTP email sent to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send OTP email:', emailError.message);
      }
    }, 100);
    
  } catch (error) {
    console.error('❌ FORGOT PASSWORD ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request'
    });
  }
});

// UPDATE THE EMAIL TEST ENDPOINT
app.get('/api/email/test', async (req, res) => {
  try {
    console.log('📧 Testing email configuration...');
    
    // Check if email service is available
    if (!sendGridService.isEmailAvailable()) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured',
        error: 'SENDGRID_API_KEY environment variable is not set',
        suggestion: 'Add SENDGRID_API_KEY to your Render.com environment variables'
      });
    }
    
    try {
      const result = await sendGridService.sendTestEmail();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully via SendGrid',
        provider: 'SendGrid',
        ...result
      });
      
    } catch (sendGridError) {
      console.error('SendGrid test failed:', sendGridError.message);
      
      return res.status(500).json({
        success: false,
        message: 'SendGrid test failed',
        error: sendGridError.message,
        suggestion: 'Check your SendGrid API key and verify sender email'
      });
    }
    
  } catch (error) {
    console.error('❌ Email test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// UPDATE THE INQUIRY EMAIL ENDPOINT
app.post('/api/email/send-inquiry', async (req, res) => {
  try {
    console.log('📧 Received inquiry request');
    
    const { 
      name, 
      phone, 
      location, 
      email, 
      event, 
      menu, 
      comments
    } = req.body;
    
    if (!name || !phone || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const inquiryId = `UP${Date.now().toString().slice(-8)}`;
    
    // Send immediate response
    res.json({
      success: true,
      message: 'Inquiry received successfully',
      inquiryId: inquiryId,
      note: 'You can contact us via WhatsApp for immediate response'
    });
    
    // Try to send email ASYNCHRONOUSLY if available
    if (sendGridService.isEmailAvailable()) {
      setTimeout(async () => {
        try {
          await sendGridService.sendInquiryEmail({
            name, phone, location, email, event, menu, comments
          });
          console.log(`✅ Inquiry sent via SendGrid: ${inquiryId}`);
        } catch (emailError) {
          console.error('Failed to send inquiry email:', emailError.message);
        }
      }, 100);
    } else {
      console.log('⚠️ Email service not available - inquiry saved but not emailed');
    }
    
    // Save to database ASYNCHRONOUSLY
    setTimeout(async () => {
      try {
        const inquiry = new Inquiry({
          inquiryId,
          name,
          phone,
          location,
          email,
          event,
          menu,
          comments,
          status: 'new',
          emailSent: sendGridService.isEmailAvailable()
        });
        await inquiry.save();
        console.log(`💾 Inquiry saved to database: ${inquiryId}`);
        
      } catch (dbError) {
        console.error('Database save error:', dbError.message);
      }
    }, 200);
    
  } catch (error) {
    console.error('❌ Inquiry processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process inquiry',
      error: error.message 
    });
  }
});