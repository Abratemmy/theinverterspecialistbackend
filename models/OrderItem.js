const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItem = sequelize.define(
    "OrderItem",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        unit_price: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: false
        },

        discount: {
            type: DataTypes.DECIMAL(12,2),
            defaultValue: 0
        },

        total_price: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: false
        }

    },
    {
        tableName: "order_items",

        timestamps: false,

        createdAt: "created_at"
    }
);

module.exports = OrderItem;