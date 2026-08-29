const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
    "Notification",
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

        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        type: {
            type: DataTypes.ENUM(
                "order",
                "payment",
                "promotion",
                "system",
                "security"
            ),
            allowNull: false,
            defaultValue: "system"
        },

        is_read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: "notifications",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: false
    }
);

module.exports = Notification;