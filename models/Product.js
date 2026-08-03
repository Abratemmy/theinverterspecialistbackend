const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        short_description: {
            type: DataTypes.TEXT
        },

        description: {
            type: DataTypes.TEXT("long")
        },

        additional_information: {
            type: DataTypes.TEXT("long")
        },

        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },

        discount_price: {
            type: DataTypes.DECIMAL(12, 2)
        },

        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        weight: {
            type: DataTypes.DECIMAL(10, 2)
        },

        warranty: {
            type: DataTypes.STRING
        },

        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active"
        },

        featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: "products",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

module.exports = Product;