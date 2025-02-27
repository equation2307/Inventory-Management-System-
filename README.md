# Inventory Management System

A modern, full-stack inventory management system built with the MERN stack (MongoDB, Express.js, React, Node.js). This system helps businesses manage their inventory, track stock levels, process orders, and maintain supplier relationships.

## Features

- 🔐 User Authentication and Role-based Access Control
- 📦 Product/Item Management
- 📊 Stock Level Tracking
- 🛍️ Order Processing
- 👥 Supplier Management
- 📈 Reports and Analytics
- ⚠️ Low Stock Alerts
- 📝 Audit Trail
- 🎯 Dashboard with Key Metrics

## Tech Stack

- **Frontend**: React.js, Material-UI, Redux Toolkit
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/inventory-management-system.git
   cd inventory-management-system
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create a .env file in the root directory and add your environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will start with the backend running on http://localhost:5000 and the frontend on http://localhost:3000.

## Project Structure

```
inventory-management-system/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── redux/
│       └── services/
├── server/                 # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── .env
├── .gitignore
└── package.json
```

## API Documentation

The API documentation is available at `http://localhost:5000/api-docs` when running the development server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 