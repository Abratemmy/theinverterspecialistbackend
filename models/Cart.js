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

        // Logged-in user's ID.
        // NULL when this is a guest cart.
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        // Unique identifier for guest carts.
        // NULL for carts belonging to logged-in users.
        guest_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
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