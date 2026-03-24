import nodemailer from 'nodemailer';

// Lazy initialization - transporter created on first use
let transporter = null;

// Create transporter with proper env variables
function getTransporter() {
  if (!transporter) {
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

    console.log('📧 Email.js: Creating transporter with credentials:');
    console.log('   SMTP_HOST:', smtpHost);
    console.log('   SMTP_PORT:', smtpPort);
    console.log('   SMTP_USER:', smtpUser);
    console.log('   SMTP_PASS:', smtpPass ? smtpPass.substring(0, 5) + '***' + smtpPass.substring(smtpPass.length - 2) : 'NOT SET');

    if (!smtpUser || !smtpPass) {
      console.error('❌ SMTP credentials not configured! Check your .env file');
      console.error('   SMTP_USER:', smtpUser ? 'SET' : 'NOT SET');
      console.error('   SMTP_PASS:', smtpPass ? 'SET' : 'NOT SET');
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // TLS
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }
  return transporter;
}

// Generate 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Test SMTP connection
export async function testSMTPConnection() {
  try {
    console.log('🔍 Testing SMTP connection...');
    const transporter = getTransporter();
    
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    return { success: true, message: 'SMTP is working' };
  } catch (error) {
    console.error('❌ SMTP connection test failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    return { success: false, message: error.message };
  }
}

// Send OTP via email
export async function sendOTPEmail(email, otp, subject = 'OTP Verification', userName = 'User') {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'PatientPulse'} <${process.env.SMTP_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@patientpulse.com'}>`,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; }
            .email-wrapper { background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; padding: 40px 20px; text-align: center; position: relative; overflow: hidden; }
            .header::before { content: ''; position: absolute; top: -50%; right: -50%; width: 300px; height: 300px; background-color: rgba(255,255,255,0.1); border-radius: 50%; }
            .header::after { content: ''; position: absolute; bottom: -30%; left: -30%; width: 250px; height: 250px; background-color: rgba(255,255,255,0.08); border-radius: 50%; }
            .header-content { position: relative; z-index: 1; }
            .icon { width: 60px; height: 60px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2px; font-weight: 500; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 16px; color: #333; margin-bottom: 16px; }
            .greeting strong { color: #0066cc; }
            .description { font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.8; }
            .code-box { border: 2px solid #0066cc; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; background-color: #f0f7ff; }
            .code-label { font-size: 11px; letter-spacing: 2px; color: #0066cc; font-weight: 600; margin-bottom: 12px; }
            .code { font-size: 48px; letter-spacing: 8px; color: #0066cc; font-weight: 700; font-family: 'Courier New', monospace; margin: 0; }
            .code-warning { font-size: 12px; color: #666; margin-top: 12px; }
            .expiry-box { background-color: #fffbea; border-left: 4px solid #ffc107; padding: 16px; margin: 16px 0; border-radius: 4px; }
            .expiry-box p { font-size: 14px; color: #8b6f00; margin: 0; font-weight: 500; }
            .footer { background-color: #f9f9f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
            .footer p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="header-content">
                  <div class="icon">✓</div>
                  <h1>PatientPulse</h1>
                  <p>EMAIL VERIFICATION</p>
                </div>
              </div>
              <div class="content">
                <p class=\"greeting\">Hello <strong>${userName}</strong>,</p>
                <p class="description">Thank you for joining PatientPulse! To verify your email address and secure your account, please use the verification code below.</p>
                <div class="code-box">
                  <div class="code-label">YOUR VERIFICATION CODE</div>
                  <p class="code">${otp}</p>
                  <p class="code-warning">Never share this code with anyone</p>
                </div>
                <div class="expiry-box">
                  <p>⏱️ Code Expires In: <strong>10 Minutes</strong></p>
                </div>
                <p class="description">Enter this code in the PatientPulse app to complete your email verification and activate your account. For your security, this code will expire in 10 minutes.</p>
              </div>
              <div class="footer">
                <p>If you didn't request this email, please ignore it.</p>
                <p>© 2026 PatientPulse. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log(`📧 Preparing to send OTP email to: ${email}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${mailOptions.from}`);
    console.log(`   OTP Code: ${otp}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent successfully to', email, 'Message ID:', info.messageId);
    return { success: true, message: 'OTP sent to email', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:');
    console.error('   Error Code:', error.code);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
    
    // Log specific SMTP errors
    if (error.code === 'EAUTH') {
      console.error('   ⚠️  SMTP Authentication Failed - Check SMTP credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️  SMTP Connection Refused - Check SMTP host and port');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⚠️  SMTP Connection Timeout');
    }
    
    return { success: false, message: 'Failed to send OTP email', error: error.message };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email, resetLink, otp, userName = 'User') {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'PatientPulse'} <${process.env.SMTP_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@patientpulse.com'}>`,
      to: email,
      subject: 'Password Reset - PatientPulse',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; }
            .email-wrapper { background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; padding: 40px 20px; text-align: center; position: relative; overflow: hidden; }
            .header::before { content: ''; position: absolute; top: -50%; right: -50%; width: 300px; height: 300px; background-color: rgba(255,255,255,0.1); border-radius: 50%; }
            .header::after { content: ''; position: absolute; bottom: -30%; left: -30%; width: 250px; height: 250px; background-color: rgba(255,255,255,0.08); border-radius: 50%; }
            .header-content { position: relative; z-index: 1; }
            .icon { width: 60px; height: 60px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2px; font-weight: 500; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 16px; color: #333; margin-bottom: 16px; }
            .greeting strong { color: #0066cc; }
            .description { font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.8; }
            .code-box { border: 2px solid #0066cc; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; background-color: #f0f7ff; }
            .code-label { font-size: 11px; letter-spacing: 2px; color: #0066cc; font-weight: 600; margin-bottom: 12px; }
            .code { font-size: 48px; letter-spacing: 8px; color: #0066cc; font-weight: 700; font-family: 'Courier New', monospace; margin: 0; }
            .code-warning { font-size: 12px; color: #666; margin-top: 12px; }
            .expiry-box { background-color: #fffbea; border-left: 4px solid #ffc107; padding: 16px; margin: 16px 0; border-radius: 4px; }
            .expiry-box p { font-size: 14px; color: #8b6f00; margin: 0; font-weight: 500; }
            .warning-box { background-color: #ffe6e6; border-left: 4px solid #dc3545; padding: 16px; margin: 16px 0; border-radius: 4px; }
            .warning-box p { font-size: 14px; color: #721c24; margin: 0; }
            .footer { background-color: #f9f9f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
            .footer p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="header-content">
                  <div class="icon">🔑</div>
                  <h1>PatientPulse</h1>
                  <p>PASSWORD RESET CODE</p>
                </div>
              </div>
              <div class="content">
                <p class=\"greeting\">Hello <strong>${userName}</strong>,</p>
                <p class="description">We received a request to reset your password. Use the verification code below to create a new password and secure your account.</p>
                <div class="code-box">
                  <div class="code-label">YOUR PASSWORD RESET CODE</div>
                  <p class="code">${otp}</p>
                  <p class="code-warning">Never share this code with anyone</p>
                </div>
                <div class="expiry-box">
                  <p>⏱️ Code Expires In: <strong>5 Minutes</strong></p>
                </div>
                <p class="description">Enter this code in the PatientPulse app to reset your password. For your security, this code will expire in 5 minutes.</p>
                <div class="warning-box">
                  <p>Did not request this? Your account is secure. If this wasn't you, please ignore this email or contact support immediately.</p>
                </div>
              </div>
              <div class="footer">
                <p>If you didn't request this email, please ignore it.</p>
                <p>© 2026 PatientPulse. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to', email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
}

// Send Employee Onboarding Email
export async function sendEmployeeOnboardingEmail(email, firstName = 'Employee', tempPassword) {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'PatientPulse'} <${process.env.SMTP_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@patientpulse.com'}>`,
      to: email,
      subject: 'Welcome to PatientPulse - Your Account is Ready',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to PatientPulse</title>
          <style>
            * { margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; }
            .email-wrapper { background-color: white; }
            .header { background: linear-gradient(135deg, #0066cc 0%, #004fa3 100%); padding: 40px 30px; text-align: center; color: white; }
            .header-content { margin: 0 auto; }
            .icon { font-size: 48px; margin-bottom: 16px; }
            .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .header p { margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2px; font-weight: 500; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 16px; color: #333; margin-bottom: 16px; }
            .greeting strong { color: #0066cc; }
            .description { font-size: 14px; color: #666; margin-bottom: 24px; line-height: 1.8; }
            .credentials-box { background-color: #f0f7ff; border: 2px solid #0066cc; border-radius: 8px; padding: 24px; margin: 24px 0; }
            .credential-field { margin-bottom: 16px; }
            .credential-label { font-size: 11px; letter-spacing: 2px; color: #0066cc; font-weight: 600; margin-bottom: 6px; }
            .credential-value { background-color: white; border: 1px solid #ddd; padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all; }
            .instructions-box { background-color: #fffbea; border-left: 4px solid #ffc107; padding: 16px; margin: 16px 0; border-radius: 4px; }
            .instructions-box p { font-size: 14px; color: #8b6f00; margin: 8px 0; line-height: 1.6; }
            .instructions-box ol { margin-left: 20px; font-size: 14px; color: #8b6f00; }
            .instructions-box li { margin: 8px 0; }
            .next-steps { background-color: #e6f2ff; border-left: 4px solid #0066cc; padding: 16px; margin: 16px 0; border-radius: 4px; }
            .next-steps p { font-size: 14px; color: #0033a0; margin: 6px 0; font-weight: 500; }
            .footer { background-color: #f9f9f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
            .footer p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="header-content">
                  <div class="icon">👋</div>
                  <h1>PatientPulse</h1>
                  <p>WELCOME TO OUR TEAM</p>
                </div>
              </div>
              <div class="content">
                <p class="greeting">Welcome, <strong>${firstName}</strong>!</p>
                <p class="description">Your employee account has been created and is ready to use. Below are your login credentials. Please keep these safe and change your password on your first login.</p>
                
                <div class="credentials-box">
                  <div class="credential-field">
                    <div class="credential-label">📧 EMAIL ADDRESS</div>
                    <div class="credential-value">${email}</div>
                  </div>
                  <div class="credential-field">
                    <div class="credential-label">🔐 TEMPORARY PASSWORD</div>
                    <div class="credential-value">${tempPassword}</div>
                  </div>
                </div>

                <div class="instructions-box">
                  <p><strong>📋 How to Get Started:</strong></p>
                  <ol>
                    <li>Open the PatientPulse mobile app or web browser</li>
                    <li>Select "Employee" as your role</li>
                    <li>Enter your email and temporary password</li>
                    <li>You'll be logged in to your employee dashboard</li>
                    <li>Update your password in Settings for security</li>
                  </ol>
                </div>

                <div class="next-steps">
                  <p>✅ Your account is active and ready to use</p>
                  <p>🔒 Please change your temporary password on first login</p>
                  <p>📞 Contact your administrator if you have any questions</p>
                </div>

                <p class="description">If you did not request this account or have any issues logging in, please contact your administrator immediately.</p>
              </div>
              <div class="footer">
                <p>This is an automated message from PatientPulse</p>
                <p>© 2026 PatientPulse. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Employee onboarding email sent to', email);
    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    console.error('❌ Error sending onboarding email:', error.message);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
}
