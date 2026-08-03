const { body } = require("express-validator");

exports.createReviewValidator = [

    body("rating")
        .notEmpty()
        .withMessage("Rating is required.")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5."),

    body("title")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Title cannot exceed 255 characters."),

    body("review")
        .optional()
        .isLength({ min: 10 })
        .withMessage("Review should be at least 10 characters.")

];

exports.updateReviewValidator = [

    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5."),

    body("title")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Title cannot exceed 255 characters."),

    body("review")
        .optional()
        .isLength({ min: 10 })
        .withMessage("Review should be at least 10 characters.")

];

exports.updateReviewStatusValidator = [

    body("status")
        .notEmpty()
        .withMessage("Status is required.")
        .isIn(["pending", "approved", "rejected"])
        .withMessage("Invalid review status.")

];