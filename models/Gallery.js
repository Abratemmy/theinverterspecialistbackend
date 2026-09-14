const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Gallery = sequelize.define(
    "Gallery",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        image_url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },

        public_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        alt_text: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        display_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        status: {
            type: DataTypes.ENUM(
                "active",
                "inactive"
            ),
            allowNull: false,
            defaultValue: "active",
        },
    },
    {
        tableName: "gallery",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Gallery;