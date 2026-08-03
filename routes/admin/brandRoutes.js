const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validate");

const brandController = require("../../controllers/brandController");

const {
    createBrandValidator
} = require("../../validators/brandValidator");

// Create Brand
router.post(
    "/",
    authenticate,
    authorize("admin", "manager"),
    createBrandValidator,
    validate,
    brandController.createBrand
);

// Update Brand
router.put(
    "/:id",
    authenticate,
    authorize("admin", "manager"),
    brandController.updateBrand
);

// Delete Brand
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    brandController.deleteBrand
);

module.exports = router;