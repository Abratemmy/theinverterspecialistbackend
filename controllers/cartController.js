const cartService = require("../services/cartService");

// Add item
exports.addToCart = async (req, res) => {

    try {

        const item = await cartService.addToCart(
            req.user.id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Product added to cart successfully.",
            data: item
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Get cart
exports.getCart = async (req, res) => {

    try {

        const cart = await cartService.getCart(req.user.id);

        return res.status(200).json({
            success: true,
            data: cart
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Update quantity
exports.updateCartItem = async (req, res) => {

    try {

        const item = await cartService.updateCartItem(
            req.params.itemId,
            req.user.id,
            req.body.quantity
        );

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully.",
            data: item
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Remove item
exports.removeCartItem = async (req, res) => {

    try {

        await cartService.removeCartItem(
            req.params.itemId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Item removed from cart."
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Clear cart
exports.clearCart = async (req, res) => {

    try {

        await cartService.clearCart(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};