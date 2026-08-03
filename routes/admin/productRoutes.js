const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validate");

const productController = require("../../controllers/productController");

const {
    createProductValidator
} = require("../../validators/productValidator");

// Create Product
router.post(
    "/",
    authenticate,
    authorize("admin", "manager"),
    createProductValidator,
    validate,
    productController.createProduct
);

// Update Product
router.put(
    "/:id",
    authenticate,
    authorize("admin", "manager"),
    productController.updateProduct
);

// Delete Product
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    productController.deleteProduct
);

// Get inactive products
router.get(
    "/inactive",
    authenticate,
    authorize("admin", "manager"),
    productController.getInactiveProducts
);

// Restore product
router.patch(
    "/:id/restore",
    authenticate,
    authorize("admin"),
    productController.restoreProduct
);

// Permanently delete product
router.delete(
    "/:id/permanent",
    authenticate,
    authorize("admin"),
    productController.permanentDeleteProduct
);
module.exports = router;