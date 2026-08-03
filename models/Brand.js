const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Brand = sequelize.define(
    "Brand",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        description: {
            type: DataTypes.TEXT
        },

        logo: {
            type: DataTypes.STRING
        },

        website: {
            type: DataTypes.STRING
        },

        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active"
        }
    },
    {
        tableName: "brands",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

module.exports = Brand;