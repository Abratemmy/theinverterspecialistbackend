const { body } = require("express-validator");

exports.createProductValidator = [

    body("product")
        .notEmpty()
        .withMessage("Product information is required."),

    body("product.category_id")
        .notEmpty()
        .withMessage("Category is required.")
        .isInt()
        .withMessage("Category ID must be an integer."),

    body("product.brand_id")
        .notEmpty()
        .withMessage("Brand is required.")
        .isInt()
        .withMessage("Brand ID must be an integer."),

    body("product.name")
        .notEmpty()
        .withMessage("Product name is required."),

    body("product.price")
        .notEmpty()
        .withMessage("Price is required.")
        .isNumeric()
        .withMessage("Price must be a valid number.")
];