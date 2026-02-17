// Reports & Analytics Page Script

if (typeof API_BASE === 'undefined') {
    var API_BASE = 'http://localhost:3001/api';
}
let activityChart = null;
let departmentChart = null;
let activityData = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeDateFilters();
    setupEventListeners();
    loadDashboardData();
    loadActivities();
    initializeCharts();
});

// Load activities from API
async function loadActivities() {
    try {
        const response = await fetch(`${API_BASE}/reports/activities`);
        if (response.ok) {
            const data = await response.json();
            activityData = data.map(act => ({
                id: act.id,
                activity: act.activity_type,
                user: act.user_name,
                department: act.department,
                timestamp: new Date(act.created_at),
                status: act.status === 'success' ? 'active' : 'inactive'
            }));
            renderActivityTable(activityData);
        } else {
            console.error('Failed to load activities');
            activityData = [];
            renderActivityTable([]);
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        activityData = [];
        renderActivityTable([]);
    }
}

// Initialize date filters with default values
function initializeDateFilters() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate && endDate) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        endDate.value = formatDate(today);
        startDate.value = formatDate(thirtyDaysAgo);
    }
}

// Format date for input
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Setup event listeners
function setupEventListeners() {
    const logoutBtn = document.querySelector('.logout-btn');
    const applyDateFilter = document.getElementById('applyDateFilter');
    const activitySearch = document.getElementById('activitySearch');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (applyDateFilter) {
        applyDateFilter.addEventListener('click', applyFilters);
    }
    
    if (activitySearch) {
        activitySearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = activityData.filter(act => 
                (act.activity || '').toLowerCase().includes(query) ||
                (act.user || '').toLowerCase().includes(query) ||
                (act.department || '').toLowerCase().includes(query)
            );
            renderActivityTable(filtered);
        });
    }
    
    // Chart period buttons
    document.querySelectorAll('.chart-option-btn[data-period]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-option-btn[data-period]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateActivityChart(e.target.dataset.period);
        });
    });
    
    // Chart type buttons
    document.querySelectorAll('.chart-option-btn[data-type]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-option-btn[data-type]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateDepartmentChart(e.target.dataset.type);
        });
    });
}

// Load dashboard data from API
async function loadDashboardData() {
    try {
        // Load patients
        const patientsRes = await fetch(`${API_BASE}/patients`);
        if (patientsRes.ok) {
            const patients = await patientsRes.json();
            document.getElementById('totalPatients').textContent = patients.length;
        }
        
        // Load employees
        const employeesRes = await fetch(`${API_BASE}/employees`);
        if (employeesRes.ok) {
            const employees = await employeesRes.json();
            const activeEmployees = employees.filter(e => e.status === 'active' || !e.status);
            document.getElementById('totalEmployees').textContent = activeEmployees.length;
        }
        
        // Load departments
        const departmentsRes = await fetch(`${API_BASE}/departments`);
        if (departmentsRes.ok) {
            const departments = await departmentsRes.json();
            const activeDepts = departments.filter(d => d.status === 'active' || !d.status);
            document.getElementById('totalDepartments').textContent = activeDepts.length;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set fallback values
        document.getElementById('totalPatients').textContent = '156';
        document.getElementById('totalEmployees').textContent = '42';
        document.getElementById('totalDepartments').textContent = '8';
    }
}

// Initialize charts
function initializeCharts() {
    initActivityChart();
    initDepartmentChart();
}

// Initialize Activity Line Chart
function initActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Patient Registrations',
                data: [65, 78, 90, 81, 86, 95],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Alerts Generated',
                data: [28, 48, 40, 19, 36, 27],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'System Events',
                data: [45, 52, 61, 49, 58, 69],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };
    
    activityChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Initialize Department Bar/Pie Chart
function initDepartmentChart() {
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;
    
    const data = {
        labels: ['Emergency', 'ICU', 'General Ward', 'Cardiology', 'Neurology', 'Pediatrics'],
        datasets: [{
            label: 'Patient Count',
            data: [24, 12, 45, 18, 15, 22],
            backgroundColor: [
                '#3b82f6',
                '#ef4444',
                '#22c55e',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4'
            ],
            borderRadius: 8,
            borderSkipped: false
        }]
    };
    
    departmentChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update Activity Chart based on period
function updateActivityChart(period) {
    if (!activityChart) return;
    
    let labels, data1, data2, data3;
    
    if (period === '12months') {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data1 = [65, 78, 90, 81, 86, 95, 88, 92, 87, 94, 101, 108];
        data2 = [28, 48, 40, 19, 36, 27, 32, 24, 35, 29, 22, 18];
        data3 = [45, 52, 61, 49, 58, 69, 55, 63, 58, 67, 72, 78];
    } else {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        data1 = [65, 78, 90, 81, 86, 95];
        data2 = [28, 48, 40, 19, 36, 27];
        data3 = [45, 52, 61, 49, 58, 69];
    }
    
    activityChart.data.labels = labels;
    activityChart.data.datasets[0].data = data1;
    activityChart.data.datasets[1].data = data2;
    activityChart.data.datasets[2].data = data3;
    activityChart.update();
}

// Update Department Chart type
function updateDepartmentChart(type) {
    if (!departmentChart) return;
    
    const ctx = document.getElementById('departmentChart');
    departmentChart.destroy();
    
    const data = {
        labels: ['Emergency', 'ICU', 'General Ward', 'Cardiology', 'Neurology', 'Pediatrics'],
        datasets: [{
            label: 'Patient Count',
            data: [24, 12, 45, 18, 15, 22],
            backgroundColor: [
                '#3b82f6',
                '#ef4444',
                '#22c55e',
                '#f59e0b',
                '#8b5cf6',
                '#06b6d4'
            ],
            borderRadius: type === 'bar' ? 8 : 0,
            borderSkipped: false
        }]
    };
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: type === 'pie',
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15
                }
            }
        }
    };
    
    if (type === 'bar') {
        options.scales = {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                grid: { display: false }
            }
        };
    }
    
    departmentChart = new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });
}

// Render activity table
function renderActivityTable(activities) {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = activities.map(act => `
        <tr>
            <td>${escapeHtml(act.activity)}</td>
            <td>${escapeHtml(act.user)}</td>
            <td><span class="dept-badge">${escapeHtml(act.department)}</span></td>
            <td>${formatTimestamp(act.timestamp)}</td>
            <td><span class="status-dot ${act.status}">${capitalizeFirst(act.status)}</span></td>
        </tr>
    `).join('');
}

// Format timestamp
function formatTimestamp(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Apply date filters
function applyFilters() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Filter activities based on date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);
    
    const filtered = activityData.filter(act => {
        const actDate = new Date(act.timestamp);
        return actDate >= start && actDate <= end;
    });
    
    renderActivityTable(filtered);
    
    // Show notification
    showNotification('Filters applied successfully');
}

// Export CSV
function exportCSV() {
    const headers = ['Activity', 'User', 'Department', 'Timestamp', 'Status'];
    const rows = activityData.map(act => [
        act.activity || '',
        act.user || '',
        act.department || '',
        new Date(act.timestamp).toLocaleString(),
        act.status || ''
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    downloadFile(csvContent, 'report.csv', 'text/csv');
    showNotification('CSV exported successfully');
}

// Export PDF (simplified - in real implementation use a PDF library)
function exportPDF() {
    // In a real implementation, you would use a library like jsPDF
    // For now, we'll create a print-friendly version
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>PatientPulse Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f5f5f5; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <h1>PatientPulse Analytics Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <h3>Recent Activity</h3>
            <table>
                <thead>
                    <tr>
                        <th>Activity</th>
                        <th>User</th>
                        <th>Department</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${activityData.map(act => `
                        <tr>
                            <td>${act.activity || ''}</td>
                            <td>${act.user || ''}</td>
                            <td>${act.department || ''}</td>
                            <td>${new Date(act.timestamp).toLocaleString()}</td>
                            <td>${act.status || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">PatientPulse Admin Dashboard - Confidential</div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    showNotification('PDF export initiated');
}

// Download file helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Logout functionality
function handleLogout() {
    showLogoutModal();
}

function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function confirmLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);