const { body } = require("express-validator");

exports.createOrderValidator = [
    body("shipping_address_id")
        .notEmpty()
        .withMessage("Shipping address is required.")
        .isInt()
        .withMessage("Shipping address must be an integer."),

    body("notes")
        .optional()
        .isString()
];

exports.updateOrderStatusValidator = [
    body("order_status")
        .notEmpty()
        .withMessage("Status is required.")
        .isIn([
            "pending",
            "processing",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ])
        .withMessage("Invalid order status.")
];