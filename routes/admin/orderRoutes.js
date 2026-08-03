const express = require("express");

const router = express.Router();

const authenticate = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");

const orderController = require("../../controllers/orderController");
const {
    updateOrderStatusValidator
} = require("../../validators/orderValidator");

const validate = require("../../middleware/validate");

// Get All Orders
router.get(
    "/",
    authenticate,
    authorize("admin", "manager"),
    orderController.getAllOrders
);

// Get Single Order
router.get(
    "/:id",
    authenticate,
    authorize("admin", "manager"),
    orderController.getAdminOrder
);

// Update Status
router.patch(
    "/:id/status",
    authenticate,
    authorize("admin", "manager"),
    updateOrderStatusValidator,
    validate,
    orderController.updateOrderStatus
);

module.exports = router;