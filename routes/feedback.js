import express from 'express';
import { pool } from '../server.js';

const router = express.Router();

const getJwtSecret = () => {
  return process.env.JWT_SECRET || process.env.SECRET_KEY || process.env.JWT_KEY || 'dev-insecure-jwt-secret-change-me-before-production';
};

// Middleware: Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    const decoded = await new Promise((resolve, reject) => {
      import('jsonwebtoken').then(({ default: jwt }) => {
        try {
          resolve(jwt.verify(token, getJwtSecret()));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// POST /api/feedback/add - Submit feedback (mobile app endpoint)
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { feedbackType, subject, message, rating } = req.body;
    const userId = req.userId.toString();

    // Validation
    if (!feedbackType || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type, subject, and message are required',
      });
    }

    console.log('📝 Submitting feedback:');
    console.log('   User ID:', userId);
    console.log('   Type:', feedbackType);
    console.log('   Subject:', subject);

    // Get user email from patients table
    let userEmail = '';
    try {
      const userResult = await pool.query(
        'SELECT email FROM patients WHERE id = $1',
        [userId]
      );
      if (userResult.rows.length > 0) {
        userEmail = userResult.rows[0].email;
      }
    } catch (emailError) {
      console.log('⚠️ Could not fetch user email:', emailError.message);
      userEmail = `user_${userId}@example.com`;
    }

    // Insert into feedback table
    const result = await pool.query(
      `INSERT INTO feedback (user_id, feedback_type, subject, message, rating, user_email, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id`,
      [userId, feedbackType, subject, message, rating || 0, userEmail]
    );

    console.log('✅ Feedback submitted successfully, ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error.message);
    console.error('Details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback: ' + error.message,
      error: error.message,
    });
  }
});

// POST /api/feedback - Submit feedback (alternate endpoint)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { feedbackType, subject, message, rating, userEmail } = req.body;
    const userId = req.userId.toString();

    // Validation
    if (!feedbackType || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type, subject, and message are required',
      });
    }

    console.log('📝 Submitting feedback via alternate endpoint:');
    console.log('   User ID:', userId);
    console.log('   Email:', userEmail);
    console.log('   Type:', feedbackType);

    // Insert into feedback table
    const result = await pool.query(
      `INSERT INTO feedback (user_id, feedback_type, subject, message, rating, user_email, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id`,
      [userId, feedbackType, subject, message, rating || 0, userEmail || '']
    );

    console.log('✅ Feedback submitted successfully, ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error.message);
    console.error('Details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback: ' + error.message,
      error: error.message,
    });
  }
});

// GET /api/feedback - Get user's feedback (kept for compatibility)
router.get('/', verifyToken, async (req, res) => {
  try {
    const patientId = req.userId;

    try {
      const result = await pool.query(
        `SELECT * FROM alerts 
         WHERE patient_id = $1
         ORDER BY created_at DESC`,
        [patientId]
      );

      res.json({
        success: true,
        count: result.rows.length,
        feedback: result.rows.map(item => ({
          id: item.id,
          type: item.type,
          message: item.message,
          timestamp: item.created_at,
        })),
      });
    } catch (innerError) {
      // Fallback if alerts table query fails
      res.json({
        success: true,
        count: 0,
        feedback: [],
      });
    }
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message,
    });
  }
});

// POST /api/employee-reports - Submit employee report
router.post('/employee-reports', verifyToken, async (req, res) => {
  try {
    const { employeeId, employeeName, departmentName, departmentId, reportType, category, title, description, severity } = req.body;
    const patientId = req.userId;

    // Validation
    if (!employeeId || !departmentName || !reportType || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const normalizedEmployeeName = employeeName || `Employee ${employeeId}`;
    const normalizedCategory = category || reportType || 'Other';
    const normalizedSeverity = severity || 'Medium';

    let reportId;
    try {
      // Newer schema (database/database.sql)
      const result = await pool.query(
        `INSERT INTO employee_reports 
         (employee_id, employee_name, department_id, department_name, report_type, category, title, description, severity, reported_by_id, report_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING report_id`,
        [employeeId, normalizedEmployeeName, departmentId || null, departmentName, reportType, normalizedCategory, title, description, normalizedSeverity, patientId]
      );
      reportId = result.rows[0].report_id;
    } catch (schemaErr) {
      // Legacy schema fallback (database/schema.sql)
      if (schemaErr.code !== '42703') {
        throw schemaErr;
      }

      const fallbackResult = await pool.query(
        `INSERT INTO employee_reports 
         (employee_id, department_name, report_type, title, description, severity, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [employeeId, departmentName, reportType, title, description, (normalizedSeverity || 'medium').toLowerCase(), patientId]
      );
      reportId = fallbackResult.rows[0].id;
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      id: reportId,
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message,
    });
  }
});

export default router;
