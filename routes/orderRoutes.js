const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const orderController = require("../controllers/orderController");

const {
    createOrderValidator
} = require("../validators/orderValidator");

// Create Order
router.post(
    "/",
    authenticate,
    createOrderValidator,
    validate,
    orderController.createOrder
);

// Get My Orders
router.get(
    "/",
    authenticate,
    orderController.getMyOrders
);

// Get Single Order
router.get(
    "/:id",
    authenticate,
    orderController.getOrder
);

// Cancel Order
router.patch(
    "/:id/cancel",
    authenticate,
    orderController.cancelOrder
);

module.exports = router;