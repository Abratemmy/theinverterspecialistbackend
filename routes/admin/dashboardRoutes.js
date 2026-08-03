const express = require("express");

const router = express.Router();

const dashboardController =
require("../../controllers/admin/dashboardController");

const protect = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");

// Admin & Manager
router.get(
    "/",
    protect,
    authorize("admin", "manager"),
    dashboardController.getDashboard
);

module.exports = router;