const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CustomerFeedback = sequelize.define(
    "CustomerFeedback",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        customer_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        rating: {
            type: DataTypes.TINYINT,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },

        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(
                "pending",
                "approved",
                "rejected"
            ),
            allowNull: false,
            defaultValue: "pending",
        },

        admin_reply: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "customer_feedback",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = CustomerFeedback;