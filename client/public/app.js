// DOM Elements
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-bar button');
const navLinks = document.querySelectorAll('.nav-links a');
const contentDiv = document.getElementById('content');

// API Base URL - using current port
const currentPort = window.location.port;
const API_BASE_URL = `http://localhost:${currentPort}/api`;

// Event Listeners
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = e.currentTarget.getAttribute('href');
        if (href === 'login.html') {
            e.preventDefault();
            handleLogout();
        }
    });
});

// Search Function
function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    // Basic search functionality will be implemented later
    console.log('Searching for:', query);
}

// Logout Function
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Page Loading Function
async function loadPage(page) {
    // Update active navigation link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${page}`) {
            link.classList.add('active');
        }
    });

    // Load page content based on route
    switch (page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'inventory':
            await loadInventory();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'suppliers':
            await loadSuppliers();
            break;
        case 'reports':
            await loadReports();
            break;
        default:
            contentDiv.innerHTML = '<h1>Page Not Found</h1>';
    }
}

// Notification Function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }
});

// Dashboard loading function
async function loadDashboard() {
    contentDiv.innerHTML = `
        <h1>Dashboard</h1>
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Total Products</h3>
                <p>0</p>
            </div>
            <div class="stat-card">
                <h3>Low Stock Items</h3>
                <p>0</p>
            </div>
            <div class="stat-card">
                <h3>Pending Orders</h3>
                <p>0</p>
            </div>
            <div class="stat-card">
                <h3>Total Suppliers</h3>
                <p>0</p>
            </div>
        </div>
    `;
}

async function loadProducts() {
    contentDiv.innerHTML = '<h1>Products</h1><div class="loading">Loading products...</div>';
    // Implement products page loading logic
}

async function loadInventory() {
    contentDiv.innerHTML = '<h1>Inventory</h1><div class="loading">Loading inventory...</div>';
    // Implement inventory page loading logic
}

async function loadOrders() {
    contentDiv.innerHTML = '<h1>Orders</h1><div class="loading">Loading orders...</div>';
    // Implement orders page loading logic
}

async function loadSuppliers() {
    contentDiv.innerHTML = '<h1>Suppliers</h1><div class="loading">Loading suppliers...</div>';
    // Implement suppliers page loading logic
}

async function loadReports() {
    contentDiv.innerHTML = '<h1>Reports</h1><div class="loading">Loading reports...</div>';
    // Implement reports page loading logic
}

// Handle notifications dropdown
const notifications = document.querySelector('.notifications');
const notificationsDropdown = document.querySelector('.notifications-dropdown');
const notificationBadge = document.querySelector('.notifications .badge');

notifications.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationsDropdown.classList.toggle('active');
});

// Handle profile dropdown
const userProfile = document.querySelector('.user');
const profileDropdown = document.querySelector('.profile-dropdown');

userProfile.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
    notificationsDropdown.classList.remove('active');
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!notifications.contains(e.target)) {
        notificationsDropdown.classList.remove('active');
    }
    if (!userProfile.contains(e.target)) {
        profileDropdown.classList.remove('active');
    }
});

// Handle notification clicks
const notificationItems = document.querySelectorAll('.notification-item');
notificationItems.forEach(item => {
    item.addEventListener('click', () => {
        item.classList.remove('unread');
        updateNotificationBadge();
    });
});

// Update notification badge
function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    notificationBadge.textContent = unreadCount;
    if (unreadCount === 0) {
        notificationBadge.style.display = 'none';
    } else {
        notificationBadge.style.display = 'block';
    }
}

// Handle profile menu items
const profileItems = document.querySelectorAll('.profile-item');
profileItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        if (item.classList.contains('logout')) {
            handleLogout();
        }
        // Add handlers for other menu items here
    });
}); 