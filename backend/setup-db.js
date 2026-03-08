const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'appdevdb',
    password: 'Carlzabala@123',
    port: 5432,
});

async function setupDatabase() {
    try {
        console.log('🔧 Setting up Staff Management & Audit Logs...\n');

        // Create staff table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) CHECK (role IN ('Super Admin', 'Admin', 'Manager', 'Supervisor')) NOT NULL,
                department VARCHAR(255),
                status VARCHAR(50) CHECK (status IN ('Active', 'Inactive', 'Disabled')) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created staff table');

        // Create staff_permissions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff_permissions (
                id SERIAL PRIMARY KEY,
                staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
                permission VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created staff_permissions table');

        // Create audit_logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                admin_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
                admin_name VARCHAR(255) NOT NULL,
                action VARCHAR(50) CHECK (action IN ('Create', 'Update', 'Delete', 'Login', 'Logout', 'View', 'Export')) NOT NULL,
                table_name VARCHAR(100) NOT NULL,
                target_id INTEGER,
                ip_address VARCHAR(45),
                before_state JSONB,
                after_state JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created audit_logs table');

        // Create indexes
        await pool.query('CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_staff_permissions_staff_id ON staff_permissions(staff_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name)');
        console.log('✅ Created indexes');

        // Insert default staff members
        const staffMembers = [
            { name: 'John Administrator', email: 'john.admin@hospital.com', role: 'Super Admin', department: 'Administration' },
            { name: 'Sarah Manager', email: 'sarah.manager@hospital.com', role: 'Admin', department: 'IT' },
            { name: 'Michael Johnson', email: 'michael.johnson@hospital.com', role: 'Manager', department: 'HR' },
            { name: 'Emily Davis', email: 'emily.davis@hospital.com', role: 'Supervisor', department: 'Nursing' },
            { name: 'Robert Wilson', email: 'robert.wilson@hospital.com', role: 'Admin', department: 'Medical Records' }
        ];

        for (const member of staffMembers) {
            const result = await pool.query(
                'INSERT INTO staff (name, email, role, department, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role RETURNING id',
                [member.name, member.email, member.role, member.department, 'Active']
            );
            console.log(`✅ Added staff: ${member.name} (${member.role})`);

            // Add permissions based on role
            const rolePermissions = {
                'Super Admin': [
                    'view_staff', 'add_staff', 'edit_staff', 'delete_staff', 'manage_permissions',
                    'view_patient', 'add_patient', 'edit_patient', 'delete_patient',
                    'view_device', 'add_device', 'edit_device', 'delete_device',
                    'view_department', 'add_department', 'edit_department', 'delete_department',
                    'view_reports', 'export_reports', 'view_analytics',
                    'view_settings', 'edit_settings', 'view_audit_logs', 'manage_backup'
                ],
                'Admin': [
                    'view_staff', 'edit_staff',
                    'view_patient', 'add_patient', 'edit_patient', 'delete_patient',
                    'view_device', 'add_device', 'edit_device', 'delete_device',
                    'view_department', 'add_department', 'edit_department',
                    'view_reports', 'export_reports', 'view_analytics',
                    'view_settings', 'view_audit_logs'
                ],
                'Manager': [
                    'view_staff',
                    'view_patient', 'add_patient', 'edit_patient',
                    'view_device', 'add_device', 'edit_device',
                    'view_department',
                    'view_reports'
                ],
                'Supervisor': [
                    'view_patient', 'edit_patient',
                    'view_device',
                    'view_reports'
                ]
            };

            const permissions = rolePermissions[member.role] || [];
            for (const permission of permissions) {
                await pool.query(
                    'INSERT INTO staff_permissions (staff_id, permission) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [result.rows[0].id, permission]
                );
            }
        }

        // Verify setup
        const staffCount = await pool.query('SELECT COUNT(*) FROM staff');
        const permCount = await pool.query('SELECT COUNT(*) FROM staff_permissions');

        console.log('\n✅ Database setup completed!\n');
        console.log(`📊 Staff Members: ${staffCount.rows[0].count}`);
        console.log(`🔐 Permissions: ${permCount.rows[0].count}`);

        // List all staff
        const allStaff = await pool.query('SELECT * FROM staff ORDER BY role DESC');
        console.log('\n👥 Staff Members in Database:');
        allStaff.rows.forEach(staff => {
            console.log(`   • ${staff.name} (${staff.role}) - ${staff.status}`);
        });

        await pool.end();
        console.log('\n✅ Database connection closed');
    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();
