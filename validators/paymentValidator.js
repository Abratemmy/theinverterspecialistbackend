const { body } = require("express-validator");

exports.initializePaymentValidator = [

    body("order_id")
        .notEmpty()
        .withMessage("Order ID is required.")

        .isInt()
        .withMessage("Order ID must be an integer.")

];