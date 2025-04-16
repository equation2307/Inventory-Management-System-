console.log('products.js is loaded!');

// Check if already initialized
if (typeof window.productsInitialized === 'undefined') {
    window.productsInitialized = true;

    // Get current port for API URL
    let productsPort;
    let productsAPI_URL;

    // Initialize API URL - Setting up our connection to the backend
    function setupBackendConnection() {
        productsPort = window.location.port;
        productsAPI_URL = `http://localhost:${productsPort}/api`;
        console.log('Backend connection established:', productsAPI_URL);
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

    // Load inventory items with sorting and filtering
    async function loadInventoryItems() {
        const token = checkAuth();
        if (!token) return;

        try {
            // Get current filters
            const category = document.getElementById('category-filter').value;
            const status = document.getElementById('status-filter').value;
            const sortBy = document.getElementById('sort-by').value;
            const sortOrder = document.getElementById('sort-order').value;

            const queryParams = new URLSearchParams({
                category: category || undefined,
                status: status || undefined,
                sortBy: sortBy || 'name',
                order: sortOrder || 'ASC'
            });

            console.log('Fetching inventory with filters:', queryParams.toString());
            const response = await fetch(`${productsAPI_URL}/products?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load inventory items');
            }

            const data = await response.json();
            console.log('Inventory data loaded:', data);

            // Display items
            displayInventoryItems(data.data);

            // Update metadata display
            updateMetadataDisplay(data.metadata);

            // Check for low stock warnings
            checkLowStockWarnings(data.data);
        } catch (error) {
            console.error('Error loading inventory:', error);
            showNotification('Failed to load inventory items', 'error');
        }
    }

    // Update metadata display
    function updateMetadataDisplay(metadata) {
        const metadataContainer = document.getElementById('inventory-metadata');
        if (metadataContainer) {
            metadataContainer.innerHTML = `
                <div class="metadata-card">
                    <h3>Inventory Summary</h3>
                    <p>Total Items: ${metadata.total}</p>
                    <p>Categories: ${metadata.categories.join(', ')}</p>
                    <div class="status-summary">
                        <span class="status-badge in-stock">In Stock: ${metadata.statusCounts.in_stock}</span>
                        <span class="status-badge low-stock">Low Stock: ${metadata.statusCounts.low_stock}</span>
                        <span class="status-badge out-of-stock">Out of Stock: ${metadata.statusCounts.out_of_stock}</span>
                    </div>
                </div>
            `;
        }
    }

    // Handle sorting
    function setupSorting() {
        const sortBySelect = document.getElementById('sort-by');
        const sortOrderSelect = document.getElementById('sort-order');

        if (sortBySelect && sortOrderSelect) {
            sortBySelect.addEventListener('change', loadInventoryItems);
            sortOrderSelect.addEventListener('change', loadInventoryItems);
        }
    }

    // Enhanced display of inventory items
    function displayInventoryItems(inventoryItems) {
        console.log('Updating inventory table...');
        productsTableBody.innerHTML = '';
        
        inventoryItems.forEach(item => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id);
            
            // Add status classes
            if (item.quantity <= 0) {
                row.classList.add('out-of-stock');
            } else if (item.quantity <= item.reorderPoint) {
                row.classList.add('low-stock-warning');
            }
            
            const price = typeof item.price === 'string' ? 
                parseFloat(item.price) : item.price;
            
            // Format last restocked date
            const lastRestocked = item.lastRestocked ? 
                new Date(item.lastRestocked).toLocaleDateString() : 'Never';
            
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.sku}</td>
                <td>$${price.toFixed(2)}</td>
                <td>${item.quantity || 0} ${item.unit}</td>
                <td><span class="status-badge ${getStatusClass(item.quantity)}">${getStatusText(item.quantity)}</span></td>
                <td>${lastRestocked}</td>
                <td>
                    <button class="icon-button edit" onclick="editInventoryItem(${item.id})" title="Edit Item">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button delete" onclick="deleteInventoryItem(${item.id})" title="Delete Item">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="icon-button notes" onclick="showNotes(${item.id})" title="View Notes">
                        <i class="fas fa-sticky-note"></i>
                    </button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
        
        console.log('Inventory table updated successfully');
    }

    // Show notes modal
    function showNotes(itemId) {
        const modal = document.getElementById('notesModal');
        const notesContent = document.getElementById('notesContent');
        
        // Find the item
        const item = inventoryItems.find(i => i.id === itemId);
        if (item && item.notes) {
            notesContent.textContent = item.notes;
            modal.style.display = 'block';
        } else {
            showNotification('No notes available for this item', 'info');
        }
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

    // Initialize the page with new features
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Content Loaded - Starting initialization');
        setupBackendConnection();
        initializeDOMElements();
        setupEventListeners();
        setupSorting();
        addSortingButtons();
        loadInventoryItems();
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
            await loadInventoryItems();
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
    async function editInventoryItem(productId) {
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
    async function deleteInventoryItem(productId) {
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
            loadInventoryItems();
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product', 'error');
        }
    }

    // Sort inventory items by different criteria
    function sortInventoryBy(criteria) {
        const inventoryItems = Array.from(productsTableBody.children);
        inventoryItems.sort((a, b) => {
            const aValue = a.children[criteria === 'name' ? 0 : 3].textContent;
            const bValue = b.children[criteria === 'name' ? 0 : 3].textContent;
            
            if (criteria === 'name') {
                return aValue.localeCompare(bValue);
            } else {
                return parseInt(aValue) - parseInt(bValue);
            }
        });
        
        // Clear and re-add sorted items
        productsTableBody.innerHTML = '';
        inventoryItems.forEach(item => productsTableBody.appendChild(item));
    }

    // Check for low stock items and show warnings
    function checkLowStockWarnings(inventoryItems) {
        const lowStockItems = inventoryItems.filter(item => item.quantity <= 10);
        if (lowStockItems.length > 0) {
            const warningMessage = `⚠️ Warning: ${lowStockItems.length} item(s) are running low on stock!`;
            showNotification(warningMessage, 'warning');
            
            // Highlight low stock items in the table
            lowStockItems.forEach(item => {
                const row = document.querySelector(`tr[data-id="${item.id}"]`);
                if (row) {
                    row.classList.add('low-stock-warning');
                }
            });
        }
    }

    // Add sorting buttons to the table header
    function addSortingButtons() {
        const tableHeader = document.querySelector('#products-table thead tr');
        if (tableHeader) {
            const nameHeader = tableHeader.children[0];
            const quantityHeader = tableHeader.children[3];
            
            nameHeader.innerHTML = `
                <span>Name</span>
                <button class="sort-btn" onclick="sortInventoryBy('name')">
                    <i class="fas fa-sort"></i>
                </button>
            `;
            
            quantityHeader.innerHTML = `
                <span>Quantity</span>
                <button class="sort-btn" onclick="sortInventoryBy('quantity')">
                    <i class="fas fa-sort"></i>
                </button>
            `;
        }
    }
} else {
    console.log('Products.js already initialized');
} 