const Product = require('../models/Product');

// Custom error handler
const handleError = (error, res) => {
    console.error('Error:', error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: error.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message
    });
};

// Generate custom SKU
const generateSKU = (category) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const categoryPrefix = category.slice(0, 4).toUpperCase();
    const randomSeq = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryPrefix}-${dateStr}-${randomSeq}`;
};

// Get all products with custom sorting and filtering
exports.getAllProducts = async (req, res) => {
    try {
        const { sortBy = 'name', order = 'ASC', category, status } = req.query;
        
        // Build where clause
        const where = {};
        if (category) where.category = category;
        if (status) where.status = status;

        // Custom sorting options
        const orderOptions = [];
        if (sortBy === 'name') {
            orderOptions.push(['name', order]);
        } else if (sortBy === 'price') {
            orderOptions.push(['price', order]);
        } else if (sortBy === 'quantity') {
            orderOptions.push(['quantity', order]);
        } else if (sortBy === 'lastRestocked') {
            orderOptions.push(['lastRestocked', order]);
        }

        const products = await Product.findAll({
            where,
            order: orderOptions,
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });

        // Add custom metadata
        const metadata = {
            total: products.length,
            categories: [...new Set(products.map(p => p.category))],
            statusCounts: {
                in_stock: products.filter(p => p.status === 'in_stock').length,
                low_stock: products.filter(p => p.status === 'low_stock').length,
                out_of_stock: products.filter(p => p.status === 'out_of_stock').length
            }
        };

        res.json({
            success: true,
            data: products,
            metadata
        });
    } catch (error) {
        handleError(error, res);
    }
};

// Create product with custom validation
exports.createProduct = async (req, res) => {
    try {
        const { name, category, price, quantity, reorderPoint, unit, notes } = req.body;

        // Custom validation
        if (!name || !category || price === undefined || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Generate SKU
        const sku = generateSKU(category);

        const product = await Product.create({
            name,
            sku,
            category,
            price,
            quantity,
            reorderPoint: reorderPoint || 10,
            unit: unit || 'piece',
            notes
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        handleError(error, res);
    }
};

// Update product with custom business logic
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find product
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Custom validation for quantity updates
        if (updates.quantity !== undefined) {
            const oldQuantity = product.quantity;
            const newQuantity = updates.quantity;

            // Add to notes if quantity changes significantly
            if (Math.abs(newQuantity - oldQuantity) > 10) {
                updates.notes = `${updates.notes || ''}\nQuantity changed from ${oldQuantity} to ${newQuantity} on ${new Date().toISOString()}`;
            }
        }

        // Update product
        await product.update(updates);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        handleError(error, res);
    }
};

// Delete product with custom checks
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Find product
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Custom check for products with stock
        if (product.quantity > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete product with remaining stock'
            });
        }

        await product.destroy();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        handleError(error, res);
    }
}; 