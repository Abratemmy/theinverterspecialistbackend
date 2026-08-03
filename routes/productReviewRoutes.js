const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const validate = require("../middleware/validate");

const reviewController = require("../controllers/productReviewController");

const {
    createReviewValidator,
    updateReviewValidator
} = require("../validators/productReviewValidator");

// Public
router.get(
    "/products/:productId/reviews",
    reviewController.getProductReviews
);

// Customer
router.post(
    "/products/:productId/reviews",
    authenticate,
    createReviewValidator,
    validate,
    reviewController.createReview
);

router.put(
    "/products/:productId/reviews/:reviewId",
    authenticate,
    updateReviewValidator,
    validate,
    reviewController.updateReview
);

router.delete(
    "/products/:productId/reviews/:reviewId",
    authenticate,
    reviewController.deleteReview
);

module.exports = router;