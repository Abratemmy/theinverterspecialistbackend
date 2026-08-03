const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductMedia = sequelize.define(
    "ProductMedia",
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

        media_type: {
            type: DataTypes.ENUM("image", "video"),
            allowNull: false
        },

        media_url: {
            type: DataTypes.STRING(500),
            allowNull: false
        },

        thumbnail_url: {
            type: DataTypes.STRING(500)
        },

        alt_text: {
            type: DataTypes.STRING
        },

        is_primary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }

    },
    {
        tableName: "product_media",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: false
    }
);

module.exports = ProductMedia;