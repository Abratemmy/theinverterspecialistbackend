const {
    Order,
    OrderItem,
    Cart,
    CartItem,
    Product,
    User,
    ProductMedia,
    ShippingAddress,
    Payment
} = require("../models");

const notificationService =
    require("./notificationService");

const sequelize = require("../config/database");


// ============================================================
// GENERATE ORDER NUMBER
// ============================================================

const generateOrderNumber = () => {

    const timestamp = Date.now();

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `TIS-${timestamp}-${random}`;
};


// ============================================================
// CREATE ORDER
// ============================================================

exports.createOrder = async (
    userId,
    data
) => {

    const transaction =
        await sequelize.transaction();

    try {

        // ====================================================
        // VALIDATE FULFILLMENT METHOD
        // ====================================================

        const fulfillmentMethod =
            data.fulfillment_method;

        if (
            ![
                "shipping",
                "pickup"
            ].includes(
                fulfillmentMethod
            )
        ) {

            throw new Error(
                "Invalid fulfillment method."
            );

        }


        // ====================================================
        // VERIFY SHIPPING ADDRESS
        // ====================================================

        let address = null;

        if (
            fulfillmentMethod ===
            "shipping"
        ) {

            if (
                !data.shipping_address_id
            ) {

                throw new Error(
                    "Shipping address is required."
                );

            }


            address =
                await ShippingAddress.findOne({

                    where: {

                        id:
                            data.shipping_address_id,

                        user_id:
                            userId

                    },

                    transaction

                });


            if (!address) {

                throw new Error(
                    "Shipping address not found."
                );

            }

        }


        // ====================================================
        // FIND ACTIVE CART
        // ====================================================

        const cart =
            await Cart.findOne({

                where: {

                    user_id:
                        userId,

                    status:
                        "active"

                },

                transaction

            });


        if (!cart) {

            throw new Error(
                "No active cart found."
            );

        }


        // ====================================================
        // GET CURRENT CART ITEMS
        // ====================================================

        const cartItems =
            await CartItem.findAll({

                where: {

                    cart_id:
                        cart.id

                },

                include: [

                    {

                        model:
                            Product,

                        as:
                            "product"

                    }

                ],

                order: [

                    [
                        "id",
                        "ASC"
                    ]

                ],

                transaction

            });


        if (
            cartItems.length === 0
        ) {

            throw new Error(
                "Your cart is empty."
            );

        }


        // ====================================================
        // CALCULATE CURRENT CART TOTALS
        //
        // IMPORTANT:
        // Always calculate this from the CURRENT cart.
        // Never use the previous order's amount.
        // ====================================================

        let subtotal = 0;

        let discount = 0;


        for (
            const item
            of cartItems
        ) {

            subtotal +=
                Number(
                    item.total_price
                );


            discount +=
                Number(
                    item.discount_amount || 0
                );

        }


        // ====================================================
        // SHIPPING / TAX
        // ====================================================

        const shippingFee = 0;

        // VAT = 7.5% of the order subtotal
        const VAT_RATE = 0.075;

        const tax =
            subtotal * VAT_RATE;


        // ====================================================
        // CURRENT TOTAL
        // ====================================================

        const totalAmount =
            subtotal +
            shippingFee +
            tax;


        if (
            totalAmount <= 0
        ) {

            throw new Error(
                "Order total must be greater than zero."
            );

        }


        // ====================================================
        // FIND PREVIOUS PENDING ORDER
        // ====================================================

        const existingPendingOrder =
            await Order.findOne({

                where: {

                    user_id:
                        userId,

                    cart_id:
                        cart.id,

                    payment_status:
                        "pending",

                    order_status:
                        "pending"

                },

                include: [

                    {

                        model:
                            OrderItem,

                        as:
                            "items"

                    }

                ],

                order: [

                    [
                        "created_at",
                        "DESC"
                    ]

                ],

                transaction

            });


        // ====================================================
        // CHECK WHETHER CURRENT CART MATCHES
        // EXISTING PENDING ORDER
        // ====================================================

        let cartIsUnchanged = false;


        if (
            existingPendingOrder
        ) {

            const oldItems =
                existingPendingOrder.items || [];


            // ------------------------------------------------
            // Different number of products
            // ------------------------------------------------

            if (
                oldItems.length ===
                cartItems.length
            ) {

                cartIsUnchanged = true;


                // --------------------------------------------
                // Compare every cart item against
                // the previous order snapshot.
                // --------------------------------------------

                for (
                    const cartItem
                    of cartItems
                ) {

                    const orderItem =
                        oldItems.find(
                            (item) =>
                                Number(
                                    item.product_id
                                ) ===
                                Number(
                                    cartItem.product_id
                                )
                        );


                    // Product was added/removed
                    if (
                        !orderItem
                    ) {

                        cartIsUnchanged =
                            false;

                        break;

                    }


                    // Quantity changed
                    if (
                        Number(
                            orderItem.quantity
                        ) !==
                        Number(
                            cartItem.quantity
                        )
                    ) {

                        cartIsUnchanged =
                            false;

                        break;

                    }


                    // Unit price changed
                    if (
                        Number(
                            orderItem.unit_price
                        ) !==
                        Number(
                            cartItem.unit_price
                        )
                    ) {

                        cartIsUnchanged =
                            false;

                        break;

                    }


                    // Discount changed
                    if (
                        Number(
                            orderItem.discount
                        ) !==
                        Number(
                            cartItem.discount_amount
                        )
                    ) {

                        cartIsUnchanged =
                            false;

                        break;

                    }


                    // Item total changed
                    if (
                        Number(
                            orderItem.total_price
                        ) !==
                        Number(
                            cartItem.total_price
                        )
                    ) {

                        cartIsUnchanged =
                            false;

                        break;

                    }

                }

            }


            // ------------------------------------------------
            // Compare order total
            // ------------------------------------------------

            if (
                Number(
                    existingPendingOrder.total_amount
                ) !==
                Number(
                    totalAmount
                )
            ) {

                cartIsUnchanged =
                    false;

            }


            // ------------------------------------------------
            // Compare fulfillment method
            // ------------------------------------------------

            if (
                existingPendingOrder.fulfillment_method !==
                fulfillmentMethod
            ) {

                cartIsUnchanged =
                    false;

            }


            // ------------------------------------------------
            // Compare shipping address
            // ------------------------------------------------

            const oldAddressId =
                existingPendingOrder.shipping_address_id
                    ? Number(
                        existingPendingOrder.shipping_address_id
                    )
                    : null;


            const newAddressId =
                fulfillmentMethod === "shipping"
                    ? Number(
                        data.shipping_address_id
                    )
                    : null;


            if (
                oldAddressId !==
                newAddressId
            ) {

                cartIsUnchanged =
                    false;

            }

        }


        // ====================================================
        // CASE 1:
        //
        // EXISTING ORDER + CART HAS NOT CHANGED
        //
        // Reuse the existing order.
        // ====================================================

        if (
            existingPendingOrder &&
            cartIsUnchanged
        ) {

            await transaction.commit();


            return {

                existingOrder:
                    true,

                cartChanged:
                    false,

                order:
                    existingPendingOrder

            };

        }


        // ====================================================
        // CASE 2:
        //
        // EXISTING ORDER + CART HAS CHANGED
        //
        // Cancel the old order and create a new one.
        // ====================================================

        if (
            existingPendingOrder &&
            !cartIsUnchanged
        ) {

            // ------------------------------------------------
            // Cancel previous order
            // ------------------------------------------------

            existingPendingOrder.order_status =
                "cancelled";


            await existingPendingOrder.save({

                transaction

            });


            // ------------------------------------------------
            // Cancel previous pending payment
            // ------------------------------------------------

            await Payment.update(

                {

                    status:
                        "cancelled"

                },

                {

                    where: {

                        order_id:
                            existingPendingOrder.id,

                        user_id:
                            userId,

                        status:
                            "pending"

                    },

                    transaction

                }

            );

        }


        // ====================================================
        // CREATE NEW ORDER
        // ====================================================

        const order =
            await Order.create({

                order_number:
                    generateOrderNumber(),

                user_id:
                    userId,

                cart_id:
                    cart.id,

                fulfillment_method:
                    fulfillmentMethod,

                shipping_address_id:
                    fulfillmentMethod ===
                    "shipping"

                        ? data.shipping_address_id

                        : null,

                subtotal,

                shipping_fee:
                    shippingFee,

                discount,

                tax,

                total_amount:
                    totalAmount,

                payment_status:
                    "pending",

                order_status:
                    "pending",

                notes:
                    data.notes ||
                    null

            }, {

                transaction

            });

        // ----------------------------------------------------
        // Notify admins and managers about new order
        // ----------------------------------------------------

        const staffUsers =
            await User.findAll({

                where: {
                    role: [
                        "admin",
                        "manager"
                    ],

                    status: "active"
                },

                attributes: [
                    "id"
                ]

            });


        for (const staff of staffUsers) {

            await notificationService.createNotification({

                user_id:
                    staff.id,

                title:
                    "New Order Received",

                message:
                    `A new order ${order.order_number} has been placed.`,

                type:
                    "order"

            });

        }


        // ====================================================
        // COPY CURRENT CART INTO ORDER ITEMS
        //
        // This creates the NEW order snapshot.
        // ====================================================

        for (
            const item
            of cartItems
        ) {

            await OrderItem.create({

                order_id:
                    order.id,

                product_id:
                    item.product_id,

                quantity:
                    item.quantity,

                unit_price:
                    item.unit_price,

                discount:
                    item.discount_amount || 0,

                total_price:
                    item.total_price

            }, {

                transaction

            });

        }


        // ====================================================
        // DO NOT CLOSE CART
        //
        // Cart remains active until payment succeeds.
        // ====================================================


        await transaction.commit();


        // ====================================================
        // RETURN NEW ORDER
        // ====================================================

        return {

            existingOrder:
                false,

            cartChanged:
                Boolean(
                    existingPendingOrder
                ),

            previousOrderId:
                existingPendingOrder
                    ? existingPendingOrder.id
                    : null,

            order

        };

    }
    catch (error) {

        await transaction.rollback();

        throw error;

    }

};

// ============================================================
// GET MY ORDERS
// ============================================================

// ============================================================
// GET MY ORDERS
// ============================================================

exports.getMyOrders = async (userId) => {

    return await Order.findAll({

        where: {

            user_id:
                userId

        },

        include: [

            // ====================================================
            // ORDER ITEMS
            // ====================================================

            {

                model:
                    OrderItem,

                as:
                    "items",

                include: [

                    // ====================================================
                    // PRODUCT
                    // ====================================================

                    {

                        model:
                            Product,

                        as:
                            "product",

                        attributes: [

                            "id",

                            "name",

                            "slug",

                            "price",

                            "discount_price"

                        ],

                        include: [

                            // ====================================================
                            // PRODUCT MEDIA
                            // ====================================================

                            {

                                model:
                                    ProductMedia,

                                as:
                                    "media",

                                attributes: [

                                    "id",

                                    "media_type",

                                    "media_url",

                                    "thumbnail_url",

                                    "alt_text",

                                    "is_primary",

                                    "display_order"

                                ],

                                order: [

                                    [
                                        "is_primary",
                                        "DESC"
                                    ],

                                    [
                                        "display_order",
                                        "ASC"
                                    ]

                                ]

                            }

                        ]

                    }

                ]

            }

        ],

        order: [

            [
                "created_at",
                "DESC"
            ]

        ]

    });

};


// ============================================================
// GET MY ORDER DETAILS
// ============================================================

exports.getOrder = async (
    id,
    userId
) => {

    const order =
        await Order.findOne({

            where: {

                id,

                user_id:
                    userId

            },

            include: [

                {

                    model:
                        OrderItem,

                    as:
                        "items",

                    include: [

                        {

                            model:
                                Product,

                            as:
                                "product",

                            include: [

                                {

                                    model:
                                        ProductMedia,

                                    as:
                                        "media"

                                }

                            ]

                        }

                    ]

                },

                {

                    model:
                        ShippingAddress,

                    as:
                        "shippingAddress"

                }

            ]

        });


    if (!order) {

        throw new Error(
            "Order not found."
        );

    }


    return order;

};


// ============================================================
// GET ALL ORDERS - ADMIN
// ============================================================

// ============================================================
// GET ALL ORDERS - ADMIN
// ============================================================

exports.getAllOrders = async ({
    page = 1,
    limit = 10,
    search = "",
    order_status = "",
    payment_status = ""
} = {}) => {

    const { Op } = require("sequelize");

    const offset =
        (Number(page) - 1) *
        Number(limit);


    // ========================================================
    // BUILD WHERE CONDITION
    // ========================================================

    const where = {};


    // ========================================================
    // ORDER STATUS FILTER
    // ========================================================

    if (order_status) {

        where.order_status =
            order_status;

    }


    // ========================================================
    // PAYMENT STATUS FILTER
    // ========================================================

    if (payment_status) {

        where.payment_status =
            payment_status;

    }


    // ========================================================
    // SEARCH
    // ========================================================

    if (search) {

        where.order_number = {

            [Op.like]:
                `%${search}%`

        };

    }


    // ========================================================
    // GET ORDERS
    // ========================================================

    const {
        count,
        rows
    } = await Order.findAndCountAll({

        where,

        // IMPORTANT:
        // Prevent Sequelize from counting the same
        // order multiple times because of nested includes.
        distinct: true,

        include: [

            // =================================================
            // ORDER ITEMS
            // =================================================
            {
                model: User,

                as: "user",

                attributes: [
                    "id",
                    "first_name",
                    "last_name",
                    "email",
                    "phone"
                ]

            },

            {

                model:
                    OrderItem,

                as:
                    "items",

                include: [

                    {

                        model:
                            Product,

                        as:
                            "product",

                        include: [

                            {

                                model:
                                    ProductMedia,

                                as:
                                    "media"

                            }

                        ]

                    }

                ]

            },


            // =================================================
            // SHIPPING ADDRESS
            // =================================================

            {

                model:
                    ShippingAddress,

                as:
                    "shippingAddress"

            }

        ],

        order: [

            [

                "created_at",

                "DESC"

            ]

        ],

        limit:
            Number(limit),

        offset

    });


    // ========================================================
    // RETURN PAGINATED RESULT
    // ========================================================

    return {

        data:
            rows,

        total:
            count,

        page:
            Number(page),

        limit:
            Number(limit),

        totalPages:
            Math.ceil(
                count /
                Number(limit)
            )

    };

};


// ============================================================
// GET SINGLE ORDER - ADMIN
// ============================================================

exports.getAdminOrder = async (
    id
) => {

    const order =
        await Order.findByPk(

            id,

            {

                include: [
                     {
                        model: User,

                        as: "user",

                        attributes: [
                            "id",
                            "first_name",
                            "last_name",
                            "email",
                            "phone"
                        ]

                    },

                    {

                        model:
                            OrderItem,

                        as:
                            "items",

                        include: [

                            {

                                model:
                                    Product,

                                as:
                                    "product",

                                include: [

                                    {

                                        model:
                                            ProductMedia,

                                        as:
                                            "media"

                                    }

                                ]

                            }

                        ]

                    },

                    {

                        model:
                            ShippingAddress,

                        as:
                            "shippingAddress"

                    }

                ]

            }

        );


    if (!order) {

        throw new Error(
            "Order not found."
        );

    }


    return order;

};


// ============================================================
// CANCEL ORDER
// ============================================================

exports.cancelOrder = async (
    id,
    userId
) => {

    const transaction =
        await sequelize.transaction();

    try {

        const order =
            await Order.findOne({

                where: {

                    id,

                    user_id:
                        userId

                },

                transaction

            });


        if (!order) {

            throw new Error(
                "Order not found."
            );

        }


        // ====================================================
        // ONLY PENDING ORDERS
        // ====================================================

        if (
            order.order_status !==
            "pending"
        ) {

            throw new Error(
                "Only pending orders can be cancelled."
            );

        }


        // ====================================================
        // CANCEL ORDER
        // ====================================================

        order.order_status =
            "cancelled";


        await order.save({
            transaction
        });


        // ====================================================
        // CANCEL PENDING PAYMENT
        // ====================================================

        await Payment.update(

            {

                status:
                    "cancelled"

            },

            {

                where: {

                    order_id:
                        order.id,

                    user_id:
                        userId,

                    status:
                        "pending"

                },

                transaction

            }

        );


        await transaction.commit();


        return order;

    }
    catch (error) {

        await transaction.rollback();

        throw error;

    }

};


// ============================================================
// UPDATE ORDER STATUS - ADMIN
// ============================================================

exports.updateOrderStatus = async (
    id,
    status
) => {

    const allowedStatuses = [

        "pending",

        "processing",

        "packed",

        "shipped",

        "out_for_delivery",

        "delivered",

        "cancelled"

    ];


    if (
        !allowedStatuses.includes(
            status
        )
    ) {

        throw new Error(
            "Invalid order status."
        );

    }


    const order =
        await Order.findByPk(id);


    if (!order) {

        throw new Error(
            "Order not found."
        );

    }


    order.order_status =
        status;


    await order.save();


    return order;

};