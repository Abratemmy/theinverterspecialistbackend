const express = require("express");

const router = express.Router();

const paymentController =
    require("../../controllers/adminPaymentController");

const protect =
    require("../../middleware/authMiddleware");


// ============================================================
// GET ALL PAYMENTS
// ============================================================

router.get(
    "/",
    protect,
    paymentController.getPayments
);


// ============================================================
// GET SINGLE PAYMENT
// ============================================================

router.get(
    "/:id",
    protect,
    paymentController.getPaymentById
);


module.exports = router;