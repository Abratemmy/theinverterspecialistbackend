const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const validate = require("../middleware/validate");

const optionalAuth =
    require("../middleware/optionalAuthMiddleware");

const cartController = require("../controllers/cartController");

const {
    addToCartValidator,
    updateCartValidator
} = require("../validators/cartValidator");

// Get current cart
router.get(
    "/",
    optionalAuth,
    cartController.getCart
);

// ============================================================
// MERGE GUEST CART
// Logged-in users only
// ============================================================

router.post(
    "/merge",
    authenticate,
    cartController.mergeGuestCart
);


// Add item
router.post(
    "/",
    optionalAuth,
    addToCartValidator,
    validate,
    cartController.addToCart
);

// Update quantity
router.put(
    "/:itemId",
    optionalAuth,
    updateCartValidator,
    validate,
    cartController.updateCartItem
);

// Remove item
router.delete(
    "/:itemId",
    optionalAuth,
    cartController.removeCartItem
);


router.delete(
    "/",
    optionalAuth,
    cartController.clearCart
);

module.exports = router;