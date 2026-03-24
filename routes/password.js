import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../server.js';
import { generateOTP, sendOTPEmail, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// POST /api/password/forgot - Request password reset with OTP
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email exists
    const userResult = await pool.query(
      'SELECT id, email, name FROM patients WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not (security)
      return res.status(200).json({
        success: true,
        message: 'If the email exists, OTP has been sent'
      });
    }

    const user = userResult.rows[0];
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes from now

    // Store OTP in password_reset_tokens table  
    try {
      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at)
         VALUES (NULL, $1, $2, $3, NOW())`,
        [email, otp, expiryTime]
      );
      console.log(`💾 Password reset OTP stored for ${email}: ${otp}`);
    } catch (dbError) {
      console.error('❌ Password reset database error:', dbError.message);
      throw dbError;
    }

    // 🚀 SEND EMAIL IN BACKGROUND (Non-blocking) - Don't await!
    console.log(`📧 Sending password reset OTP to ${email} in background...`);
    (async () => {
      try {
        const emailResult = await sendPasswordResetEmail(
          email,
          null, // resetLink not needed for OTP-based reset
          otp,
          user.name // Pass the actual user name
        );
        
        if (emailResult.success) {
          console.log(`✅ Password reset OTP sent successfully to ${email}`);
        } else {
          console.error(`❌ Failed to send password reset OTP to ${email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Error sending password reset email in background:');
        console.error('   Error Code:', emailError.code);
        console.error('   Error Message:', emailError.message);
      }
    })(); // Execute immediately without awaiting

    // Return success immediately
    return res.json({
      success: true,
      message: 'If the email exists, OTP has been sent',
      note: 'OTP is valid for 10 minutes'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message
    });
  }
});

// POST /api/password/verify-otp - Verify OTP (password reset flow)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Check OTP - compare in SQL query (OTP must match exactly)
    const tokenResult = await pool.query(
      `SELECT id, token, expires_at FROM password_reset_tokens 
       WHERE email = $1 AND token = $2 AND used_at IS NULL AND expires_at > NOW()`,
      [email, otp]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP or OTP has expired. Please request a new one.'
      });
    }

    // OTP is valid
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Password verify-otp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

// POST /api/password/reset - Reset password with OTP
router.post('/reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find user
    const userResult = await pool.query(
      'SELECT id FROM patients WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email not found'
      });
    }

    const userId = userResult.rows[0].id;

    // Check OTP
    const tokenResult = await pool.query(
      `SELECT id, token, expires_at FROM password_reset_tokens 
       WHERE email = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [email]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'OTP expired or invalid. Please request a new one.'
      });
    }

    const tokenRecord = tokenResult.rows[0];
    const storedOtp = tokenRecord.token;

    // Verify OTP
    if (otp !== storedOtp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE patients SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    // Mark OTP as used
    await pool.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
      [tokenRecord.id]
    );

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

// POST /api/password/resend-otp - Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email exists
    const userResult = await pool.query(
      'SELECT id FROM patients WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, OTP has been sent'
      });
    }

    const userId = userResult.rows[0].id;
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60000);

    // Insert new OTP record
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, email, token, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, email, otp, expiryTime]
    );

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, 'Resend OTP - PatientPulse');

    return res.json({
      success: true,
      message: 'OTP resent to email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

export default router;
