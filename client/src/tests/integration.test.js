import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API server
const server = setupServer(
    rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.json([
            {
                id: 1,
                name: 'Test Product',
                category: 'electronics',
                price: 99.99,
                quantity: 10,
                status: 'in_stock'
            }
        ]));
    }),
    rest.post('/api/products', (req, res, ctx) => {
        return res(ctx.json({
            id: 2,
            name: 'New Product',
            category: 'electronics',
            price: 149.99,
            quantity: 15,
            status: 'in_stock'
        }));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Product Management Integration', () => {
    test('should load and display products', async () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );

        // Wait for products to load
        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        // Verify product details
        expect(screen.getByText('electronics')).toBeInTheDocument();
        expect(screen.getByText('$99.99')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('should add a new product', async () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );

        // Click add product button
        fireEvent.click(screen.getByText('Add Product'));

        // Fill in the form
        fireEvent.change(screen.getByLabelText('Product Name'), {
            target: { value: 'New Product' }
        });
        fireEvent.change(screen.getByLabelText('Category'), {
            target: { value: 'electronics' }
        });
        fireEvent.change(screen.getByLabelText('Price'), {
            target: { value: '149.99' }
        });
        fireEvent.change(screen.getByLabelText('Initial Stock'), {
            target: { value: '15' }
        });

        // Submit the form
        fireEvent.click(screen.getByText('Add Product'));

        // Wait for the new product to appear
        await waitFor(() => {
            expect(screen.getByText('New Product')).toBeInTheDocument();
        });

        // Verify new product details
        expect(screen.getByText('electronics')).toBeInTheDocument();
        expect(screen.getByText('$149.99')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
    });
}); 