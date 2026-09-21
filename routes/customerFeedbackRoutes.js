const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createFeedback,
    getApprovedFeedback,
    getAllFeedback,
    updateFeedbackStatus,
} = require("../controllers/customerFeedbackController");


// ============================================
// PUBLIC
// ============================================

// Homepage
router.get(
    "/",
    getApprovedFeedback
);


// ============================================
// CUSTOMER
// ============================================

// Logged-in customer submits feedback
router.post(
    "/",
    protect,
    createFeedback
);


// ============================================
// ADMIN
// ============================================

// Get all feedback
router.get(
    "/admin",
    protect,
    authorize("admin", "manager"),
    getAllFeedback
);


// Update feedback status
router.patch(
    "/admin/:id/status",
    protect,
    authorize("admin", "manager"),
    updateFeedbackStatus
);


module.exports = router;