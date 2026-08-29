const express = require("express");

const router =
    express.Router();

const authenticate =
    require("../middleware/authMiddleware");

const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
} = require("../controllers/wishlistController");


// ========================================================
// GET USER WISHLIST
// ========================================================

router.get(
    "/",
    (req, res, next) => {

        console.log("================================");
        console.log("WISHLIST ROUTE REACHED");
        console.log("================================");

        next();
    },
    authenticate,
    getWishlist
);


// ========================================================
// CHECK IF PRODUCT IS WISHLISTED
// ========================================================

router.get(
    "/check/:productId",
    authenticate,
    checkWishlist
);


// ========================================================
// ADD PRODUCT
// ========================================================

router.post(
    "/:productId",
    authenticate,
    addToWishlist
);


// ========================================================
// REMOVE PRODUCT
// ========================================================

router.delete(
    "/:productId",
    authenticate,
    removeFromWishlist
);


module.exports = router;