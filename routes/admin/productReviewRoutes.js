const express = require("express");

const router = express.Router();

const authenticate = require("../../middleware/authMiddleware");

const authorize = require("../../middleware/roleMiddleware");

const validate = require("../../middleware/validate");

const reviewController = require("../../controllers/productReviewController");

const {
    updateReviewStatusValidator
} = require("../../validators/productReviewValidator");

// Get all reviews
router.get(
    "/",
    authenticate,
    authorize("admin", "manager"),
    reviewController.getAllReviews
);

// Approve / Reject
router.patch(
    "/:reviewId/status",
    authenticate,
    authorize("admin", "manager"),
    updateReviewStatusValidator,
    validate,
    reviewController.updateReviewStatus
);

module.exports = router;