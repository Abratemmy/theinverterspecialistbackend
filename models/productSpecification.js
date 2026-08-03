const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductSpecification = sequelize.define(
    "ProductSpecification",
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

        specification_name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        specification_value: {
            type: DataTypes.STRING,
            allowNull: false
        },

        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }

    },
    {
        tableName: "product_specifications",

        timestamps: true,

        createdAt: "created_at",

        updatedAt: false
    }
);

module.exports = ProductSpecification;