const productReviewService = require("../services/productReviewService");

// Customer creates review
exports.createReview = async (req, res) => {
    try {
        const review = await productReviewService.createReview(
            req.params.productId,
            req.user.id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully and is awaiting approval.",
            data: review
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Public - Get approved reviews
exports.getProductReviews = async (req, res) => {

    try {

        const reviews = await productReviewService.getProductReviews(
            req.params.productId
        );

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Customer updates own review
exports.updateReview = async (req, res) => {

    try {

        const review = await productReviewService.updateReview(
            req.params.reviewId,
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Review updated successfully. Awaiting approval.",
            data: review
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Customer deletes own review
exports.deleteReview = async (req, res) => {

    try {

        await productReviewService.deleteReview(
            req.params.reviewId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully."
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Admin - Get all reviews
exports.getAllReviews = async (req, res) => {

    try {

        const reviews = await productReviewService.getAllReviews();

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Admin - Approve / Reject review
exports.updateReviewStatus = async (req, res) => {

    try {

        const review = await productReviewService.updateReviewStatus(
            req.params.reviewId,
            req.body.status
        );

        return res.status(200).json({
            success: true,
            message: "Review status updated successfully.",
            data: review
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};