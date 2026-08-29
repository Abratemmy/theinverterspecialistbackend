const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        order_number: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        // ====================================================
        // FULFILLMENT METHOD
        // ====================================================

        fulfillment_method: {
            type: DataTypes.ENUM(
                "shipping",
                "pickup"
            ),
            allowNull: false,
            defaultValue: "shipping"
        },

        // ====================================================
        // SHIPPING ADDRESS
        // ====================================================

        shipping_address_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        subtotal: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },

        shipping_fee: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },

        discount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },

        tax: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },

        total_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },

        payment_status: {
            type: DataTypes.ENUM(
                "pending",
                "paid",
                "failed",
                "refunded"
            ),
            defaultValue: "pending"
        },

        order_status: {
            type: DataTypes.ENUM(
                "pending",
                "processing",
                "packed",
                "shipped",
                "out_for_delivery",
                "delivered",
                "cancelled"
            ),
            defaultValue: "pending"
        },

        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: "orders",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at"
    }
);

module.exports = Order;