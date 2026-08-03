const orderService = require("../services/orderService");

// Create Order
exports.createOrder = async (req, res) => {

    try {

        const result = await orderService.createOrder(
            req.user.id,
            req.body
        );

        return res.status(
            result.existingOrder ? 200 : 201
        ).json({

            success: true,

            message: result.existingOrder
                ? "You already have a pending order awaiting payment."
                : "Order created successfully.",

            data: result.order

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

// Get My Orders
exports.getMyOrders = async (req, res) => {

    try {

        const orders = await orderService.getMyOrders(req.user.id);

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get Order Details
exports.getOrder = async (req, res) => {

    try {

        const order = await orderService.getOrder(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });

    }

};

// Cancel Order
exports.cancelOrder = async (req, res) => {

    try {

        const order = await orderService.cancelOrder(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",
            data: order
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Get All Orders
exports.getAllOrders = async (req, res) => {

    try {

        const orders = await orderService.getAllOrders();

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get Single Order
exports.getAdminOrder = async (req, res) => {

    try {

        const order = await orderService.getAdminOrder(req.params.id);

        return res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });

    }

};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {

    try {

        const order = await orderService.updateOrderStatus(
            req.params.id,
            req.body.order_status
        );

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            data: order
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};