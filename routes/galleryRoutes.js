const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");
const galleryController = require("../controllers/galleryController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


// ==========================================
// PUBLIC ROUTES
// ==========================================

router.get(
    "/",
    galleryController.getGallery
);


// ==========================================
// ADMIN / MANAGER ROUTES
// ==========================================

// Upload image
router.post(
    "/admin",
    protect,
    authorize("admin", "manager"),
    upload.single("image"),
    galleryController.uploadImage
);


// Delete image
router.delete(
    "/admin/:id",
    protect,
    authorize("admin", "manager"),
    galleryController.deleteImage
);


// Update image status
router.patch(
    "/admin/:id/status",
    protect,
    authorize("admin", "manager"),
    galleryController.updateStatus
);

router.get(
    "/admin",
    protect,
    authorize("admin", "manager"),
    galleryController.getAdminGallery
);

module.exports = router;