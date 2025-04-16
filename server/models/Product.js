const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Custom validation for SKU - had to make it unique cuz we had duplicates before
const validateSKU = (value) => {
    // our sku format: CATEGORY-YYYYMMDD-SEQ (like ELEC-20240315-001)
    const skuRegex = /^[A-Z]{3,5}-\d{8}-\d{3}$/;
    if (!skuRegex.test(value)) {
        throw new Error('SKU must follow format: CATEGORY-YYYYMMDD-SEQ (e.g., ELEC-20240315-001)');
    }
};

// price validation - dont want negative prices lol
const validatePrice = (value) => {
    if (value < 0) {
        throw new Error('Price cant be negative');
    }
    // round to 2 decimal places cuz money
    return Math.round(value * 100) / 100;
};

// quantity validation - no negative stock allowed
const validateQuantity = (value) => {
    if (value < 0) {
        throw new Error('Quantity cant be negative');
    }
    // make sure its a whole number
    return Math.floor(value);
};

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Product name is required'
            },
            len: {
                args: [2, 100],
                msg: 'Product name must be between 2 and 100 characters'
            }
        }
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            validateSKU
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['Electronics', 'Clothing', 'Food', 'Books', 'Other']],
                msg: 'Invalid category'
            }
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            validatePrice
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            validateQuantity
        }
    },
    reorderPoint: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
            min: {
                args: [0],
                msg: 'Reorder point must be positive'
            }
        }
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'piece',
        validate: {
            isIn: {
                args: [['piece', 'kg', 'liter', 'box', 'pack']],
                msg: 'Invalid unit'
            }
        }
    },
    status: {
        type: DataTypes.ENUM('in_stock', 'low_stock', 'out_of_stock'),
        allowNull: false,
        defaultValue: 'in_stock'
    },
    lastRestocked: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    hooks: {
        beforeSave: async (product) => {
            // update status based on quantity - had to fix this cuz it was buggy before
            if (product.quantity <= 0) {
                product.status = 'out_of_stock';
            } else if (product.quantity <= product.reorderPoint) {
                product.status = 'low_stock';
            } else {
                product.status = 'in_stock';
            }

            // update lastRestocked if quantity went up
            if (product.changed('quantity') && product.quantity > product.previous('quantity')) {
                product.lastRestocked = new Date();
            }
        }
    }
});

module.exports = Product; 