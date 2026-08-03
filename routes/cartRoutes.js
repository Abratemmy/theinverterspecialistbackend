const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const validate = require("../middleware/validate");

const cartController = require("../controllers/cartController");

const {
    addToCartValidator,
    updateCartValidator
} = require("../validators/cartValidator");

// Get current cart
router.get(
    "/",
    authenticate,
    cartController.getCart
);

// Add item
router.post(
    "/",
    authenticate,
    addToCartValidator,
    validate,
    cartController.addToCart
);

// Update quantity
router.put(
    "/:itemId",
    authenticate,
    updateCartValidator,
    validate,
    cartController.updateCartItem
);

// Remove item
router.delete(
    "/:itemId",
    authenticate,
    cartController.removeCartItem
);

// Clear cart
router.delete(
    "/",
    authenticate,
    cartController.clearCart
);

module.exports = router;