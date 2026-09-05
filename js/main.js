// BDFAST Citizen Services - Main JavaScript

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('BDFAST Application Initialized');
    // Add initialization logic here
}

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Call Error:', error);
        showAlert('সার্ভার সংযোগ বিচ্ছিন্ন। দয়া করে পরে চেষ্টা করুন।', 'danger');
        return null;
    }
}

// Show Alert Function
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('body');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Format Date
function formatDate(date) {
    return new Date(date).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format Phone Number
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.slice(-11) || phone;
}

// Check User Login Status
function isUserLoggedIn() {
    return !!localStorage.getItem('token');
}

// Get User Info
function getUserInfo() {
    const userJSON = localStorage.getItem('user');
    return userJSON ? JSON.parse(userJSON) : null;
}

// Set User Info
function setUserInfo(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Generate Random ID
function generateApplicationID() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `BDFAST-${year}-${random}`;
}

// Validate Email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate Phone Number
function validatePhoneNumber(phone) {
    const regex = /^[0-9]{11}$/;
    return regex.test(phone.replace(/\D/g, ''));
}

// Validate NID
function validateNID(nid) {
    return nid.replace(/\D/g, '').length >= 10;
}

// Loading State
function setLoadingState(buttonElement, isLoading = true) {
    if (isLoading) {
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>অপেক্ষা করুন...';
    } else {
        buttonElement.disabled = false;
        buttonElement.innerHTML = buttonElement.dataset.originalText || 'সাবমিট করুন';
    }
}

// Export functions for use in other files
window.BDFAST = {
    apiCall,
    showAlert,
    formatDate,
    formatPhoneNumber,
    isUserLoggedIn,
    getUserInfo,
    setUserInfo,
    logout,
    generateApplicationID,
    validateEmail,
    validatePhoneNumber,
    validateNID,
    setLoadingState
};
