const {
    Order,
    OrderItem,
    Cart,
    CartItem,
    Product,
    ProductMedia,
    ShippingAddress
} = require("../models");

const sequelize = require("../config/database");

// generate an order number randomly
const generateOrderNumber = () => {

    const timestamp = Date.now();

    const random = Math.floor(
        1000 + Math.random() * 9000
    );

    return `TIS-${timestamp}-${random}`;

};

// create an order function
// Create Order
// Create Order
exports.createOrder = async (userId, data) => {

    const transaction = await sequelize.transaction();

    try {

        // ===============================
        // Verify Shipping Address
        // ===============================
        const address = await ShippingAddress.findOne({

            where: {
                id: data.shipping_address_id,
                user_id: userId
            },

            transaction

        });

        if (!address) {
            throw new Error("Shipping address not found.");
        }

        // ===============================
        // Check for Existing Pending Order
        // ===============================
        const pendingOrder = await Order.findOne({

            where: {
                user_id: userId,
                payment_status: "pending",
                order_status: "pending"
            },

            transaction

        });

        if (pendingOrder) {

            await transaction.commit();

            return {
                existingOrder: true,
                order: pendingOrder
            };

        }

        // ===============================
        // Get Active Cart
        // ===============================
        const cart = await Cart.findOne({

            where: {
                user_id: userId,
                status: "active"
            },

            transaction

        });

        if (!cart) {
            throw new Error("No active cart found.");
        }

        // ===============================
        // Get Cart Items
        // ===============================
        const cartItems = await CartItem.findAll({

            where: {
                cart_id: cart.id
            },

            include: [
                {
                    model: Product,
                    as: "product"
                }
            ],

            transaction

        });

        if (cartItems.length === 0) {
            throw new Error("Your cart is empty.");
        }

        // ===============================
        // Calculate Totals
        // ===============================
        let subtotal = 0;
        let discount = 0;

        for (const item of cartItems) {

            subtotal += Number(item.total_price);

            discount += Number(item.discount_amount);

        }

        const shippingFee = 0;
        const tax = 0;

        const totalAmount =
            subtotal +
            shippingFee +
            tax;

        // ===============================
        // Create Order
        // ===============================
        const order = await Order.create({

            order_number: generateOrderNumber(),

            user_id: userId,

            cart_id: cart.id,

            shipping_address_id: data.shipping_address_id,

            subtotal,

            shipping_fee: shippingFee,

            discount,

            tax,

            total_amount: totalAmount,

            notes: data.notes

        }, { transaction });

        // ===============================
        // Copy Cart Items
        // ===============================
        for (const item of cartItems) {

            await OrderItem.create({

                order_id: order.id,

                product_id: item.product_id,

                quantity: item.quantity,

                unit_price: item.unit_price,

                discount: item.discount_amount,

                total_price: item.total_price

            }, { transaction });

        }

        // ===============================
        // Close Cart
        // ===============================
        cart.status = "checked_out";

        await cart.save({ transaction });

        // ===============================
        // Commit Transaction
        // ===============================
        await transaction.commit();

        return {

            existingOrder: false,

            order

        };

    } catch (error) {

        await transaction.rollback();

        throw error;

    }

};


// get order functionality
exports.getMyOrders = async (userId) => {

    return await Order.findAll({

        where: {
            user_id: userId
        },

        order: [
            ["created_at", "DESC"]
        ]

    });

};

// get order details
exports.getOrder = async (id, userId) => {

    const order = await Order.findOne({

        where: {

            id,

            user_id: userId

        },

        include: [

            {
                model: OrderItem,
                as: "items",

                include: [

                    {
                        model: Product,
                        as: "product",

                        include: [

                            {
                                model: ProductMedia,
                                as: "media"
                            }

                        ]

                    }

                ]

            },

            {
                model: ShippingAddress,
                as: "shippingAddress"
            }

        ]

    });

    if (!order) {

        throw new Error("Order not found.");

    }

    return order;

};

// get all orders
exports.getAllOrders = async () => {

    return await Order.findAll({

        include: [

            {
                model: OrderItem,
                as: "items"
            },

            {
                model: ShippingAddress,
                as: "shippingAddress"
            }

        ],

        order: [

            ["created_at", "DESC"]

        ]

    });

};

// get admin order
exports.getAdminOrder = async (id) => {

    const order = await Order.findByPk(id, {

        include: [

            {
                model: OrderItem,
                as: "items",

                include: [

                    {
                        model: Product,
                        as: "product",

                        include: [

                            {
                                model: ProductMedia,
                                as: "media"
                            }

                        ]

                    }

                ]

            },

            {
                model: ShippingAddress,
                as: "shippingAddress"
            }

        ]

    });

    if (!order) {

        throw new Error("Order not found.");

    }

    return order;

};

// cancel order
exports.cancelOrder = async (id, userId) => {

    const order = await Order.findOne({

        where: {

            id,

            user_id: userId

        }

    });

    if (!order) {

        throw new Error("Order not found.");

    }

    if (order.order_status !== "pending") {

        throw new Error(
            "Only pending orders can be cancelled."
        );

    }

    order.order_status = "cancelled";

    await order.save();

    return order;

};

// update order status
exports.updateOrderStatus = async (
    id,
    status
) => {

    const order = await Order.findByPk(id);

    if (!order) {

        throw new Error("Order not found.");

    }

    order.order_status = status;

    await order.save();

    return order;

};