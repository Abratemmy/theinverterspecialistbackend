const { body } = require("express-validator");

exports.addToCartValidator = [

    body("product_id")
        .notEmpty()
        .withMessage("Product is required.")
        .isInt()
        .withMessage("Product ID must be an integer."),

    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required.")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1.")

];

exports.updateCartValidator = [

    body("quantity")
        .exists()
        .withMessage("Quantity is required.")

        .bail()

        .isInt({ min: 1 })
        .withMessage(
            "Quantity must be a whole number greater than 0."
        )

];