const shippingAddressService = require("../services/shippingAddressService");

// Create Address
exports.createAddress = async (req, res) => {
    try {

        const address = await shippingAddressService.createAddress(
            req.user.id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Shipping address created successfully.",
            data: address
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

// Get All Addresses
exports.getAddresses = async (req, res) => {
    try {

        const addresses = await shippingAddressService.getAddresses(req.user.id);

        return res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Get Single Address
exports.getAddress = async (req, res) => {
    try {

        const address = await shippingAddressService.getAddress(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            data: address
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });

    }
};

// Update Address
exports.updateAddress = async (req, res) => {
    try {

        const address = await shippingAddressService.updateAddress(
            req.params.id,
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Address updated successfully.",
            data: address
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
    try {

        await shippingAddressService.deleteAddress(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully."
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

// Set Default Address
exports.setDefaultAddress = async (req, res) => {
    try {

        const address = await shippingAddressService.setDefaultAddress(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully.",
            data: address
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};