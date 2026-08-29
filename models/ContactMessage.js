const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ContactMessage = sequelize.define(
    "ContactMessage",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        full_name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },

        subject: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        status: {
            type: DataTypes.ENUM(
                "new",
                "read",
                "replied",
                "closed"
            ),
            allowNull: false,
            defaultValue: "new"
        },

        admin_reply: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        replied_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: "contact_messages",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: false
    }
);

module.exports = ContactMessage;