console.log('products.js is loaded!');

// Check if already initialized
if (typeof window.productsInitialized === 'undefined') {
    window.productsInitialized = true;

    // Get current port for API URL
    let productsPort;
    let productsAPI_URL;

    // Initialize API URL
    function initializeAPI() {
        productsPort = window.location.port;
        productsAPI_URL = `http://localhost:${productsPort}/api`;
        console.log('API URL initialized:', productsAPI_URL);
    }

    // DOM Elements
    let productsTableBody;
    let addProductBtn;
    let addProductModal;
    let addProductForm;
    let cancelAddProductBtn;
    let closeModalBtn;
    let categoryFilter;
    let statusFilter;

    // Initialize DOM elements
    function initializeDOMElements() {
        console.log('Initializing DOM elements...');
        productsTableBody = document.getElementById('products-table-body');
        addProductBtn = document.getElementById('addProductBtn');
        addProductModal = document.getElementById('addProductModal');
        addProductForm = document.getElementById('addProductForm');
        cancelAddProductBtn = document.getElementById('cancelAddProduct');
        closeModalBtn = document.querySelector('.close');
        categoryFilter = document.getElementById('category-filter');
        statusFilter = document.getElementById('status-filter');

        // Debug log all elements
        console.log('addProductBtn:', addProductBtn);
        console.log('addProductModal:', addProductModal);
        console.log('addProductForm:', addProductForm);
        console.log('closeModalBtn:', closeModalBtn);
        console.log('cancelAddProductBtn:', cancelAddProductBtn);
    }

    // Check authentication
    function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return null;
        }
        return token;
    }

    // Load products
    async function loadProducts() {
        const token = checkAuth();
        if (!token) return;

        try {
            console.log('Starting to load products...');
            const response = await fetch(`${productsAPI_URL}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load products');
            }

            const products = await response.json();
            console.log('Products loaded successfully:', products);
            displayProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            showNotification('Failed to load products', 'error');
        }
    }

    // Display products
    function displayProducts(products) {
        console.log('Displaying products in table...');
        productsTableBody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            // Safely format the price
            const price = typeof product.price === 'string' ? 
                parseFloat(product.price) : product.price;
            
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${price.toFixed(2)}</td>
                <td>${product.quantity || 0}</td>
                <td><span class="status-badge ${getStatusClass(product.quantity)}">${getStatusText(product.quantity)}</span></td>
                <td>
                    <button class="icon-button edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
        console.log('Products table updated');
    }

    // Show Modal
    function showModal() {
        console.log('showModal called');
        console.log('addProductModal:', addProductModal);
        if (addProductModal) {
            addProductModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log('Modal should be visible now');
        } else {
            console.log('Modal element not found!');
        }
    }

    // Hide Modal
    function hideModal() {
        console.log('hideModal called');
        if (addProductModal) {
            addProductModal.style.display = 'none';
            document.body.style.overflow = '';
            if (addProductForm) {
                addProductForm.reset();
                delete addProductForm.dataset.productId;
                document.querySelector('.modal-header h2').textContent = 'Add New Product';
                document.querySelector('#addProductForm button[type="submit"]').textContent = 'Add Product';
            }
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Add Product button click
        if (addProductBtn) {
            console.log('Adding click listener to addProductBtn');
            addProductBtn.addEventListener('click', () => {
                console.log('Add Product button clicked');
                showModal();
            });
        } else {
            console.log('addProductBtn not found!');
        }

        // Close modal button click
        if (closeModalBtn) {
            console.log('Adding click listener to closeModalBtn');
            closeModalBtn.addEventListener('click', hideModal);
        } else {
            console.log('closeModalBtn not found!');
        }

        // Cancel button click
        if (cancelAddProductBtn) {
            console.log('Adding click listener to cancelAddProductBtn');
            cancelAddProductBtn.addEventListener('click', hideModal);
        } else {
            console.log('cancelAddProductBtn not found!');
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addProductModal) {
                hideModal();
            }
        });

        // Form submission
        if (addProductForm) {
            console.log('Adding submit listener to addProductForm');
            addProductForm.addEventListener('submit', handleAddProduct);
        } else {
            console.log('addProductForm not found!');
        }

        // Filter changes
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterProducts);
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', filterProducts);
        }
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Content Loaded - Starting initialization');
        initializeAPI();
        initializeDOMElements();
        setupEventListeners();
        loadProducts();
    });

    // Add Product
    async function handleAddProduct(e) {
        e.preventDefault();
        console.log('Handling product form submission');

        const productId = addProductForm.dataset.productId;
        const isEdit = !!productId;

        // Generate a unique SKU (only for new products)
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const sku = isEdit ? undefined : `PROD-${timestamp}-${random}`;

        // Get the stock value from the form
        const stockValue = parseInt(document.getElementById('productStock').value);

        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value).toFixed(2),
            quantity: stockValue,
            description: document.getElementById('productDescription').value,
            unit: 'piece',
            reorderPoint: 10,
            status: stockValue <= 0 ? 'out_of_stock' : 
                   stockValue <= 10 ? 'low_stock' : 'in_stock'
        };

        // Add SKU only for new products
        if (!isEdit) {
            productData.sku = sku;
        }

        try {
            const url = isEdit ? 
                `${productsAPI_URL}/products/${productId}` : 
                `${productsAPI_URL}/products`;
            
            const method = isEdit ? 'PUT' : 'POST';

            console.log(`Sending ${method} request to ${url} with data:`, productData);
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'add'} product`);
            }

            const result = await response.json();
            console.log(`Product ${isEdit ? 'updated' : 'added'} successfully:`, result);
            showNotification(`Product ${isEdit ? 'updated' : 'added'} successfully`, 'info');
            
            // Reset form and hide modal
            console.log('Resetting form and hiding modal...');
            addProductForm.reset();
            delete addProductForm.dataset.productId;
            
            // Update modal title and button text before hiding
            const modalTitle = document.querySelector('.modal-header h2');
            const submitButton = document.querySelector('#addProductForm button[type="submit"]');
            
            if (modalTitle) {
                modalTitle.textContent = 'Add New Product';
            } else {
                console.error('Modal title element not found');
            }
            
            if (submitButton) {
                submitButton.textContent = 'Add Product';
            } else {
                console.error('Submit button not found');
            }
            
            hideModal();
            
            // Reload products
            console.log('Reloading products after update...');
            await loadProducts();
            console.log('Products reloaded successfully');
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'adding'} product:`, error);
            showNotification(error.message || `Failed to ${isEdit ? 'update' : 'add'} product`, 'error');
        }
    }

    // Filter Products
    function filterProducts() {
        const category = categoryFilter.value;
        const status = statusFilter.value;
        const rows = productsTableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const productCategory = row.cells[1].textContent;
            const productStatus = row.cells[4].querySelector('.status-badge').textContent.toLowerCase();

            const categoryMatch = !category || productCategory === category;
            const statusMatch = !status || productStatus === status;

            row.style.display = categoryMatch && statusMatch ? '' : 'none';
        });
    }

    // Helper Functions
    function getStatusClass(quantity) {
        if (!quantity && quantity !== 0) return 'out_of_stock';
        if (quantity <= 0) return 'out_of_stock';
        if (quantity <= 10) return 'low_stock';
        return 'in_stock';
    }

    function getStatusText(quantity) {
        if (!quantity && quantity !== 0) return 'Out of Stock';
        if (quantity <= 0) return 'Out of Stock';
        if (quantity <= 10) return 'Low Stock';
        return 'In Stock';
    }

    // Show Notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Edit Product
    async function editProduct(productId) {
        try {
            const token = checkAuth();
            if (!token) return;

            console.log('Fetching product details for ID:', productId);
            
            // Fetch product details
            const response = await fetch(`${productsAPI_URL}/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch product details');
            }

            const product = await response.json();
            console.log('Fetched product:', product);
            
            // Populate the form with product data
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.quantity;
            document.getElementById('productDescription').value = product.description || '';
            
            // Store the product ID for update
            addProductForm.dataset.productId = productId;
            
            // Change form title and button
            document.querySelector('.modal-header h2').textContent = 'Edit Product';
            document.querySelector('#addProductForm button[type="submit"]').textContent = 'Update Product';
            
            // Show the modal
            showModal();
        } catch (error) {
            console.error('Error fetching product:', error);
            showNotification(error.message || 'Failed to fetch product details', 'error');
        }
    }

    // Delete Product
    async function deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const token = checkAuth();
            if (!token) return;

            const response = await fetch(`${productsAPI_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            showNotification('Product deleted successfully', 'info');
            loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product', 'error');
        }
    }
} else {
    console.log('Products.js already initialized');
} 