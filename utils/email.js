


import 'dotenv/config';
import nodemailer from 'nodemailer';
import { emailVerification, passwordReset } from '../config/email-templates.js';

// Generate 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Utility to test SMTP connection
export async function testSMTPConnection() {
  try {
    await transporter.verify();
    return { success: true, message: 'SMTP connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Send OTP Email
export async function sendOTPEmail(email, otp, subject = 'Your OTP Code', name = '') {
  const template = emailVerification(name || 'User', otp);
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };
  return transporter.sendMail(mailOptions);
}


// Send Password Reset Email
export async function sendPasswordResetEmail(email, resetLink, token, name = '') {
  // If a resetLink is provided, add it to the template, else just use the code
  const template = passwordReset(name || 'User', token);
  let html = template.html;
  if (resetLink) {
    // Insert a reset link button above the code box
    html = html.replace(
      '<!-- Reset Code Box -->',
      `<div style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#0078D4 0%,#0066CC 100%);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;box-shadow:0 4px 12px rgba(0,120,212,0.3);">Reset Password</a>
      </div>\n<!-- Reset Code Box -->`
    );
  }
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: template.subject,
    html,
    text: template.text
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}








import 'dotenv/config';








