const { body } = require("express-validator");

exports.createBrandValidator = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Brand name is required.")
        .isLength({ max: 100 })
        .withMessage("Brand name cannot exceed 100 characters."),

    body("website")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("Please enter a valid website URL.")

];