const {
    ProductReview,
    Product,
    User
} = require("../models");

// create product review
exports.createReview = async (productId, userId, data) => {

    // Check product exists
    const product = await Product.findByPk(productId);

    if (!product || product.status !== "active") {
        throw new Error("Product not found.");
    }

    // Prevent duplicate reviews
    const existing = await ProductReview.findOne({

        where: {

            product_id: productId,

            user_id: userId

        }

    });

    if (existing) {
        throw new Error(
            "You have already reviewed this product."
        );
    }

    const review = await ProductReview.create({

        product_id: productId,

        user_id: userId,

        rating: data.rating,

        title: data.title,

        review: data.review,

        status: "pending"

    });

    return review;

};

// get product reviews
exports.getProductReviews = async (productId) => {

    return await ProductReview.findAll({

        where: {

            product_id: productId,

            status: "approved"

        },

        include: [

            {

                model: User,

                as: "user",

                attributes: [

                    "id",

                    "first_name",

                    "last_name",

                    "profile_image"

                ]

            }

        ],

        order: [

            ["created_at", "DESC"]

        ]

    });

};

// update product reviews
exports.updateReview = async (
    reviewId,
    userId,
    data
) => {

    const review = await ProductReview.findByPk(reviewId);

    if (!review) {
        throw new Error("Review not found.");
    }

    if (review.user_id !== userId) {
        throw new Error(
            "You are not allowed to edit this review."
        );
    }

    await review.update({

        rating: data.rating ?? review.rating,

        title: data.title ?? review.title,

        review: data.review ?? review.review,

        // Reset for moderation after edits
        status: "pending"

    });

    return review;

};

// delete product review
exports.deleteReview = async (
    reviewId,
    userId
) => {

    const review = await ProductReview.findByPk(reviewId);

    if (!review) {
        throw new Error("Review not found.");
    }

    if (review.user_id !== userId) {
        throw new Error(
            "You cannot delete this review."
        );
    }

    await review.destroy();

    return true;

};

// admin get all reviews
exports.getAllReviews = async () => {

    return await ProductReview.findAll({

        include: [

            {

                model: Product,

                as: "product",

                attributes: [

                    "id",

                    "name"

                ]

            },

            {

                model: User,

                as: "user",

                attributes: [

                    "id",

                    "first_name",

                    "last_name"

                ]

            }

        ],

        order: [

            ["created_at", "DESC"]

        ]

    });

};

// admin update review status
exports.updateReviewStatus = async (
    reviewId,
    status
) => {

    const review = await ProductReview.findByPk(reviewId);

    if (!review) {
        throw new Error("Review not found.");
    }

    review.status = status;

    await review.save();

    return review;

};