const { body } = require("express-validator");

exports.createShippingAddressValidator = [

    body("full_name")
        .notEmpty()
        .withMessage("Full name is required."),

    body("phone")
        .notEmpty()
        .withMessage("Phone number is required."),

    body("address_line_1")
        .notEmpty()
        .withMessage("Address Line 1 is required."),

    body("city")
        .notEmpty()
        .withMessage("City is required."),

    body("state")
        .notEmpty()
        .withMessage("State is required."),

    body("country")
        .optional(),

    body("postal_code")
        .optional(),

    body("address_type")
        .optional()
        .isIn(["home", "office", "other"])
        .withMessage("Invalid address type.")

];

exports.updateShippingAddressValidator = [

    body("full_name")
        .optional(),

    body("phone")
        .optional(),

    body("address_line_1")
        .optional(),

    body("address_line_2")
        .optional(),

    body("city")
        .optional(),

    body("state")
        .optional(),

    body("country")
        .optional(),

    body("postal_code")
        .optional(),

    body("address_type")
        .optional()
        .isIn(["home", "office", "other"])
        .withMessage("Invalid address type.")

];