const { body } = require("express-validator");

exports.registerValidator = [

    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),

    body("last_name")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),

    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("phone")
        .optional()
        .isLength({ min: 10 })
        .withMessage("Invalid phone number"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
];

exports.loginValidator = [

    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")

];

// forgotpassword
exports.forgotPasswordValidator = [

    body("email")
        .isEmail()
        .withMessage("Please provide a valid email.")

];