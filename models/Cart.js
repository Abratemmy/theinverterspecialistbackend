const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cart = sequelize.define(
    "Cart",
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

        status: {
            type: DataTypes.ENUM(
                "active",
                "checked_out",
                "abandoned"
            ),
            defaultValue: "active"
        }
    },
    {
        tableName: "carts",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at"
    }
);

module.exports = Cart;