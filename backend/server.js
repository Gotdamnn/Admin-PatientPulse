const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

// EJS view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, '../Admin/css')));
app.use('/js', express.static(path.join(__dirname, '../Admin/js')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres',  // Change to your PostgreSQL user
    host: 'localhost',
    database: 'appdevdb',  // Your existing database
    password: 'Carlzabala@123',  // Change to your PostgreSQL password
    port: 5432,
});

// Test database connection with timeout
const testConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
        console.log('   Server time:', result.rows[0]);
    } catch (err) {
        console.error('❌ DATABASE CONNECTION FAILED');
        console.error('   Error:', err.message);
        console.error('   Please check:');
        console.error('   - Is PostgreSQL running?');
        console.error('   - Is pgAdmin accessible?');
        console.error('   - Database credentials correct? (user: postgres, host: localhost, database: appdevdb)');
    }
};

// Test connection after a short delay
setTimeout(testConnection, 1000);

pool.on('error', (err) => {
    console.error('🔴 Pool Error:', err.message);
});

// ===== AUTHENTICATION =====
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const admin = result.rows[0];
            const validPassword = await bcrypt.compare(password, admin.password);
            if (validPassword) {
                res.json({ success: true, user: admin });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===== PATIENTS API =====
// Get all patients
app.get('/api/patients', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get patient by ID
app.get('/api/patients/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Patient not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new patient
app.post('/api/patients', async (req, res) => {
    const { name, status, body_temperature, last_visit, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO patients (name, status, body_temperature, last_visit, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, status, body_temperature, last_visit, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update patient
app.put('/api/patients/:id', async (req, res) => {
    const { name, status, body_temperature, last_visit, email } = req.body;
    try {
        const result = await pool.query(
            'UPDATE patients SET name = $1, status = $2, body_temperature = $3, last_visit = $4, email = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [name, status, body_temperature, last_visit, email, req.params.id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Patient not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete patient
app.delete('/api/patients/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Patient deleted' });
        } else {
            res.status(404).json({ error: 'Patient not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== DEVICES API =====
// Get all devices
app.get('/api/devices', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM devices ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get device by ID
app.get('/api/devices/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM devices WHERE id = $1', [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Device not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new device
app.post('/api/devices', async (req, res) => {
    const { name, device_id, board_type, location, status, signal_strength } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO devices (name, device_id, board_type, location, status, signal_strength, last_data_time) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
            [name, device_id, board_type, location, status, signal_strength]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update device
app.put('/api/devices/:id', async (req, res) => {
    const { name, device_id, board_type, location, status, signal_strength } = req.body;
    try {
        const result = await pool.query(
            'UPDATE devices SET name = $1, device_id = $2, board_type = $3, location = $4, status = $5, signal_strength = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
            [name, device_id, board_type, location, status, signal_strength, req.params.id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Device not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete device
app.delete('/api/devices/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM devices WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Device deleted' });
        } else {
            res.status(404).json({ error: 'Device not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== DEPARTMENTS API =====
// Get all departments with employee count and head info
app.get('/api/departments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, 
                   COUNT(e.employee_id) as employee_count,
                   head.first_name as head_first_name,
                   head.last_name as head_last_name,
                   parent.department_name as parent_department_name
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            LEFT JOIN employees head ON d.department_head_id = head.employee_id
            LEFT JOIN departments parent ON d.parent_department_id = parent.department_id
            GROUP BY d.department_id, head.first_name, head.last_name, parent.department_name
            ORDER BY d.department_name
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get department by ID with full details
app.get('/api/departments/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, 
                   COUNT(e.employee_id) as employee_count,
                   head.first_name as head_first_name,
                   head.last_name as head_last_name,
                   head.email as head_email,
                   parent.department_name as parent_department_name
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            LEFT JOIN employees head ON d.department_head_id = head.employee_id
            LEFT JOIN departments parent ON d.parent_department_id = parent.department_id
            WHERE d.department_id = $1
            GROUP BY d.department_id, head.first_name, head.last_name, head.email, parent.department_name
        `, [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Department not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get employees by department ID
app.get('/api/departments/:id/employees', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT employee_id, employee_number, first_name, last_name, job_title, email, employment_status
            FROM employees
            WHERE department_id = $1
            ORDER BY last_name, first_name
        `, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new department
app.post('/api/departments', async (req, res) => {
    const { 
        department_name, description, department_head_id, status,
        location_building, location_floor, location_room,
        contact_email, contact_phone,
        budget_annual, budget_spent,
        parent_department_id,
        operating_hours_start, operating_hours_end, operating_days,
        cost_center_code
    } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO departments (
                department_name, description, department_head_id, status,
                location_building, location_floor, location_room,
                contact_email, contact_phone,
                budget_annual, budget_spent,
                parent_department_id,
                operating_hours_start, operating_hours_end, operating_days,
                cost_center_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [department_name, description, department_head_id || null, status || 'Active',
             location_building, location_floor, location_room,
             contact_email, contact_phone,
             budget_annual || 0, budget_spent || 0,
             parent_department_id || null,
             operating_hours_start || null, operating_hours_end || null, operating_days || 'Mon-Fri',
             cost_center_code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'A department with this name already exists' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// Update department
app.put('/api/departments/:id', async (req, res) => {
    const { 
        department_name, description, department_head_id, status,
        location_building, location_floor, location_room,
        contact_email, contact_phone,
        budget_annual, budget_spent,
        parent_department_id,
        operating_hours_start, operating_hours_end, operating_days,
        cost_center_code
    } = req.body;
    try {
        const result = await pool.query(
            `UPDATE departments SET 
                department_name = $1, description = $2, department_head_id = $3, status = $4,
                location_building = $5, location_floor = $6, location_room = $7,
                contact_email = $8, contact_phone = $9,
                budget_annual = $10, budget_spent = $11,
                parent_department_id = $12,
                operating_hours_start = $13, operating_hours_end = $14, operating_days = $15,
                cost_center_code = $16,
                updated_at = CURRENT_TIMESTAMP
            WHERE department_id = $17 RETURNING *`,
            [department_name, description, department_head_id || null, status || 'Active',
             location_building, location_floor, location_room,
             contact_email, contact_phone,
             budget_annual || 0, budget_spent || 0,
             parent_department_id || null,
             operating_hours_start || null, operating_hours_end || null, operating_days || 'Mon-Fri',
             cost_center_code, req.params.id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Department not found' });
        }
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'A department with this name already exists' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// Delete department
app.delete('/api/departments/:id', async (req, res) => {
    try {
        // Check if department has employees
        const checkResult = await pool.query(
            'SELECT COUNT(*) as count FROM employees WHERE department_id = $1',
            [req.params.id]
        );
        if (parseInt(checkResult.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete department with assigned employees. Please reassign employees first.' 
            });
        }
        
        // Check if department has sub-departments
        const subDeptCheck = await pool.query(
            'SELECT COUNT(*) as count FROM departments WHERE parent_department_id = $1',
            [req.params.id]
        );
        if (parseInt(subDeptCheck.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete department with sub-departments. Please reassign or delete sub-departments first.' 
            });
        }
        
        const result = await pool.query('DELETE FROM departments WHERE department_id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Department deleted' });
        } else {
            res.status(404).json({ error: 'Department not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== EMPLOYEES API =====
// Get all employees with department info
app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, d.department_name 
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            ORDER BY e.employee_id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get employee by ID
app.get('/api/employees/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, d.department_name 
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE e.employee_id = $1
        `, [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new employee
app.post('/api/employees', async (req, res) => {
    const { 
        first_name, middle_name, last_name, gender, date_of_birth,
        email, phone_number, address,
        department_id, job_title, employment_type, hire_date, employment_status
    } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO employees (
                first_name, middle_name, last_name, gender, date_of_birth,
                email, phone_number, address,
                department_id, job_title, employment_type, hire_date, employment_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [first_name, middle_name, last_name, gender, date_of_birth,
             email, phone_number, address,
             department_id, job_title, employment_type, hire_date, employment_status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
    const { 
        first_name, middle_name, last_name, gender, date_of_birth,
        email, phone_number, address,
        department_id, job_title, employment_type, hire_date, employment_status
    } = req.body;
    try {
        const result = await pool.query(
            `UPDATE employees SET 
                first_name = $1, middle_name = $2, last_name = $3, gender = $4, date_of_birth = $5,
                email = $6, phone_number = $7, address = $8,
                department_id = $9, job_title = $10, employment_type = $11, hire_date = $12, employment_status = $13,
                updated_at = CURRENT_TIMESTAMP 
            WHERE employee_id = $14 RETURNING *`,
            [first_name, middle_name, last_name, gender, date_of_birth,
             email, phone_number, address,
             department_id, job_title, employment_type, hire_date, employment_status, req.params.id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM employees WHERE employee_id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Employee deleted' });
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== ALERTS API =====
// Get all alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, p.name as patient_name FROM alert a
            LEFT JOIN patients p ON a.patient_id = p.id
            ORDER BY a.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get alert by ID
app.get('/api/alerts/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, p.name as patient_name FROM alert a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE a.id = $1
        `, [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Alert not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new alert
app.post('/api/alerts', async (req, res) => {
    const { patient_id, alert_type, severity, values, normal_range, status, icon_class } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO alert (patient_id, alert_type, severity, values, normal_range, status, icon_class) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [patient_id, alert_type, severity, values, normal_range, status, icon_class]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update alert
app.put('/api/alerts/:id', async (req, res) => {
    const { alert_type, severity, values, normal_range, status, icon_class } = req.body;
    try {
        const result = await pool.query(
            'UPDATE alert SET alert_type = $1, severity = $2, values = $3, normal_range = $4, status = $5, icon_class = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
            [alert_type, severity, values, normal_range, status, icon_class, req.params.id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Alert not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete alert
app.delete('/api/alerts/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM alert WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Alert deleted' });
        } else {
            res.status(404).json({ error: 'Alert not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// ===== EJS ROUTES =====
// Dashboard
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/dashboard', (req, res) => res.render('dashboard', { title: 'Dashboard' }));

// Login
app.get('/login', (req, res) => res.render('login', { title: 'Login' }));

// Patients
app.get('/patients', (req, res) => res.render('patient', { title: 'Patients' }));

// Devices
app.get('/devices', (req, res) => res.render('devices', { title: 'Devices' }));

// Employees
app.get('/employees', (req, res) => res.render('employees', { title: 'Employees' }));

// Departments
app.get('/departments', (req, res) => res.render('departments', { title: 'Departments' }));

// Alerts
app.get('/alerts', (req, res) => res.render('alerts', { title: 'Alerts' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`PatientPulse server running on port ${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/dashboard`);
});
