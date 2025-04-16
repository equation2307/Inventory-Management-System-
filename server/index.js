const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the client/public directory
app.use(express.static(path.join(__dirname, '../client/public')));

// Import models
require('./models/User');
require('./models/Product');

const PORT = process.env.PORT || 3000;

// Function to find an available port
const findAvailablePort = async (startPort) => {
    const net = require('net');
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        
        server.listen(startPort, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${startPort} is in use, trying ${startPort + 1}`);
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
};

// Start server with error handling
const startServer = async () => {
    try {
        const availablePort = await findAvailablePort(PORT);
        app.listen(availablePort, () => {
            console.log(`Server is running on port ${availablePort}`);
            console.log(`Access the application at http://localhost:${availablePort}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Sync database and start server
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced successfully');
        startServer();
    })
    .catch(err => {
        console.error('Error syncing database:', err);
        process.exit(1);
    });

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}); 