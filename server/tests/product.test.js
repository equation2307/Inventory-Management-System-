const request = require('supertest');
const app = require('../index');
const { Product } = require('../models');

describe('Product CRUD Operations', () => {
    let testProduct;

    beforeAll(async () => {
        // Clear the products table before tests
        await Product.destroy({ where: {} });
    });

    afterAll(async () => {
        // Clean up after tests
        await Product.destroy({ where: {} });
    });

    // Test Create Operation
    test('should create a new product', async () => {
        const productData = {
            name: 'Test Product',
            description: 'Test Description',
            category: 'electronics',
            price: 99.99,
            quantity: 10,
            unit: 'piece',
            reorderPoint: 5
        };

        const response = await request(app)
            .post('/api/products')
            .send(productData)
            .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(productData.name);
        testProduct = response.body;
    });

    // Test Read Operation
    test('should get all products', async () => {
        const response = await request(app)
            .get('/api/products')
            .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    // Test Read Single Product
    test('should get a single product', async () => {
        const response = await request(app)
            .get(`/api/products/${testProduct.id}`)
            .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(testProduct.id);
        expect(response.body.name).toBe(testProduct.name);
    });

    // Test Update Operation
    test('should update a product', async () => {
        const updateData = {
            name: 'Updated Product',
            price: 149.99,
            quantity: 15
        };

        const response = await request(app)
            .put(`/api/products/${testProduct.id}`)
            .send(updateData)
            .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(updateData.name);
        expect(response.body.price).toBe(updateData.price);
        expect(response.body.quantity).toBe(updateData.quantity);
    });

    // Test Delete Operation
    test('should delete a product', async () => {
        const response = await request(app)
            .delete(`/api/products/${testProduct.id}`)
            .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Product deleted successfully');

        // Verify the product is actually deleted
        const getResponse = await request(app)
            .get(`/api/products/${testProduct.id}`)
            .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);

        expect(getResponse.status).toBe(404);
    });
}); 