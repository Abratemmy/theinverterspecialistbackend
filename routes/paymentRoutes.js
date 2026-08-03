const express = require("express");

const router = express.Router();

const paymentController =
    require("../controllers/paymentController");

const protect =
    require("../middleware/authMiddleware");

const validate =
    require("../middleware/validate");

const {
    initializePaymentValidator
} = require("../validators/paymentValidator");

router.post(
    "/initialize",
    protect,
    initializePaymentValidator,
    validate,
    paymentController.initializePayment
);

router.get(
    "/verify/:reference",
    protect,
    paymentController.verifyPayment
);


// Paystack Webhook
router.post(
    "/webhook",
    paymentController.paystackWebhook
);

module.exports = router;