const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all products
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Create product
router.post('/', auth, async (req, res) => {
    try {
        // Generate a unique SKU
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const sku = `PROD-${timestamp}-${random}`;

        const productData = {
            ...req.body,
            sku,
            quantity: req.body.quantity || 0,
            unit: req.body.unit || 'piece',
            status: req.body.quantity <= 0 ? 'out_of_stock' : 
                   req.body.quantity <= 10 ? 'low_stock' : 'in_stock'
        };

        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ 
            message: 'Error creating product', 
            error: error.message 
        });
    }
});

// Update product
router.put('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// Update product quantity
router.patch('/:id/quantity', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const product = await Product.findByPk(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.quantity = quantity;
        if (quantity <= product.reorderPoint) {
            product.status = 'low_stock';
        } else if (quantity === 0) {
            product.status = 'out_of_stock';
        } else {
            product.status = 'in_stock';
        }

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating quantity', error: error.message });
    }
});

module.exports = router; 