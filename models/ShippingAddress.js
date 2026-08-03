const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ShippingAddress = sequelize.define(
    "ShippingAddress",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        full_name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },

        address_line_1: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        address_line_2: {
            type: DataTypes.STRING(255)
        },

        city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        state: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        country: {
            type: DataTypes.STRING(100),
            defaultValue: "Nigeria"
        },

        postal_code: {
            type: DataTypes.STRING(20)
        },

        address_type: {
            type: DataTypes.ENUM(
                "home",
                "office",
                "other"
            ),
            defaultValue: "home"
        },

        is_default: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }

    },
    {
        tableName: "shipping_addresses",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at"
    }
);

module.exports = ShippingAddress;