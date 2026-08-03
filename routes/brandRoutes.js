const express = require("express");
const router = express.Router();

const brandController = require("../controllers/brandController");

// Public Routes
router.get("/", brandController.getBrands);

router.get("/:slug", brandController.getBrandBySlug);

module.exports = router;