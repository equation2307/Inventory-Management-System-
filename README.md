# Inventory Management System

A modern, full-stack inventory management system built with Node.js, Express, MySQL, and vanilla JavaScript. This system helps businesses manage their inventory, track stock levels, process orders, and maintain supplier relationships.

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

- **Frontend**: HTML, CSS, and JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v14 or higher)
- MySQL
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
   DB_NAME=inventory_system
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

4. Set up the database:
   ```bash
   # Log into MySQL and run the schema file
   mysql -u your_username -p < server/config/schema.sql
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will start with the backend running on http://localhost:5000 and the frontend on http://localhost:3000.

## Project Structure

```
inventory-management-system/
├── client/                 # Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
├── server/                 # Node.js backend
│   ├── config/
│   │   ├── database.js
│   │   └── schema.sql
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