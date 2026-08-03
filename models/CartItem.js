const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CartItem = sequelize.define(
    "CartItem",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },

        unit_price: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: false
        },

        discount_amount: {
            type: DataTypes.DECIMAL(12,2),
            defaultValue: 0
        },

        total_price: {
            type: DataTypes.DECIMAL(12,2),
            defaultValue: 0
        }
    },
    {
        tableName: "cart_items",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at"
    }
);

module.exports = CartItem;