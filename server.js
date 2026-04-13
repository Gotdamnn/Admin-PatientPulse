import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { networkInterfaces } from 'os';
import { Pool } from 'pg';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables with explicit path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');
if (existsSync(envPath)) {
  console.log('📂 Loading .env from:', envPath);
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Failed to load .env file:', result.error);
  } else {
    console.log('✅ .env file loaded successfully');
  }
} else {
  console.log('ℹ️ .env file not found, using environment variables from host');
}

// Normalize JWT secret sources once so auth routes have a consistent key.
const normalizedJwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY || process.env.JWT_KEY;
if (!normalizedJwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing JWT secret. Set JWT_SECRET (or SECRET_KEY/JWT_KEY) in environment variables.');
  }

  process.env.JWT_SECRET = 'dev-insecure-jwt-secret-change-me-before-production';
  console.warn('⚠️ JWT secret not set. Using temporary development secret. Configure JWT_SECRET in .env.');
} else {
  process.env.JWT_SECRET = normalizedJwtSecret;
}

// Verify env variables are loaded
console.log('\n📋 Env Variables Check:');
console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
console.log('   SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
console.log('   SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('   DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const publicPath = resolve(__dirname, 'public');
const viewsPath = resolve(__dirname, 'views');

// Database connection pool
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'https:']
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('combined'));

// CORS Configuration - Allow development and production origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, etc)
    if (!origin) return callback(null, true);

    // Allow local Flutter/web dev hosts on any port.
    // This keeps local web/mobile testing working against Azure APIs.
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Production: Check against CORS_ORIGIN list
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.static(publicPath));

// Favicon route to avoid noisy 404 logs.
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============= Import Routes =============
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import readingsRoutes from './routes/readings.js';
import employeeRoutes from './routes/employees.js';
import departmentRoutes from './routes/departments.js';
import feedbackRoutes from './routes/feedback.js';
import employeeReportsRoutes from './routes/employee-reports.js';
import passwordRoutes from './routes/password.js';

// ============= Mount Routes =============
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/password', passwordRoutes);

// ===== Core Admin APIs =====
app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
              (SELECT body_temperature FROM patient_vitals WHERE patient_id = p.id AND body_temperature IS NOT NULL ORDER BY recorded_at DESC LIMIT 1) AS latest_temperature,
              (SELECT recorded_at FROM patient_vitals WHERE patient_id = p.id AND body_temperature IS NOT NULL ORDER BY recorded_at DESC LIMIT 1) AS temperature_recorded_at
       FROM patients p
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Patients API error:', err.message);
    res.json([]);
  }
});

app.get('/api/devices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM devices ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Devices API error:', err.message);
    res.json([]);
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.employee_id,
        e.first_name,
        e.middle_name,
        e.last_name,
        e.email,
        e.phone_number,
        e.job_title,
        e.department_id,
        e.hire_date,
        e.salary,
        e.status,
        e.created_at,
        e.updated_at,
        e.gender,
        e.date_of_birth,
        e.address,
        e.employment_type,
        e.employment_status,
        e.employee_number,
        d.department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      ORDER BY e.first_name, e.last_name
    `);
    res.json({ success: true, employees: result.rows });
  } catch (err) {
    console.error('Employees API error:', err.message);
    res.json({ success: true, employees: [] });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.department_id,
        d.department_name,
        d.description,
        d.status,
        d.budget_annual,
        d.location_building,
        d.parent_department_id,
        d.department_head_id,
        COUNT(e.employee_id) AS employee_count,
        head.first_name AS head_first_name,
        head.last_name AS head_last_name
      FROM departments d
      LEFT JOIN employees e ON d.department_id = e.department_id
      LEFT JOIN employees head ON d.department_head_id = head.employee_id
      GROUP BY d.department_id, head.first_name, head.last_name
      ORDER BY d.department_name
    `);
    res.json({ success: true, departments: result.rows });
  } catch (err) {
    console.error('Departments API error:', err.message);
    res.json({ success: true, departments: [] });
  }
});

// ===== Dashboard Data APIs =====
app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.name AS patient_name
      FROM alerts a
      LEFT JOIN patients p ON a.patient_id = p.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Alerts API error:', err.message);
    res.json([]);
  }
});

app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const [patientsResult, employeesResult, departmentsResult, devicesResult, alertsResult] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active
        FROM patients
      `),
      pool.query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN employment_status = 'Active' THEN 1 ELSE 0 END) AS active
        FROM employees
      `),
      pool.query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active
        FROM departments
      `),
      pool.query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) AS online
        FROM devices
      `),
      pool.query(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN severity = 'critical' AND status = 'active' THEN 1 ELSE 0 END) AS critical
        FROM alerts
      `)
    ]);

    const patientsData = patientsResult.rows[0] || {};
    const employeesData = employeesResult.rows[0] || {};
    const departmentsData = departmentsResult.rows[0] || {};
    const devicesData = devicesResult.rows[0] || {};
    const alertsData = alertsResult.rows[0] || {};

    res.json({
      patients: {
        total: parseInt(patientsData.total, 10) || 0,
        active: parseInt(patientsData.active, 10) || 0
      },
      employees: {
        total: parseInt(employeesData.total, 10) || 0,
        active: parseInt(employeesData.active, 10) || 0
      },
      departments: {
        total: parseInt(departmentsData.total, 10) || 0,
        active: parseInt(departmentsData.active, 10) || 0
      },
      devices: {
        total: parseInt(devicesData.total, 10) || 0,
        online: parseInt(devicesData.online, 10) || 0
      },
      alerts: {
        total: parseInt(alertsData.total, 10) || 0,
        critical: parseInt(alertsData.critical, 10) || 0
      }
    });
  } catch (err) {
    console.error('Dashboard summary API error:', err.message);
    res.json({
      patients: { total: 0, active: 0 },
      employees: { total: 0, active: 0 },
      departments: { total: 0, active: 0 },
      devices: { total: 0, online: 0 },
      alerts: { total: 0, critical: 0 }
    });
  }
});

app.get('/api/dashboard/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await pool.query(
      `SELECT id, admin_name, action, table_name, target_id,
              COALESCE(created_at, timestamp) AS created_at
       FROM audit_logs
       ORDER BY COALESCE(created_at, timestamp) DESC
       LIMIT $1`,
      [limit]
    );

    const activities = result.rows.map((log) => ({
      id: log.id,
      type: (log.action || 'activity').toLowerCase(),
      title: log.action || 'Activity',
      description: `${log.action || 'Action'} on ${log.table_name || 'system'}`,
      user: log.admin_name,
      timestamp: log.created_at
    }));

    res.json(activities);
  } catch (err) {
    console.error('Dashboard activity API error:', err.message);
    res.json([]);
  }
});

app.get('/api/audit-logs', async (req, res) => {
  const { adminName, action, tableName, dateFrom, dateTo, limit, after } = req.query;
  try {
    let query = `
      SELECT *, COALESCE(created_at, timestamp) AS event_time
      FROM audit_logs
      WHERE 1 = 1
    `;
    const params = [];

    if (adminName) {
      params.push(`%${adminName}%`);
      query += ` AND admin_name ILIKE $${params.length}`;
    }

    if (action) {
      const actions = String(action)
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
      if (actions.length > 0) {
        params.push(actions);
        query += ` AND action = ANY($${params.length})`;
      }
    }

    if (tableName) {
      params.push(tableName);
      query += ` AND table_name = $${params.length}`;
    }

    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND COALESCE(created_at, timestamp) >= $${params.length}`;
    }

    if (dateTo) {
      params.push(`${dateTo} 23:59:59`);
      query += ` AND COALESCE(created_at, timestamp) <= $${params.length}`;
    }

    if (after) {
      params.push(after);
      query += ` AND COALESCE(created_at, timestamp) > $${params.length}`;
    }

    const rowLimit = Math.min(parseInt(limit, 10) || 100, 1000);
    params.push(rowLimit);
    query += ` ORDER BY COALESCE(created_at, timestamp) DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    const normalized = result.rows.map((row) => ({
      ...row,
      created_at: row.created_at || row.timestamp || row.event_time,
      timestamp: row.created_at || row.timestamp || row.event_time
    }));
    res.json(normalized);
  } catch (err) {
    console.error('Audit logs API error:', err.message);
    res.json([]);
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Notifications API error:', err.message);
    res.json([]);
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const id = req.params.id;
    if (String(id).startsWith('auth_')) {
      return res.json({ success: true, skipped: true });
    }
    const result = await pool.query(
      'UPDATE notifications SET read = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }
    return res.status(404).json({ error: 'Notification not found' });
  } catch (err) {
    console.error('Mark notification read API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM notifications RETURNING id');
    res.json({ success: true, count: result.rowCount || 0 });
  } catch (err) {
    console.error('Clear notifications API error:', err.message);
    res.json({ success: true, count: 0 });
  }
});

// ===== Employee Reports APIs (admin format) =====
app.get('/api/employee-reports', async (req, res) => {
  try {
    const { search, status, severity, reportType, department, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = 'SELECT * FROM employee_reports WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM employee_reports WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (employee_name ILIKE $${params.length + 1} OR department_name ILIKE $${params.length + 1} OR title ILIKE $${params.length + 1})`;
      countQuery += ` AND (employee_name ILIKE $${params.length + 1} OR department_name ILIKE $${params.length + 1} OR title ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      countQuery += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (severity) {
      query += ` AND severity = $${params.length + 1}`;
      countQuery += ` AND severity = $${params.length + 1}`;
      params.push(severity);
    }

    if (reportType) {
      query += ` AND report_type = $${params.length + 1}`;
      countQuery += ` AND report_type = $${params.length + 1}`;
      params.push(reportType);
    }

    if (department) {
      query += ` AND department_id = $${params.length + 1}`;
      countQuery += ` AND department_id = $${params.length + 1}`;
      params.push(department);
    }

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.count, 10) || 0;

    query += ` ORDER BY report_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const result = await pool.query(query, [...params, parseInt(limit, 10), offset]);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.max(1, Math.ceil(total / parseInt(limit, 10)))
      }
    });
  } catch (err) {
    console.error('Employee reports API error:', err.message);
    res.json({ success: true, data: [], pagination: { total: 0, page: 1, limit: 10, pages: 1 } });
  }
});

app.get('/api/employee-reports/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employee_reports WHERE report_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/employee-reports', async (req, res) => {
  try {
    const rawEmployeeId = req.body.employee_id ?? req.body.employeeId;
    const rawDepartmentId = req.body.department_id ?? req.body.departmentId;
    const employeeId = rawEmployeeId === '' || rawEmployeeId === undefined || rawEmployeeId === null
      ? null
      : Number(rawEmployeeId);
    const departmentId = rawDepartmentId === '' || rawDepartmentId === undefined || rawDepartmentId === null
      ? null
      : Number(rawDepartmentId);

    if ((employeeId !== null && Number.isNaN(employeeId)) || (departmentId !== null && Number.isNaN(departmentId))) {
      return res.status(400).json({
        success: false,
        error: 'employeeId/departmentId must be numeric when provided',
      });
    }

    const employeeName = req.body.employee_name ?? req.body.employeeName ?? (employeeId ? `Employee ${employeeId}` : null);
    const departmentName = req.body.department_name ?? req.body.departmentName ?? null;
    const reportType = req.body.report_type ?? req.body.reportType;
    const category = req.body.category ?? reportType ?? 'Other';
    const title = req.body.title;
    const description = req.body.description;
    const reportedBy = req.body.reported_by ?? req.body.reportedBy ?? req.body.reported_by_name ?? 'System';
    const severity = req.body.severity ?? 'Medium';
    const priority = req.body.priority ?? 'Normal';

    if (!employeeName || !reportType || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeName, reportType, title, description',
      });
    }

    const result = await pool.query(
      `INSERT INTO employee_reports
      (employee_id, employee_name, department_id, department_name, report_type, category, title, description, reported_by, severity, priority, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Open')
      RETURNING *`,
      [employeeId, employeeName, departmentId, departmentName, reportType, category, title, description, reportedBy, severity, priority]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/employee-reports/:id/resolve', async (req, res) => {
  try {
    const { resolution_notes, action_taken } = req.body;
    const result = await pool.query(
      `UPDATE employee_reports
       SET status = 'Resolved', resolution_notes = $1, action_taken = $2, resolution_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE report_id = $3
       RETURNING *`,
      [resolution_notes || null, action_taken || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/employee-reports/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM employee_reports WHERE report_id = $1 RETURNING report_id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    return res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Feedback APIs (admin format) =====
app.get('/api/feedback', async (req, res) => {
  try {
    const { search, status, type, rating } = req.query;
    let query = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (subject ILIKE $${params.length + 1} OR message ILIKE $${params.length + 1} OR user_email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    if (type) {
      query += ` AND feedback_type = $${params.length + 1}`;
      params.push(type);
    }
    if (rating) {
      query += ` AND (rating = $${params.length + 1} OR app_rating = $${params.length + 1})`;
      params.push(parseInt(rating, 10));
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, feedback: result.rows });
  } catch (err) {
    console.error('Feedback API error:', err.message);
    res.json({ success: true, feedback: [] });
  }
});

app.get('/api/feedback/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feedback WHERE id = $1 LIMIT 1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    return res.json({ success: true, feedback: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { feedback_type, subject, message, rating, app_rating, user_email, status, priority } = req.body;
    const result = await pool.query(
      `INSERT INTO feedback (feedback_type, subject, message, rating, app_rating, user_email, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'Open'), COALESCE($8, 'Normal'))
       RETURNING *`,
      [feedback_type, subject, message, rating || null, app_rating || rating || null, user_email || null, status || null, priority || null]
    );
    res.status(201).json({ success: true, feedback: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/feedback/:id', async (req, res) => {
  try {
    const { status, priority, response_notes } = req.body;
    const result = await pool.query(
      `UPDATE feedback
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           response_notes = COALESCE($3, response_notes),
           response_date = CASE WHEN $3 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE response_date END,
           responded_by = CASE WHEN $3 IS NOT NULL THEN 'Admin' ELSE responded_by END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status || null, priority || null, response_notes || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    return res.json({ success: true, feedback: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM feedback WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }
    return res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============= Web View Routes =============
app.get('/', (req, res) => res.redirect('/login'));
app.get('/dashboard', (req, res) => res.render('dashboard', { title: 'Dashboard', activePage: 'dashboard' }));
app.get('/login', (req, res) => res.render('login', { title: 'Login' }));
app.get('/patients', (req, res) => res.render('patient', { title: 'Patients', activePage: 'patients' }));
app.get('/devices', (req, res) => res.render('devices', { title: 'Devices', activePage: 'devices' }));
app.get('/employees', (req, res) => res.render('employees', { title: 'Employees', activePage: 'employees' }));
app.get('/employee-reports', (req, res) => res.render('employee-reports', { title: 'Employee Reports', activePage: 'employee-reports' }));
app.get('/feedback', (req, res) => res.render('feedback', { title: 'User Feedback', activePage: 'feedback' }));
app.get('/departments', (req, res) => res.render('departments', { title: 'Departments', activePage: 'departments' }));
app.get('/settings', (req, res) => res.render('settings', { title: 'Settings', activePage: 'settings' }));
app.get('/audit-logs', (req, res) => res.render('audit-logs', { title: 'Audit Logs', activePage: 'audit-logs' }));
app.get('/staff-management', (req, res) => res.render('rbac-management', { title: 'Staff Management', activePage: 'staff-management' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Database connection test
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize database schema
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database schema...');

    // Add email_verified column to patients table if it doesn't exist
    await pool.query(`
      ALTER TABLE patients
      ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
    `);
    console.log('✅ email_verified column checked/added to patients table');

    // Create email_verification_tokens table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(email, token)
      );
    `);
    console.log('✅ email_verification_tokens table created/verified');

    // Create password_reset_tokens table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(email, token)
      );
    `);
    console.log('✅ password_reset_tokens table created/verified');

    // Make user_id nullable if it exists (for email-based password reset)
    try {
      await pool.query(`
        ALTER TABLE password_reset_tokens
        ALTER COLUMN user_id DROP NOT NULL;
      `);
      console.log('✅ user_id column made nullable');
    } catch (err) {
      // Column might not exist or already nullable, that's fine
      console.log('ℹ️ user_id column check skipped (may not exist in this version)');
    }

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
}

function getLanIpv4Addresses() {
  const nets = networkInterfaces();
  const ips = [];

  for (const key of Object.keys(nets)) {
    const netList = nets[key] || [];
    for (const net of netList) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }

  return ips;
}

// Start server
app.listen(PORT, async () => {
  // Initialize database on startup
  await initializeDatabase();
  const lanIps = getLanIpv4Addresses();
  const apiUrls = [`http://localhost:${PORT}/api`, ...lanIps.map((ip) => `http://${ip}:${PORT}/api`)];
  
  console.log(`
╔════════════════════════════════════════╗
║     PatientPulse Backend Server        ║
╠════════════════════════════════════════╣
║ 🚀 Server running on port ${PORT}         
║ 🌍 Environment: ${process.env.NODE_ENV}
║ 📦 Database: ${process.env.DB_NAME}
╚════════════════════════════════════════╝
  `);

  console.log('🔗 API Base URLs you can use:');
  for (const url of apiUrls) {
    console.log(`   - ${url}`);
  }
});
