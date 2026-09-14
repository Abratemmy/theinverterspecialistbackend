const express = require("express");

const router = express.Router();

const paymentController =
    require("../controllers/paymentController");

const protect =
    require("../middleware/authMiddleware");

const validate =
    require("../middleware/validate");

const authorize = require("../middleware/roleMiddleware")

const {
    initializePaymentValidator
} = require("../validators/paymentValidator");


// ============================================================
// PAYSTACK INITIALIZE
// ============================================================

router.post(
    "/initialize",
    protect,
    initializePaymentValidator,
    validate,
    paymentController.initializePayment
);


// ============================================================
// VERIFY PAYSTACK PAYMENT
// ============================================================

router.get(
    "/verify/:reference",
    protect,
    paymentController.verifyPayment
);


// ============================================================
// DIRECT BANK TRANSFER
// ============================================================

router.post(
    "/bank-transfer",
    protect,
    paymentController.createBankTransferPayment
);

router.patch(
    "/admin/bank-transfer/:paymentId/confirm",
    protect,
    authorize("admin", "manager"),
    paymentController.confirmBankTransferPayment
);

// ============================================================
// PAYSTACK WEBHOOK
// ============================================================

router.post(
    "/webhook",
    paymentController.paystackWebhook
);


module.exports = router;