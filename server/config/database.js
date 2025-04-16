const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('inventory_system', 'root', 'Jaipubg#1', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize; 