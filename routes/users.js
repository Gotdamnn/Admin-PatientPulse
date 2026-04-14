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

// GET /api/users/profile - Get current patient profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT id, email, name, age, gender, status, created_at, updated_at FROM patients WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        age: user.age,
        gender: user.gender,
        status: user.status,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

// PUT /api/users/profile - Update patient profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { fullName, age, gender, status } = req.body;

    // Check if patient exists
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1',
      [userId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Update patient profile
    const result = await pool.query(
      `UPDATE patients 
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           gender = COALESCE($3, gender),
           status = COALESCE($4, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, name, age, gender, status, created_at`,
      [fullName, age, gender, status, userId]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        age: user.age,
        gender: user.gender,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

// DELETE /api/users/:id - Delete a user (patient)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Only allow users to delete their own account or if they're an admin
    // For now, we'll allow deletion of own account
    if (parseInt(id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Can only delete your own account',
      });
    }

    // Check if patient exists
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1',
      [id]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Delete patient and related data will be cascaded
    await pool.query(
      'DELETE FROM patients WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Patient account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message,
    });
  }
});

export default router;
