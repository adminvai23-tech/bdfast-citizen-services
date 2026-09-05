// BDFAST Admin JavaScript

// Initialize Admin
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    if (!BDFAST.isUserLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = BDFAST.getUserInfo();
    if (!user || (user.role !== 'admin' && user.role !== 'officer' && user.role !== 'approver')) {
        window.location.href = '../login.html';
        return;
    }

    loadAdminData();
    setCurrentDate();
    displayAdminName();
}

function setCurrentDate() {
    const currentDate = document.getElementById('currentDate');
    if (currentDate) {
        currentDate.textContent = BDFAST.formatDate(new Date());
    }
}

function displayAdminName() {
    const user = BDFAST.getUserInfo();
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl && user) {
        adminNameEl.textContent = user.fullName || user.name || 'Admin';
    }
}

// Load Dashboard Data
async function loadAdminData() {
    try {
        const response = await BDFAST.apiCall('/admin/statistics');
        if (response && response.success) {
            updateStatistics(response.data);
            loadRecentApplications(response.data.recentApplications);
            initializeCharts(response.data);
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

function updateStatistics(data) {
    document.getElementById('totalApplications').textContent = data.totalApplications || 0;
    document.getElementById('pendingApplications').textContent = data.pendingApplications || 0;
    document.getElementById('approvedApplications').textContent = data.approvedApplications || 0;
    document.getElementById('certificatesIssued').textContent = data.certificatesIssued || 0;
}

function loadRecentApplications(applications) {
    const tableBody = document.getElementById('recentApplicationsTable');
    if (!tableBody) return;

    if (!applications || applications.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">কোনো আবেদন পাওয়া যায়নি</td></tr>';
        return;
    }

    tableBody.innerHTML = applications.map(app => `
        <tr>
            <td><strong>${app.applicationId}</strong></td>
            <td>${app.applicantName}</td>
            <td>${app.certificateType}</td>
            <td>${BDFAST.formatDate(app.submittedAt)}</td>
            <td><span class="badge badge-${getStatusClass(app.status)}">${getStatusText(app.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info" onclick="viewApplicationDetail('${app.applicationId}')">
                        <i class="fas fa-eye"></i> দেখুন
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function initializeCharts(data) {
    // Application Chart
    const appCtx = document.getElementById('applicationChart');
    if (appCtx) {
        new Chart(appCtx, {
            type: 'doughnut',
            data: {
                labels: ['বিচারাধীন', 'পরীক্ষায়', 'অনুমোদিত', 'খণ্ডিত'],
                datasets: [{
                    data: [
                        data.pendingApplications || 0,
                        data.reviewApplications || 0,
                        data.approvedApplications || 0,
                        data.rejectedApplications || 0
                    ],
                    backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Certificate Chart
    const certCtx = document.getElementById('certificateChart');
    if (certCtx) {
        new Chart(certCtx, {
            type: 'bar',
            data: {
                labels: ['নাগরিকত্ব', 'চারিত্রিক', 'আয়ের', 'বৈবাহিক', 'অন্যান্য'],
                datasets: [{
                    label: 'সনদ প্রদান',
                    data: [45, 38, 52, 41, 35],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'pending';
        case 'review': return 'review';
        case 'approved': return 'approved';
        case 'rejected': return 'rejected';
        default: return 'pending';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'pending': return 'বিচারাধীন';
        case 'review': return 'পরীক্ষায়';
        case 'approved': return 'অনুমোদিত';
        case 'rejected': return 'খণ্ডিত';
        default: return 'অজানা';
    }
}

// Load Applications
async function loadApplications() {
    try {
        const response = await BDFAST.apiCall('/admin/applications');
        if (response && response.success) {
            displayApplications(response.data);
        }
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

function displayApplications(applications) {
    const tableBody = document.getElementById('applicationsTableBody');
    if (!tableBody) return;

    if (!applications || applications.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">কোনো আবেদন পাওয়া যায়নি</td></tr>';
        return;
    }

    tableBody.innerHTML = applications.map(app => `
        <tr>
            <td><strong>${app.applicationId}</strong></td>
            <td>${app.applicantName}</td>
            <td>${app.certificateType}</td>
            <td>${BDFAST.formatDate(app.submittedAt)}</td>
            <td><span class="badge badge-${getStatusClass(app.status)}">${getStatusText(app.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info" onclick="viewApplicationDetail('${app.applicationId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editApplication('${app.applicationId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewApplicationDetail(applicationId) {
    const modal = new bootstrap.Modal(document.getElementById('applicationModal'));
    
    // Load application details
    BDFAST.apiCall(`/admin/applications/${applicationId}`).then(response => {
        if (response && response.success) {
            const detail = response.data;
            const detailHtml = `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>আবেদনকারীর তথ্য</h6>
                        <p><strong>নাম:</strong> ${detail.applicantName}</p>
                        <p><strong>মোবাইল:</strong> ${detail.mobile}</p>
                        <p><strong>ইমেইল:</strong> ${detail.email}</p>
                        <p><strong>NID:</strong> ${detail.nid}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>আবেদনের তথ্য</h6>
                        <p><strong>আবেদন ID:</strong> ${detail.applicationId}</p>
                        <p><strong>সনদের ধরন:</strong> ${detail.certificateType}</p>
                        <p><strong>সবমিশন:</strong> ${BDFAST.formatDate(detail.submittedAt)}</p>
                        <p><strong>অবস্থা:</strong> <span class="badge badge-${getStatusClass(detail.status)}">${getStatusText(detail.status)}</span></p>
                    </div>
                </div>
                <hr>
                <h6>আপলোড করা ডকুমেন্ট</h6>
                <div class="list-group">
                    ${(detail.documents || []).map(doc => `
                        <a href="#" class="list-group-item list-group-item-action">
                            <i class="fas fa-file"></i> ${doc.name}
                        </a>
                    `).join('')}
                </div>
            `;
            document.getElementById('applicationDetailContent').innerHTML = detailHtml;
            modal.show();
        }
    });
}

function editApplication(applicationId) {
    window.location.href = `edit-application.html?id=${applicationId}`;
}

function applyFilters() {
    const search = document.getElementById('searchApplication')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const date = document.getElementById('filterDate')?.value || '';

    BDFAST.apiCall('/admin/applications/filter', 'POST', {
        search,
        status,
        date
    }).then(response => {
        if (response && response.success) {
            displayApplications(response.data);
        }
    });
}

function requestCorrection() {
    const reason = prompt('সংশোধনের কারণ লিখুন:');
    if (reason) {
        BDFAST.showAlert('সংশোধনের অনুরোধ পাঠানো হয়েছে', 'success');
    }
}

function approveApplication() {
    if (confirm('এটি অনুমোদন করতে চান?')) {
        BDFAST.showAlert('আবেদন অনুমোদিত হয়েছে এবং সনদ জেনারেট হচ্ছে...', 'success');
    }
}

function rejectApplication() {
    const reason = prompt('খণ্ডনের কারণ:');
    if (reason) {
        BDFAST.showAlert('আবেদন খণ্ডিত হয়েছে', 'danger');
    }
}

// Load on page init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('applicationsTableBody')) {
            loadApplications();
        }
    });
} else {
    if (document.getElementById('applicationsTableBody')) {
        loadApplications();
    }
}

function logout() {
    BDFAST.logout();
}