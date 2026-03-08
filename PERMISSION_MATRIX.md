# Staff Management Permission Matrix

## Role Capabilities Matrix

| Feature | Super Admin | Admin | Manager | Supervisor |
|---------|:----------:|:-----:|:-------:|:----------:|
| **View Staff** | ✅ | ✅ | ✅ | ❌ |
| **Add Staff** | ✅ | ❌ | ❌ | ❌ |
| **Edit Staff** | ✅ | ✅ | ❌ | ❌ |
| **Delete Staff** | ✅ | ❌ | ❌ | ❌ |
| **Manage Permissions** | ✅ | ❌ | ❌ | ❌ |
| **View Patients** | ✅ | ✅ | ✅ | ✅ |
| **Add Patients** | ✅ | ✅ | ✅ | ❌ |
| **Edit Patients** | ✅ | ✅ | ✅ | ✅ |
| **Delete Patients** | ✅ | ✅ | ✅ | ❌ |
| **View Devices** | ✅ | ✅ | ✅ | ✅ |
| **Add Devices** | ✅ | ✅ | ✅ | ❌ |
| **Edit Devices** | ✅ | ✅ | ✅ | ❌ |
| **Delete Devices** | ✅ | ✅ | ❌ | ❌ |
| **View Departments** | ✅ | ✅ | ✅ | ❌ |
| **Add Departments** | ✅ | ✅ | ❌ | ❌ |
| **Edit Departments** | ✅ | ✅ | ❌ | ❌ |
| **Delete Departments** | ✅ | ❌ | ❌ | ❌ |
| **View Reports** | ✅ | ✅ | ✅ | ❌ |
| **Export Reports** | ✅ | ✅ | ❌ | ❌ |
| **View Analytics** | ✅ | ✅ | ❌ | ❌ |
| **View Settings** | ✅ | ✅ | ❌ | ❌ |
| **Edit Settings** | ✅ | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ✅ | ❌ | ❌ |
| **Manage Backups** | ✅ | ❌ | ❌ | ❌ |

## Permission Details

### Super Admin (25 Permissions)
**Complete system access to all features and data**

**Module Breakdown:**
- Staff Management: 5/5 permissions
- Patient Management: 4/4 permissions
- Device Management: 4/4 permissions
- Department Management: 4/4 permissions
- Reports & Analytics: 3/3 permissions
- System Settings: 4/4 permissions

**Typical Usage:**
- System administrator
- IT team lead
- Organization director
- Full system control

---

### Admin (18 Permissions)
**Extensive administrative access with limited super-user functions**

**Module Breakdown:**
- Staff Management: 2/5 permissions (View, Edit only)
- Patient Management: 4/4 permissions
- Device Management: 4/4 permissions
- Department Management: 3/4 permissions (no delete)
- Reports & Analytics: 3/3 permissions
- System Settings: 2/4 permissions (View, Audit Logs)

**Cannot do:**
- Add/Delete staff members
- Manage permissions
- Delete departments
- Edit system settings
- Manage backups

**Typical Usage:**
- Department administrator
- Operations manager
- Administrative coordinator
- Data management oversight

---

### Manager (9 Permissions)
**Department-level management with read-only system access**

**Module Breakdown:**
- Staff Management: 1/5 permissions (View only)
- Patient Management: 3/4 permissions (no delete)
- Device Management: 3/4 permissions (no delete)
- Department Management: 1/4 permissions (View only)
- Reports & Analytics: 1/3 permissions (View only)
- System Settings: 0/4 permissions

**Can do:**
- View staff list
- Add/Edit patient records
- Add/Edit devices
- View reports
- Access patient information

**Cannot do:**
- Create/Delete staff
- Delete patient records
- Delete devices
- Edit departments
- Export reports
- Access audit logs
- Edit settings

**Typical Usage:**
- Department manager
- Ward manager
- Section supervisor
- Team lead

---

### Supervisor (4 Permissions)
**Limited access for frontline staff**

**Module Breakdown:**
- Staff Management: 0/5 permissions
- Patient Management: 2/4 permissions (View, Edit only)
- Device Management: 1/4 permissions (View only)
- Department Management: 0/4 permissions
- Reports & Analytics: 0/3 permissions
- System Settings: 0/4 permissions

**Can do:**
- Edit patient information
- View device status

**Cannot do:**
- Create/Delete patients
- Add/Edit devices
- Delete devices
- Create staff members
- View departments
- Access reports
- View audit logs
- Edit settings

**Typical Usage:**
- Nursing staff
- Medical technician
- Clinical assistant
- Front desk
- Data entry staff

---

## Permission Codes & Descriptions

### Staff Management Permissions
```
view_staff              - View staff list and member details
add_staff               - Create new staff member accounts
edit_staff              - Modify existing staff information
delete_staff            - Remove staff members from system
manage_permissions      - Grant/revoke permissions to staff
```

### Patient Management Permissions
```
view_patient            - Access patient records and data
add_patient             - Create new patient records
edit_patient            - Update patient information
delete_patient          - Remove patient records (archive)
```

### Device Management Permissions
```
view_device             - View device inventory and status
add_device              - Register new devices
edit_device             - Modify device configuration
delete_device           - Remove devices from inventory
```

### Department Management Permissions
```
view_department         - View department list and info
add_department          - Create new departments
edit_department         - Modify department details
delete_department       - Remove departments from system
```

### Reports & Analytics Permissions
```
view_reports            - Access system reports
export_reports          - Download/export report data
view_analytics          - View analytical dashboards
```

### System Settings Permissions
```
view_settings           - View system configuration
edit_settings           - Modify system settings
view_audit_logs         - Access audit log history
manage_backup           - Create/restore backups
```

---

## Role Assignment Guide

### When to use Super Admin
- [ ] Primary system administrator
- [ ] IT director/manager
- [ ] Database administrator
- [ ] System architect
- [ ] Organization head/CTO

**Recommendation:** Limit to 1-3 people maximum

### When to use Admin
- [ ] Operations manager
- [ ] Department head
- [ ] Senior coordinator
- [ ] Regional manager
- [ ] Clinical director

**Recommendation:** 5-10 people per organization

### When to use Manager
- [ ] Ward/Unit manager
- [ ] Team lead
- [ ] Section supervisor
- [ ] Department coordinator
- [ ] Shift supervisor

**Recommendation:** 15-30 people per organization

### When to use Supervisor
- [ ] Nursing staff
- [ ] Technicians
- [ ] Receptionists
- [ ] Medical assistants
- [ ] Data entry staff

**Recommendation:** Remaining staff members

---

## Custom Permission Assignment

### When to Grant Additional Permissions
**Example 1: Trusted Manager with Admin Access**
```
Base Role: Manager
Additional: export_reports, edit_settings
Result: Can view reports, export them, and modify settings
```

**Example 2: Senior Technician**
```
Base Role: Supervisor
Additional: add_device, edit_device, view_reports
Result: Can manage devices and view reports
```

**Example 3: HR Coordinator**
```
Base Role: Admin
Remove: delete_patient, edit_settings
Additional: view_audit_logs
Result: Admin-level with focus on staff and audit
```

### When to Restrict Permissions
**Example 1: Vacation Replacement**
```
Base Role: Admin
Remove: delete_staff, manage_permissions
Result: Can do admin work but cannot manage staff
```

**Example 2: Temporary Access**
```
Base Role: Manager
Remove: add_patient, edit_patient
Result: Limited to viewing only (training period)
```

**Example 3: External Consultant**
```
Base Role: Supervisor
Remove: view_audit_logs
Additional: export_reports
Result: Can work with patients and export data
```

---

## Audit Log Tracking for Permissions

The Audit Log system tracks:
- ✅ When permissions are assigned
- ✅ When permissions are revoked
- ✅ When roles are changed
- ✅ Who made the change (admin name)
- ✅ When the change was made (timestamp)
- ✅ From IP address (network tracking)
- ✅ Before/After state (what changed)

**Example Audit Log Entry:**
```
Timestamp: 2024-03-08 14:32:15
Admin: John Administrator
Action: Update
Table: Staff Permissions
Target: User ID 5 (Emily Davis)
IP Address: 192.168.1.100

Before State:
{
  "role": "Manager",
  "permissions": ["view_staff", "view_patient", ...]
}

After State:
{
  "role": "Admin",
  "permissions": ["view_staff", "edit_staff", "view_patient", ...]
}

Change Summary:
- Role changed from "Manager" to "Admin"
- Added 8 new permissions
```

---

## Best Practices for Permission Management

### 1. Principle of Least Privilege
- Assign minimum permissions needed
- Review and revoke unused permissions regularly
- Audit permission usage monthly

### 2. Regular Audits
- Review staff permissions quarterly
- Monitor admin activity in audit logs
- Check for inactive accounts
- Verify role assignments are correct

### 3. Onboarding Process
- Assign base role to new staff
- Grant additional permissions as needed
- Document permission justification
- Set review date (30/60/90 days)

### 4. Offboarding Process
- Disable account immediately
- Revoke all permissions
- Archive audit logs
- Document reason for removal

### 5. Permission Changes
- Document all permission changes
- Use audit logs to track changes
- Notify affected staff
- Keep change records

---

## Permission Troubleshooting

### User Can't Access Feature
**Step 1:** Check staff status (must be Active)
**Step 2:** Verify role assignment
**Step 3:** Check specific permissions in audit log
**Step 4:** Compare with permission matrix above
**Step 5:** Grant additional permission if needed
**Step 6:** Clear session cache and retry

### Permission Won't Revoke
**Step 1:** Verify admin has `manage_permissions`
**Step 2:** Check if role has automatic permissions
**Step 3:** Remove from both custom AND role permissions
**Step 4:** Force logout user session
**Step 5:** Verify in audit log

### Role Gets Reset
**Step 1:** Check if role has conflicting permissions
**Step 2:** Review audit logs for changes
**Step 3:** Check for scheduled permission sync
**Step 4:** Verify no automated role assignment
**Step 5:** Contact system admin

---

## Summary Statistics

**Total Permissions:** 27
**Total Roles:** 4
**Max Permissions per Role:** 25 (Super Admin)
**Min Permissions per Role:** 4 (Supervisor)

**Permission Distribution:**
- Critical (System Access): 4 permissions
- Administrative (Data Access): 12 permissions
- Operational (Day-to-Day): 8 permissions
- Reporting (Analytics): 3 permissions

**Recommended Role Distribution in 100-person organization:**
- Super Admin: 1-2 people
- Admin: 8-10 people
- Manager: 15-20 people
- Supervisor: 70-76 people
