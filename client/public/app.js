// DOM Elements
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-bar button');
const navLinks = document.querySelectorAll('.nav-links a');
const contentDiv = document.getElementById('content');

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Event Listeners
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.getAttribute('href').substring(1);
        loadPage(page);
    });
});

// Search Function
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
            displaySearchResults(data.products);
        } else {
            showNotification('No results found', 'info');
        }
    } catch (error) {
        showNotification('Error searching products', 'error');
    }
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
    // Load dashboard by default
    loadPage('dashboard');
});

// Placeholder functions for different pages
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
        const data = await response.json();
        
        // Update dashboard stats
        document.querySelector('.stat-card:nth-child(1) p').textContent = data.totalProducts || '0';
        document.querySelector('.stat-card:nth-child(2) p').textContent = data.lowStockItems || '0';
        document.querySelector('.stat-card:nth-child(3) p').textContent = data.pendingOrders || '0';
        document.querySelector('.stat-card:nth-child(4) p').textContent = data.totalSuppliers || '0';
    } catch (error) {
        showNotification('Error loading dashboard', 'error');
    }
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