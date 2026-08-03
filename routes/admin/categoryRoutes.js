const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");

const validate = require("../../middleware/validate");

const categoryController = require("../../controllers/categoryController");

const {
    createCategoryValidator
} = require("../../validators/categoryValidator");

// Create Category
router.post(
    "/",
    authenticate,
    authorize("admin", "manager"),
    createCategoryValidator,
    validate,
    categoryController.createCategory
);

// Update Category
router.put(
    "/:id",
    authenticate,
    authorize("admin", "manager"),
    categoryController.updateCategory
);

// Delete Category
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    categoryController.deleteCategory
);

module.exports = router;