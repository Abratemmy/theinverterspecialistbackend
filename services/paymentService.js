const Payment = require("../models/Payment");
const Order = require("../models/Order");
const User = require("../models/User");

const sequelize = require("../config/database");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const paystack = require("../utils/paystack");

exports.initializePayment = async (orderId, userId) => {

    // Find the order
    const order = await Order.findOne({
        where: {
            id: orderId,
            user_id: userId
        }
    });

    if (!order) {
        throw new Error("Order not found.");
    }

    if (order.payment_status === "paid") {
        throw new Error("This order has already been paid.");
    }

    // Find the customer
    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error("User not found.");
    }

     // Check for existing pending payment
    const existingPayment = await Payment.findOne({
        where: {
            order_id: order.id,
            status: "pending"
        }
    });

    if (existingPayment) {

        try {

            // Verify existing payment with Paystack
            const verifyResponse = await paystack.get(
                `/transaction/verify/${existingPayment.payment_reference}`
            );

            const paymentStatus = verifyResponse.data.data.status;

            // Already paid
            if (paymentStatus === "success") {

                order.payment_status = "paid";
                order.order_status = "processing";

                await order.save();

                existingPayment.status = "successful";
                existingPayment.gateway_transaction_id =
                    verifyResponse.data.data.id;

                existingPayment.gateway_response =
                    JSON.stringify(verifyResponse.data.data);

                existingPayment.paid_at =
                    verifyResponse.data.data.paid_at;

                await existingPayment.save();
                return {
                    alreadyPaid: true,
                    message: "This order has already been paid."
                };

            }

            // Previous payment wasn't successful
            existingPayment.status = "cancelled";

            await existingPayment.save();

        } catch (error) {

            // If Paystack cannot verify it,
            // just cancel the old payment and continue.

            if (existingPayment.status === "pending") {

                existingPayment.status = "cancelled";

                await existingPayment.save();

            }

        }

    }

    // Generate unique reference
    const reference = `INV-${Date.now()}`;

    console.log("====== PAYSTACK REQUEST ======");
    console.log({
        email: user.email,
        amount: Number(order.total_amount) * 100,
        reference,
        callback_url: process.env.PAYSTACK_CALLBACK_URL
    });

   try {

    const response = await paystack.post(
        "/transaction/initialize",
        {
            email: user.email,
            amount: Number(order.total_amount) * 100,
            reference,
            callback_url: process.env.PAYSTACK_CALLBACK_URL
        }
    );

    console.log("====== PAYSTACK RESPONSE ======");
    console.log(response.data);

    // Save pending payment ONLY after Paystack succeeds
    await Payment.create({
        order_id: order.id,
        user_id: user.id,
        payment_reference: reference,
        amount: order.total_amount,
        status: "pending"
    });

    return response.data.data;

    } catch (error) {

        console.log("====== PAYSTACK ERROR ======");

        console.log(error.response?.data);

        throw new Error(
            error.response?.data?.message ||
            error.message
        );

    }
};

exports.verifyPayment = async (reference) => {

    const transaction = await sequelize.transaction();

    try {

        // Find payment record
        const payment = await Payment.findOne({
            where: {
                payment_reference: reference
            },
            transaction
        });

        if (!payment) {
            throw new Error("Payment record not found.");
        }

        // If payment already processed, return immediately
        if (payment.status === "successful") {

            await transaction.rollback();

            return {
                alreadyVerified: true,
                payment
            };

        }

        // Verify transaction with Paystack
        const response = await paystack.get(
            `/transaction/verify/${reference}`
        );

        const paymentData = response.data.data;

        // Payment failed or abandoned
        if (paymentData.status !== "success") {

            payment.status = "failed";

            payment.gateway_response =
                JSON.stringify(paymentData);

            await payment.save({ transaction });

            await transaction.commit();

            return {
                alreadyVerified: false,
                payment
            };

        }

        // -----------------------------
        // PAYMENT SUCCESSFUL
        // -----------------------------

        payment.status = "successful";

        payment.gateway_transaction_id =
            paymentData.id;

        payment.gateway_response =
            JSON.stringify(paymentData);

        payment.paid_at =
            new Date(paymentData.paid_at);

        await payment.save({ transaction });

        // Get Order
        const order = await Order.findByPk(
            payment.order_id,
            { transaction }
        );

        if (!order) {
            throw new Error("Order not found.");
        }

        // Update order only once
        if (order.payment_status !== "paid") {

            order.payment_status = "paid";

            order.order_status = "processing";

            await order.save({ transaction });

        }

        // Get ordered items
        const orderItems = await OrderItem.findAll({

            where: {
                order_id: order.id
            },

            transaction

        });

        // Reduce stock
        for (const item of orderItems) {

            const product = await Product.findByPk(
                item.product_id,
                { transaction }
            );

            if (!product) {

                throw new Error(
                    `Product ID ${item.product_id} not found.`
                );

            }

            // Prevent negative stock
            if (product.quantity < item.quantity) {

                throw new Error(
                    `${product.name} no longer has enough stock.`
                );

            }

            product.quantity =
                product.quantity - item.quantity;

            await product.save({ transaction });

        }

        // Checkout customer's active cart
        const cart = await Cart.findOne({

            where: {

                user_id: order.user_id,

                status: "active"

            },

            transaction

        });

        if (cart) {

            cart.status = "checked_out";

            await cart.save({ transaction });

        }

        await transaction.commit();

        return {

            alreadyVerified: false,

            payment,

            order

        };

    } catch (error) {

        await transaction.rollback();

        throw error;

    }

};

// payment webhook
const crypto = require("crypto");

exports.paystackWebhook = async (signature, payload) => {

    // Verify signature
    const hash = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(payload)
        .digest("hex");

    if (hash !== signature) {
        throw new Error("Invalid Paystack signature.");
    }

    const event = JSON.parse(payload);

    // Only process successful payments
    if (event.event !== "charge.success") {
        return;
    }

    const reference = event.data.reference;

    // Find payment
    const payment = await Payment.findOne({

        where: {
            payment_reference: reference
        }

    });

    if (!payment) {
        throw new Error("Payment not found.");
    }

    // Already processed?
    if (payment.status === "successful") {
        return;
    }

    // Update payment
    payment.status = "successful";
    payment.gateway_transaction_id = event.data.id;
    payment.gateway_response = JSON.stringify(event.data);
    payment.paid_at = new Date();

    await payment.save();

    // Find order
    const order = await Order.findByPk(payment.order_id);

    if (!order) {
        throw new Error("Order not found.");
    }

    order.payment_status = "paid";
    order.order_status = "processing";

    await order.save();

    // Reduce stock only once
    if (!order.stock_updated) {

        const items = await OrderItem.findAll({

            where: {
                order_id: order.id
            }

        });

        for (const item of items) {

            const product = await Product.findByPk(item.product_id);

            if (!product) {
                continue;
            }

            product.quantity -= item.quantity;

            await product.save();

        }

        order.stock_updated = true;

        await order.save();

    }

};