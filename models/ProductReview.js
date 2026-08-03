const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductReview = sequelize.define(
    "ProductReview",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        rating: {
            type: DataTypes.TINYINT,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },

        title: {
            type: DataTypes.STRING
        },

        review: {
            type: DataTypes.TEXT
        },

        is_verified_purchase: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        status: {
            type: DataTypes.ENUM(
                "pending",
                "approved",
                "rejected"
            ),
            defaultValue: "pending"
        }

    },
    {
        tableName: "product_reviews",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: "updated_at"
    }
);

module.exports = ProductReview;