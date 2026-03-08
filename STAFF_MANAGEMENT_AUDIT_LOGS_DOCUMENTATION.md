# Staff Management & Audit Logs Documentation

## Table of Contents
1. [Staff Management](#staff-management)
2. [Audit Logs](#audit-logs)
3. [Permission System](#permission-system)
4. [Role Structure](#role-structure)

---

## Staff Management

### Overview
The Staff Management module allows administrators to manage system users, assign roles, and control access permissions across the PatientPulse application.

### Features

#### 1. **Role-Based Tabs**
- **Super Admin**: Full system access with all permissions
- **Admin**: Extended access for general administration
- **All Staff**: View all staff members regardless of role

#### 2. **Staff Controls**
- **Search Bar**: Search staff by name, email, or role
- **Role Filter**: Filter by assigned role (Super Admin, Admin, Manager, Supervisor)
- **Status Filter**: Filter by status (Active, Inactive, Disabled)

#### 3. **Staff Table**
Displays all staff members with the following columns:
- **Name**: Staff member name with avatar
- **Email**: Contact email address
- **Role**: Assigned role with color-coded badge
- **Department**: Assigned department
- **Status**: Current status with visual indicator
  - 🟢 Active (Green)
  - 🔴 Inactive (Red)
  - ⚪ Disabled (Gray)
- **Permissions**: Number of permissions assigned
- **Actions**: Edit or delete staff member

#### 4. **Add/Edit Staff Member**
Modal form to create or modify staff members with:
- Full Name *
- Email *
- Role * (Super Admin, Admin, Manager, Supervisor)
- Department
- Status
- Permissions (auto-populated based on role)

#### 5. **Permissions Management**
- View detailed permissions for each staff member
- Modify permissions beyond default role settings
- Permission categories:
  - Staff Management
  - Patient Management
  - Device Management
  - Department Management
  - Reports & Analytics
  - System Settings

---

## Audit Logs

### Overview
The Audit Logs module provides comprehensive tracking of all system activities, changes, and administrative actions for compliance and security purposes.

### Features

#### 1. **Search & Filter Bar**
- **Search by Admin Name**: Find logs by administrator who performed the action
- **Action Type Filter**: 
  - Create (🟢 Green)
  - Update (🟡 Yellow)
  - Delete (🔴 Red)
  - Login (🔵 Blue)
  - Logout (🔷 Cyan)
  - View (👁 Indigo)
  - Export (💚 Green)
- **Targeted Table Filter**: Filter by affected database table
  - Staff
  - Patients
  - Employees
  - Departments
  - Devices
  - Settings
- **Date Range Filter**: Select 'From' and 'To' dates
- **Reset Button**: Clear all filters

#### 2. **Audit Log Table**
Displays audit trail with columns:
- **Timestamp**: Date and time of action (YYYY-MM-DD HH:MM:SS format)
- **Admin Name**: Staff member who performed the action
- **Action**: Type of action with color-coded badge
- **Targeted Table**: Which database table was affected
- **Target ID**: ID of the record that was modified
- **IP Address**: Network IP address of the admin
- **Details**: "View" link to see detailed before/after state

#### 3. **Color-Coded Actions**
```
CREATE  → 🟢 Green    (+) icon
UPDATE  → 🟡 Yellow   (⟷) icon
DELETE  → 🔴 Red      (−) icon
LOGIN   → 🔵 Blue     (↗) icon
LOGOUT  → 🔷 Cyan     (↖) icon
VIEW    → 👁 Indigo   (eye) icon
EXPORT  → 💚 Green    (⬇) icon
```

#### 4. **Details Modal/Drawer**
When clicking "View Details", displays:

**Detail Information Section:**
- Timestamp: Full date and time
- Admin: Staff member name
- Action: Type of action performed
- Table: Affected database table
- IP Address: Source IP address

**Data Comparison Section:**
- **Before State**: JSON display of original data
  - Shows data before the action was performed
  - Empty for CREATE actions
- **After State**: JSON display of modified data
  - Shows data after the action was performed
  - Empty for DELETE actions

**Change Summary Section:**
- Lists each changed field
- Shows "From" value (red) and "To" value (green)
- For CREATE: Shows all new fields added
- For DELETE: Shows all removed fields
- For UPDATE: Shows before/after comparison
- For VIEW/LOGIN: Displays action summary

#### 5. **Pagination**
- Default: 15 logs per page
- Navigation: Previous/Next buttons
- Page information: "Page X of Y"
- Disabled state for first/last page

#### 6. **Export Feature**
- Export all audit logs to CSV format
- File naming: `audit-logs-YYYY-MM-DD.csv`
- Includes: Timestamp, Admin Name, Action, Table, Target ID, IP Address

---

## Permission System

### Default Role Permissions

#### **Super Admin**
- **Access**: Complete system access
- **Staff Management**: View, Add, Edit, Delete, Manage Permissions
- **Patient Management**: View, Add, Edit, Delete
- **Device Management**: View, Add, Edit, Delete
- **Department Management**: View, Add, Edit, Delete
- **Reports & Analytics**: View, Export, View Analytics
- **System Settings**: View, Edit, View Audit Logs, Manage Backups

#### **Admin**
- **Access**: Extensive administrative access
- **Staff Management**: View, Edit
- **Patient Management**: View, Add, Edit, Delete
- **Device Management**: View, Add, Edit, Delete
- **Department Management**: View, Add, Edit
- **Reports & Analytics**: View, Export, View Analytics
- **System Settings**: View, View Audit Logs

#### **Manager**
- **Access**: Department-level management
- **Staff Management**: View
- **Patient Management**: View, Add, Edit
- **Device Management**: View, Add, Edit
- **Department Management**: View
- **Reports & Analytics**: View

#### **Supervisor**
- **Access**: Limited staff management
- **Patient Management**: View, Edit
- **Device Management**: View
- **Reports & Analytics**: View

### Permission Categories

1. **Staff Management**
   - `view_staff` - View staff list and details
   - `add_staff` - Create new staff members
   - `edit_staff` - Modify staff information
   - `delete_staff` - Remove staff members
   - `manage_permissions` - Assign/modify permissions

2. **Patient Management**
   - `view_patient` - View patient records
   - `add_patient` - Create new patient records
   - `edit_patient` - Modify patient information
   - `delete_patient` - Remove patient records

3. **Device Management**
   - `view_device` - View device list
   - `add_device` - Add new devices
   - `edit_device` - Modify device settings
   - `delete_device` - Remove devices

4. **Department Management**
   - `view_department` - View departments
   - `add_department` - Create departments
   - `edit_department` - Modify departments
   - `delete_department` - Remove departments

5. **Reports & Analytics**
   - `view_reports` - Access reports
   - `export_reports` - Download reports
   - `view_analytics` - View analytical data

6. **System Settings**
   - `view_settings` - View system configuration
   - `edit_settings` - Modify settings
   - `view_audit_logs` - Access audit logs
   - `manage_backup` - Create/manage backups

---

## Role Structure

### Hierarchy
```
Super Admin
    ├─ Full System Access
    └─ Can manage all other roles

Admin
    ├─ Extensive Administrative Access
    └─ Cannot manage permissions

Manager
    ├─ Department-Level Management
    └─ Limited to assigned departments

Supervisor
    ├─ Limited Staff Access
    └─ Cannot modify records
```

### Role Assignment
- Assign roles when creating or editing staff members
- Role determines default permissions
- Individual permissions can be customized beyond role defaults
- Changes apply immediately after saving

---

## Best Practices

### Staff Management
1. **Principle of Least Privilege**
   - Assign minimum required permissions
   - Regular permission audits recommended

2. **Regular Audits**
   - Review staff list monthly
   - Disable inactive accounts promptly
   - Monitor permission changes

3. **Documentation**
   - Document permission changes
   - Maintain staff contact information
   - Keep department assignments current

### Audit Logs
1. **Log Retention**
   - Retain logs for compliance (typically 1-3 years)
   - Archive older logs periodically
   - Use export for long-term storage

2. **Log Review**
   - Monitor sensitive operations
   - Review unusual IP addresses
   - Track failed operations

3. **Compliance**
   - Use audit logs for regulatory compliance
   - Document sensitive operations
   - Maintain audit trail integrity

---

## API Integration

### Staff Management API (Backend)
```
GET    /api/staff              - List all staff
POST   /api/staff              - Create staff member
GET    /api/staff/:id          - Get staff details
PUT    /api/staff/:id          - Update staff member
DELETE /api/staff/:id          - Delete staff member
GET    /api/staff/:id/permissions - Get permissions
PUT    /api/staff/:id/permissions - Update permissions
```

### Audit Logs API (Backend)
```
GET    /api/audit-logs         - List audit logs with filters
GET    /api/audit-logs/:id     - Get specific audit log
POST   /api/audit-logs         - Create audit log entry
GET    /api/audit-logs/export  - Export logs as CSV
```

---

## Database Schema

### Staff Table
```sql
id          INT PRIMARY KEY
name        VARCHAR(255)
email       VARCHAR(255) UNIQUE
role        ENUM('Super Admin', 'Admin', 'Manager', 'Supervisor')
department  VARCHAR(255)
status      ENUM('Active', 'Inactive', 'Disabled')
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Audit Logs Table
```sql
id          INT PRIMARY KEY
timestamp   TIMESTAMP
admin_id    INT (FK to Staff)
action      VARCHAR(50)
table_name  VARCHAR(100)
target_id   INT
ip_address  VARCHAR(45)
before_state JSON
after_state  JSON
created_at  TIMESTAMP
```

### Staff Permissions Table
```sql
id          INT PRIMARY KEY
staff_id    INT (FK to Staff)
permission  VARCHAR(100)
granted_at  TIMESTAMP
```

---

## Troubleshooting

### Permissions Not Applying
- Clear browser cache
- Verify permission assignment in database
- Check role hierarchy
- Restart backend service if needed

### Audit Logs Not Showing
- Verify user has `view_audit_logs` permission
- Check date range filters
- Confirm logs exist for selected table
- Check IP address filters

### Staff Member Cannot Login
- Verify status is "Active"
- Check if role has appropriate permissions
- Reset password if needed
- Check failed login audit logs

---

## Version History
- **v1.0.0** (Current): Initial release with Staff Management and Audit Logs
  - Staff role management
  - Permission system
  - Complete audit trail
  - Export functionality
