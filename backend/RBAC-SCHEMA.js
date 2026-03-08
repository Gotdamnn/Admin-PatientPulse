/**
 * RBAC (Role-Based Access Control) - Data Structure Schema
 * PatientPulse Platform
 * 
 * This document defines the complete data structure for the role-based access control system,
 * including tables, relationships, and example data.
 */

// ====================================================================
// PERMISSIONS TABLE SCHEMA
// ====================================================================
/**
 * Stores all available permissions in the system
 * Used across all roles
 */
PERMISSIONS_TABLE = {
  permission_id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  permission_name: "VARCHAR(100) UNIQUE - Human readable name",
  permission_key: "VARCHAR(100) UNIQUE - Programmatic identifier (lowercase_underscore)",
  description: "TEXT - What this permission allows",
  category: "VARCHAR(50) - Patient|Device|Department|Reports|Settings|Staff|Audit",
  created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
};

// ====================================================================
// EXAMPLE PERMISSIONS DATA
// ====================================================================
PERMISSIONS_EXAMPLE = [
  // Patient Management
  {
    permission_id: 1,
    permission_name: "View Patients",
    permission_key: "view_patient",
    description: "View patient records and information",
    category: "Patient",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    permission_id: 2,
    permission_name: "Create Patient",
    permission_key: "create_patient",
    description: "Create new patient records",
    category: "Patient",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    permission_id: 3,
    permission_name: "Edit Patient",
    permission_key: "edit_patient",
    description: "Edit existing patient records",
    category: "Patient",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    permission_id: 4,
    permission_name: "Delete Patient",
    permission_key: "delete_patient",
    description: "Delete patient records",
    category: "Patient",
    created_at: "2026-03-08T10:00:00Z"
  },
  
  // Device Management
  {
    permission_id: 5,
    permission_name: "View Devices",
    permission_key: "view_device",
    description: "View device information and status",
    category: "Device",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    permission_id: 6,
    permission_name: "Create Device",
    permission_key: "create_device",
    description: "Add new devices to the system",
    category: "Device",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    permission_id: 7,
    permission_name: "Edit Device",
    permission_key: "edit_device",
    description: "Modify device settings and information",
    category: "Device",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    permission_id: 8,
    permission_name: "Delete Device",
    permission_key: "delete_device",
    description: "Remove devices from the system",
    category: "Device",
    created_at: "2026-03-08T10:00:00Z"
  },
  
  // Department Management
  {
    permission_id: 9,
    permission_name: "View Departments",
    permission_key: "view_department",
    description: "View department information",
    category: "Department",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    permission_id: 10,
    permission_name: "Create Department",
    permission_key: "create_department",
    description: "Create new departments",
    category: "Department",
    created_at: "2026-03-08T10:00:00Z"
  },
  
  // Reports & Analytics
  {
    permission_id: 14,
    permission_name: "View Reports",
    permission_key: "view_reports",
    description: "Access system reports and data",
    category: "Reports",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    permission_id: 15,
    permission_name: "Export Reports",
    permission_key: "export_reports",
    description: "Export reports to external formats",
    category: "Reports",
    created_at: "2026-03-08T10:00:00Z"
  },
  
  // Staff Management
  {
    permission_id: 20,
    permission_name: "Edit Staff Permissions",
    permission_key: "edit_permissions",
    description: "Modify user permissions and roles",
    category: "Staff",
    created_at: "2026-03-08T10:00:00Z"
  },
  
  // Audit & Compliance
  {
    permission_id: 22,
    permission_name: "View Audit Logs",
    permission_key: "view_audit_logs",
    description: "Access system audit logs and activity history",
    category: "Audit",
    created_at: "2026-03-08T10:00:00Z"
  }
];

// ====================================================================
// ROLES TABLE SCHEMA
// ====================================================================
/**
 * Defines system roles
 * Super Admin role is locked and cannot be modified
 */
ROLES_TABLE = {
  role_id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  role_name: "VARCHAR(100) UNIQUE - Role name",
  description: "TEXT - Description of role",
  is_locked: "BOOLEAN DEFAULT FALSE - If TRUE, role cannot be modified",
  created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
};

// ====================================================================
// EXAMPLE ROLES DATA
// ====================================================================
ROLES_EXAMPLE = [
  {
    role_id: 1,
    role_name: "Super Admin",
    description: "Full system access with God Mode - cannot be edited or deleted",
    is_locked: true,
    created_at: "2026-03-08T10:00:00Z",
    updated_at: "2026-03-08T10:00:00Z"
  },
  {
    role_id: 2,
    role_name: "Admin",
    description: "High-level access to system settings, billing, and staff management",
    is_locked: false,
    created_at: "2026-03-08T10:00:00Z",
    updated_at: "2026-03-08T10:00:00Z"
  },
  {
    role_id: 3,
    role_name: "Manager",
    description: "Mid-level access focused on departmental reporting and staff oversight",
    is_locked: false,
    created_at: "2026-03-08T10:00:00Z",
    updated_at: "2026-03-08T10:00:00Z"
  },
  {
    role_id: 4,
    role_name: "Supervisor",
    description: "Low-level management focused on day-to-day operations and viewing specific data",
    is_locked: false,
    created_at: "2026-03-08T10:00:00Z",
    updated_at: "2026-03-08T10:00:00Z"
  }
];

// ====================================================================
// ROLE_PERMISSIONS JUNCTION TABLE SCHEMA
// ====================================================================
/**
 * Many-to-many relationship between roles and permissions
 * This table defines which permissions are granted to each role
 */
ROLE_PERMISSIONS_TABLE = {
  role_permission_id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  role_id: "INTEGER FOREIGN KEY -> roles.role_id",
  permission_id: "INTEGER FOREIGN KEY -> permissions.permission_id",
  created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  UNIQUE: "(role_id, permission_id)"
};

// ====================================================================
// EXAMPLE ROLE_PERMISSIONS DATA
// ====================================================================
ROLE_PERMISSIONS_EXAMPLE = [
  // Super Admin: All permissions (all 22+ permissions)
  {
    role_permission_id: 1,
    role_id: 1,  // Super Admin
    permission_id: 1,  // view_patient
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    role_permission_id: 2,
    role_id: 1,  // Super Admin
    permission_id: 2,  // create_patient
    created_at: "2026-03-08T10:00:00Z"
  },
  // ... (continues for all permissions)
  
  // Admin: Most permissions except some
  {
    role_permission_id: 100,
    role_id: 2,  // Admin
    permission_id: 1,  // view_patient
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    role_permission_id: 101,
    role_id: 2,  // Admin
    permission_id: 2,  // create_patient
    created_at: "2026-03-08T10:00:00Z"
  },
  // ... (continues)
  
  // Manager: Mid-level permissions
  {
    role_permission_id: 200,
    role_id: 3,  // Manager
    permission_id: 1,  // view_patient
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    role_permission_id: 201,
    role_id: 3,  // Manager
    permission_id: 3,  // edit_patient
    created_at: "2026-03-08T10:00:00Z"
  },
  // ... (limited permissions)
  
  // Supervisor: Minimal permissions
  {
    role_permission_id: 300,
    role_id: 4,  // Supervisor
    permission_id: 1,  // view_patient
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    role_permission_id: 301,
    role_id: 4,  // Supervisor
    permission_id: 5,  // view_device
    created_at: "2026-03-08T10:00:00Z"
  }
];

// ====================================================================
// ADMIN_ROLES JUNCTION TABLE SCHEMA
// ====================================================================
/**
 * Many-to-many relationship between admins and roles
 * Maps which users have which roles
 */
ADMIN_ROLES_TABLE = {
  admin_role_id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  admin_id: "INTEGER FOREIGN KEY -> admins.id",
  role_id: "INTEGER FOREIGN KEY -> roles.role_id",
  assigned_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  assigned_by: "VARCHAR(255) - Who assigned this role",
  UNIQUE: "(admin_id, role_id)"
};

// ====================================================================
// EXAMPLE ADMIN_ROLES DATA
// ====================================================================
ADMIN_ROLES_EXAMPLE = [
  {
    admin_role_id: 1,
    admin_id: 1,  // admin@patientpulse.com
    role_id: 1,  // Super Admin (automatically assigned)
    assigned_at: "2026-03-08T10:00:00Z",
    assigned_by: "System"
  },
  {
    admin_role_id: 2,
    admin_id: 2,  // Another admin user
    role_id: 2,  // Admin role
    assigned_at: "2026-03-08T10:30:00Z",
    assigned_by: "admin@patientpulse.com"
  },
  {
    admin_role_id: 3,
    admin_id: 3,  // Manager user
    role_id: 3,  // Manager role
    assigned_at: "2026-03-08T10:45:00Z",
    assigned_by: "admin@patientpulse.com"
  }
];

// ====================================================================
// ADMINS TABLE SCHEMA (EXTENDED)
// ====================================================================
/**
 * Contains user account information
 * Super Admin account: admin@patientpulse.com (hardcoded)
 */
ADMINS_TABLE = {
  id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  email: "VARCHAR(255) UNIQUE - User email address",
  password: "VARCHAR(255) - Bcrypt hashed password",
  name: "VARCHAR(255) - Full user name",
  created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
};

// ====================================================================
// EXAMPLE ADMINS DATA
// ====================================================================
ADMINS_EXAMPLE = [
  {
    id: 1,
    email: "admin@patientpulse.com",
    password: "$2b$10$4kQDrmf4l7GtEI0fel0XuOjXl4By29DO3KNC75fv3tVjTkjxk03IK",  // bcrypt hash
    name: "Admin User",
    created_at: "2026-03-08T10:00:00Z"
  },
  {
    id: 2,
    email: "manager@patientpulse.com",
    password: "$2b$10$...",  // bcrypt hash
    name: "John Manager",
    created_at: "2026-03-08T10:15:00Z"
  }
];

// ====================================================================
// PERMISSION LOGIC & RULES
// ====================================================================
/**
 * SUPER ADMIN RULES (admin@patientpulse.com):
 * - Has "God Mode" with ALL permissions
 * - Cannot be edited or deleted by other users
 * - Cannot have permissions removed
 * - Role is locked (is_locked = true)
 * - Bypasses all permission checks
 * 
 * ADMIN RULES:
 * - Can manage other users and permissions
 * - Full access to system settings
 * - Can create, edit, delete other roles/users
 * 
 * MANAGER RULES:
 * - Can view and manage departmental data
 * - Can view reports and analytics
 * - Limited staff management capabilities
 * 
 * SUPERVISOR RULES:
 * - Can view basic data (patients, devices)
 * - Day-to-day operational access
 * - Cannot create or delete records
 */

// ====================================================================
// API ENDPOINTS FOR RBAC
// ====================================================================
/**
 * GET /api/rbac/roles
 * Returns: { success: true, roles: [{ role_id, role_name, description, is_locked, permissions: [...] }] }
 */

/**
 * GET /api/rbac/permissions
 * Returns: { success: true, permissions: { "Patient": [...], "Device": [...], ... } }
 */

/**
 * POST /api/rbac/check-permission
 * Body: { adminId, userEmail, permissionKey }
 * Returns: { success: true, hasPermission: boolean, isSuperAdmin: boolean }
 */

/**
 * PUT /api/rbac/role/:roleId/permissions
 * Body: { permissionIds: [1, 2, 3, ...] }
 * Returns: { success: true, message: "Permissions updated successfully" }
 * Note: Cannot modify Super Admin role (is_locked = true)
 */

/**
 * GET /api/rbac/admins
 * Returns: { success: true, admins: [{ id, email, name, roles: [...] }] }
 */

/**
 * GET /api/rbac/user/:adminId/permissions
 * Returns: { success: true, permissions: [...] }
 */

/**
 * GET /api/rbac/user/:adminId/roles
 * Returns: { success: true, roles: [...] }
 */

/**
 * POST /api/rbac/admin/:adminId/role/:roleId
 * Body: { assignedBy: "Admin Name" }
 * Returns: { success: true, message: "Role assigned successfully" }
 */

/**
 * DELETE /api/rbac/admin/:adminId/role/:roleId
 * Returns: { success: true, message: "Role removed successfully" }
 */

// ====================================================================
// PERMISSION CHECKING LOGIC (Backend)
// ====================================================================
/**
 * Function: async hasPermission(adminId, userEmail, permissionKey)
 * 
 * Logic:
 * 1. Check if user is Super Admin (email === 'admin@patientpulse.com')
 *    - If YES, return true (bypass all checks)
 * 
 * 2. Query admin_roles to get user's roles
 * 
 * 3. Query role_permissions for those roles
 * 
 * 4. Check if permissionKey exists in the user's permissions
 * 
 * 5. Return true if permission exists, false otherwise
 * 
 * Returns: boolean
 */

// ====================================================================
// FRONTEND CHECKBOX LOGIC
// ====================================================================
/**
 * CHECKED = permission is GRANTED (TRUE)
 * UNCHECKED = permission is DENIED (FALSE)
 * 
 * When a checkbox is checked:
 * - Add that permission_id to the permissionIds array
 * 
 * When a checkbox is unchecked:
 * - Remove that permission_id from the permissionIds array
 * 
 * When "Update Permissions" is clicked:
 * - Send PUT request to /api/rbac/role/:roleId/permissions
 * - With body: { permissionIds: [...] }
 */

// ====================================================================
// TRANSACTION EXAMPLE: Updating Role Permissions
// ====================================================================
/**
 * Client sends: PUT /api/rbac/role/3/permissions
 * Body: { permissionIds: [1, 3, 5, 14, 15, 22] }
 * 
 * Backend transaction:
 * BEGIN;
 * 
 * 1. Check if role_id = 3 exists and is not locked (Super Admin)
 *    SELECT is_locked FROM roles WHERE role_id = 3;
 *    If is_locked = true, return error "Cannot modify Super Admin role"
 * 
 * 2. Delete all existing permissions for this role
 *    DELETE FROM role_permissions WHERE role_id = 3;
 * 
 * 3. Insert new permissions
 *    INSERT INTO role_permissions (role_id, permission_id)
 *    VALUES (3, 1), (3, 3), (3, 5), (3, 14), (3, 15), (3, 22);
 * 
 * COMMIT;
 * 
 * Return: { success: true, message: "Permissions updated successfully" }
 */

// ====================================================================
// SECURITY CONSIDERATIONS
// ====================================================================
/**
 * 1. Super Admin account (admin@patientpulse.com) is hardcoded and cannot be changed
 * 
 * 2. Super Admin role (is_locked = true) cannot be modified or deleted by any user
 * 
 * 3. All permission checks bypass the database if user is Super Admin
 * 
 * 4. Permissions are checked at two levels:
 *    - API endpoint level: RequirePermission middleware
 *    - Business logic level: hasPermission() function
 * 
 * 5. All permission changes are logged to audit_logs table
 * 
 * 6. Passwords are hashed with bcrypt (10 salt rounds minimum)
 * 
 * 7. Use prepared statements/parameterized queries to prevent SQL injection
 * 
 * 8. Frontend validation: Check permissions before showing UI elements
 *    Backend validation: Check permissions before allowing actions
 */

module.exports = {
  PERMISSIONS_TABLE,
  ROLES_TABLE,
  ROLE_PERMISSIONS_TABLE,
  ADMIN_ROLES_TABLE,
  ADMINS_TABLE,
  PERMISSIONS_EXAMPLE,
  ROLES_EXAMPLE,
  ROLE_PERMISSIONS_EXAMPLE,
  ADMIN_ROLES_EXAMPLE,
  ADMINS_EXAMPLE
};
