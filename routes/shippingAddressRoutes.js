const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const shippingAddressController =
    require("../controllers/shippingAddressController");

const {
    createShippingAddressValidator,
    updateShippingAddressValidator
} = require("../validators/shippingAddressValidator");

// Create
router.post(
    "/",
    authenticate,
    createShippingAddressValidator,
    validate,
    shippingAddressController.createAddress
);

// Get All
router.get(
    "/",
    authenticate,
    shippingAddressController.getAddresses
);

// Get One
router.get(
    "/:id",
    authenticate,
    shippingAddressController.getAddress
);

// Update
router.put(
    "/:id",
    authenticate,
    updateShippingAddressValidator,
    validate,
    shippingAddressController.updateAddress
);

// Delete
router.delete(
    "/:id",
    authenticate,
    shippingAddressController.deleteAddress
);

// Set Default
router.patch(
    "/:id/default",
    authenticate,
    shippingAddressController.setDefaultAddress
);

module.exports = router;