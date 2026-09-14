const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define(
    "Payment",
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

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        payment_reference: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },

        gateway: {
            type: DataTypes.ENUM("paystack", "bank_transfer"),
            allowNull: false,
            defaultValue: "paystack"
        },

        payment_method: {
            type: DataTypes.ENUM(
                "card",
                "bank_transfer",
                "ussd",
                "bank",
                "qr",
                "mobile_money",
                "cash_on_delivery"
            ),
            defaultValue: "card"
        },

        amount: {
            type: DataTypes.DECIMAL(12,2),
            allowNull: false
        },

        currency: {
            type: DataTypes.STRING,
            defaultValue: "NGN"
        },

        status: {
            type: DataTypes.ENUM(
                "pending",
                "successful",
                "failed",
                "cancelled",
                "refunded"
            ),
            defaultValue: "pending"
        },

        gateway_transaction_id: {
            type: DataTypes.STRING
        },

        gateway_response: {
            type: DataTypes.TEXT
        },

        paid_at: {
            type: DataTypes.DATE
        }
    },
    {
        tableName: "payments",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

module.exports = Payment;