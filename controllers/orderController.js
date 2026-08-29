const orderService = require("../services/orderService");

// Create Order
// ============================================================
// CREATE ORDER
// ============================================================

exports.createOrder = async (req, res) => {

    try {

        const result =
            await orderService.createOrder(
                req.user.id,
                req.body
            );


        // ====================================================
        // EXISTING ORDER - CART DID NOT CHANGE
        // ====================================================

        if (
            result.existingOrder &&
            !result.cartChanged
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "You already have a pending order awaiting payment.",

                existingOrder:
                    true,

                cartChanged:
                    false,

                data:
                    result.order

            });

        }


        // ====================================================
        // NEW ORDER
        // ====================================================

        return res.status(201).json({

            success: true,

            message:
                result.cartChanged
                    ? "Your cart changed. A new order has been created."
                    : "Order created successfully.",

            existingOrder:
                false,

            cartChanged:
                result.cartChanged || false,

            previousOrderId:
                result.previousOrderId || null,

            data:
                result.order

        });

    }
    catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

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
// ============================================================
// GET ALL ORDERS - ADMIN
// ============================================================

exports.getAllOrders = async (req, res) => {

    try {

        const {

            page = 1,

            limit = 10,

            search = "",

            status = "",

            payment_status = ""

        } = req.query;


        const result =
            await orderService.getAllOrders({

                page,

                limit,

                search,

                order_status: status,

                payment_status

            });


        return res.status(200).json({

            success: true,

            data:
                result.data,

            total:
                result.total,

            page:
                result.page,

            limit:
                result.limit,

            totalPages:
                result.totalPages

        });

    }
    catch (error) {

        console.error(
            "GET ALL ORDERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

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