const { Product } = require('../models');
const { Op } = require('sequelize');

// handle errors better - 
const handleError = (err, res) => {
    console.error('Error:', err); // log it so that we can debug later
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'SKU already exists' });
    }
    return res.status(500).json({ error: 'Something went wrong' });
};

// make sku for new products - had to make this cuz manual sku was not easy
const generateSKU = (category) => {
    const prefix = category.substring(0, 3).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${date}-${random}`;
};

// get all products with sorting and 
exports.getAllProducts = async (req, res) => {
    try {
        const { sortBy = 'name', order = 'ASC', category, status } = req.query;
        
        // build where clause for filters
        const where = {};
        if (category) where.category = category;
        if (status) where.status = status;

        // get all products with filters
        const products = await Product.findAll({
            where,
            order: [[sortBy, order]]
        });

        // count products for the frontend page
        const total = products.length;
        const inStock = products.filter(p => p.status === 'in_stock').length;
        const lowStock = products.filter(p => p.status === 'low_stock').length;
        const outOfStock = products.filter(p => p.status === 'out_of_stock').length;

        res.json({
            products,
            metadata: {
                total,
                inStock,
                lowStock,
                outOfStock
            }
        });
    } catch (err) {
        handleError(err, res);
    }
};

// get one product by id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        handleError(err, res);
    }
};

// create new product - with all the validations
exports.createProduct = async (req, res) => {
    try {
        const { name, category, price, quantity, reorderPoint, unit } = req.body;

        // check if we got all the things we need
        if (!name || !category || !price || !quantity || !reorderPoint || !unit) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // make sku and create product
        const sku = generateSKU(category);
        const product = await Product.create({
            ...req.body,
            sku
        });

        res.status(201).json(product);
    } catch (err) {
        handleError(err, res);
    }
};

// update product - with tracking changes
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // track big changes in quantity
        if (req.body.quantity !== undefined) {
            const oldQuantity = product.quantity;
            const newQuantity = req.body.quantity;
            const diff = newQuantity - oldQuantity;

            if (Math.abs(diff) > 10) { // if change is more than 10
                const note = `Quantity changed from ${oldQuantity} to ${newQuantity} (${diff > 0 ? '+' : ''}${diff})`;
                req.body.notes = product.notes ? `${product.notes}\n${note}` : note;
            }
        }

        await product.update(req.body);
        res.json(product);
    } catch (err) {
        handleError(err, res);
    }
};

// delete product - but only if no stock left
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // cant delete if we still have stock
        if (product.quantity > 0) {
            return res.status(400).json({ error: 'Cannot delete product with remaining stock' });
        }

        await product.destroy();
        res.status(204).send();
    } catch (err) {
        handleError(err, res);
    }
}; 
