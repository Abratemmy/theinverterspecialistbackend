const CustomerFeedback = require("../models/CustomerFeedback");
const Order = require("../models/Order");


// ============================================
// CREATE CUSTOMER FEEDBACK
// ============================================

exports.createFeedback = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            rating,
            comment,
        } = req.body;

        // Validate rating
        if (
            rating === undefined ||
            rating === null ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5.",
            });
        }

        // Validate comment
        if (
            !comment ||
            typeof comment !== "string" ||
            !comment.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Feedback comment is required.",
            });
        }

        // Check if customer has already submitted feedback
        // const existingFeedback =
        //     await CustomerFeedback.findOne({
        //         where: {
        //             user_id: userId,
        //         },
        //     });

        // if (existingFeedback) {
        //     return res.status(409).json({
        //         success: false,
        //         message:
        //             "You have already submitted feedback.",
        //     });
        // }

        // Check if customer has made a paid purchase
        const order = await Order.findOne({
            where: {
                user_id: userId,
                payment_status: "paid",
            },
        });

        if (!order) {
            return res.status(403).json({
                success: false,
                message:
                    "You must make a purchase before you can leave feedback.",
            });
        }

        // Get customer's name
        const customerName =
            `${req.user.first_name || ""} ${req.user.last_name || ""}`.trim();

        if (!customerName) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer name could not be determined.",
            });
        }

        // Create feedback
        const feedback =
            await CustomerFeedback.create({
                user_id: userId,
                customer_name: customerName,
                rating: Number(rating),
                comment: comment.trim(),
                status: "pending",
            });

        return res.status(201).json({
            success: true,
            message:
                "Thank you for your feedback. Your review will be published after approval.",
            data: feedback,
        });
    } catch (error) {
        console.error(
            "CREATE CUSTOMER FEEDBACK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback.",
        });
    }
};


// ============================================
// GET APPROVED FEEDBACK
// ============================================

exports.getApprovedFeedback = async (req, res) => {
    try {
        const feedback =
            await CustomerFeedback.findAll({
                where: {
                    status: "approved",
                },
                order: [
                    ["created_at", "DESC"],
                ],
            });

        return res.status(200).json({
            success: true,
            data: feedback,
        });
    } catch (error) {
        console.error(
            "GET APPROVED FEEDBACK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer feedback.",
        });
    }
};


// ============================================
// GET ALL FEEDBACK - ADMIN
// ============================================

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback =
            await CustomerFeedback.findAll({
                include: [
                    {
                        model: require("../models/User"),
                        as: "user",
                        attributes: [
                            "id",
                            "email",
                        ],
                    },
                ],
                order: [
                    ["created_at", "DESC"],
                ],
            });

        return res.status(200).json({
            success: true,
            data: feedback,
        });
    } catch (error) {
        console.error(
            "GET ALL FEEDBACK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer feedback.",
        });
    }
};


// ============================================
// UPDATE FEEDBACK STATUS - ADMIN
// ============================================

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "approved",
            "rejected",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid feedback status.",
            });
        }

        const feedback =
            await CustomerFeedback.findByPk(id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found.",
            });
        }

        feedback.status = status;

        await feedback.save();

        return res.status(200).json({
            success: true,
            message:
                `Feedback ${status} successfully.`,
            data: feedback,
        });
    } catch (error) {
        console.error(
            "UPDATE FEEDBACK STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update feedback status.",
        });
    }
};