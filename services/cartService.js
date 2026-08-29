const crypto = require("crypto");

const {
    Cart,
    CartItem,
    Product,
    ProductMedia,
} = require("../models");

const sequelize = require("../config/database");


// ============================================================
// GET OR CREATE CART
// ============================================================

exports.getOrCreateCart = async ({
    userId = null,
    guestToken = null,
}) => {

    // ========================================================
    // LOGGED-IN USER
    // ========================================================

    if (userId) {

        let cart = await Cart.findOne({
            where: {
                user_id: userId,
                status: "active",
            },
        });

        // Create user cart if none exists
        if (!cart) {

            cart = await Cart.create({
                user_id: userId,
                guest_token: null,
                status: "active",
            });

        }

        return {
            cart,
            guestToken: null,
        };
    }


    // ========================================================
    // GUEST WITH TOKEN
    // ========================================================

    if (guestToken) {

        let cart = await Cart.findOne({
            where: {
                guest_token: guestToken,
                user_id: null,
                status: "active",
            },
        });


        // Create guest cart if none exists
        if (!cart) {

            cart = await Cart.create({
                user_id: null,
                guest_token: guestToken,
                status: "active",
            });

        }


        return {
            cart,
            guestToken,
        };
    }


    // ========================================================
    // CREATE NEW GUEST CART
    // ========================================================

    const newGuestToken = crypto.randomUUID();


    const cart = await Cart.create({
        user_id: null,
        guest_token: newGuestToken,
        status: "active",
    });


    return {
        cart,
        guestToken: newGuestToken,
    };
};



// ============================================================
// ADD TO CART
// ============================================================

exports.addToCart = async ({
    userId = null,
    guestToken = null,
    product_id,
    quantity,
}) => {

    // ========================================================
    // VALIDATE PRODUCT
    // ========================================================

    const product = await Product.findOne({
        where: {
            id: product_id,
            status: "active",
        },
    });


    if (!product) {
        throw new Error("Product not found.");
    }


    // ========================================================
    // VALIDATE QUANTITY
    // ========================================================

    quantity = Number(quantity);


    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(
            "Quantity must be a valid number greater than 0."
        );
    }


    // ========================================================
    // CHECK STOCK
    // ========================================================

    const stock = Number(product.quantity);


    if (quantity > stock) {

        throw new Error(
            `Only ${stock} item(s) available in stock.`
        );

    }


    // ========================================================
    // DETERMINE SELLING PRICE
    // ========================================================

    const originalPrice = Number(product.price);

    const discountPrice = Number(product.discount_price);


    const hasDiscount =
        discountPrice > 0 &&
        discountPrice < originalPrice;


    const sellingPrice =
        hasDiscount
            ? discountPrice
            : originalPrice;


    // ========================================================
    // GET / CREATE CART
    // ========================================================

    const {
        cart,
        guestToken: returnedGuestToken,
    } = await exports.getOrCreateCart({
        userId,
        guestToken,
    });


    // ========================================================
    // FIND EXISTING ITEM
    // ========================================================

    let item = await CartItem.findOne({
        where: {
            cart_id: cart.id,
            product_id,
        },
    });


    // ========================================================
    // EXISTING ITEM
    // ========================================================

    if (item) {

        const newQuantity =
            Number(item.quantity) + quantity;


        if (newQuantity > stock) {

            throw new Error(
                `Only ${stock} item(s) available in stock.`
            );

        }


        item.quantity = newQuantity;

        item.unit_price = sellingPrice;

        // The discount is already reflected
        // inside unit_price.
        item.discount_amount = 0;

        item.total_price =
            sellingPrice * newQuantity;


        await item.save();


        return {
            item,
            guestToken: returnedGuestToken,
            message:
                `Product is already in your cart. Quantity updated to ${newQuantity}.`,
        };
    }


    // ========================================================
    // NEW ITEM
    // ========================================================

    const totalPrice =
        sellingPrice * quantity;


    item = await CartItem.create({

        cart_id: cart.id,

        product_id,

        quantity,

        unit_price: sellingPrice,

        // No second discount.
        discount_amount: 0,

        total_price: totalPrice,

    });


    return {

        item,

        guestToken:
            returnedGuestToken,

        message:
            "Product added to cart successfully.",

    };
};



// ============================================================
// GET CART
// ============================================================

exports.getCart = async ({
    userId = null,
    guestToken = null,
}) => {

    // ========================================================
    // GET CART
    // ========================================================

    const {
        cart,
        guestToken: returnedGuestToken,
    } = await exports.getOrCreateCart({
        userId,
        guestToken,
    });


    // ========================================================
    // LOAD CART WITH ITEMS
    // ========================================================

    const fullCart = await Cart.findByPk(
        cart.id,
        {
            include: [
                {
                    model: CartItem,
                    as: "items",

                    include: [
                        {
                            model: Product,
                            as: "product",

                            include: [
                                {
                                    model: ProductMedia,
                                    as: "media",
                                },
                            ],
                        },
                    ],
                },
            ],
        }
    );


    if (!fullCart) {

        return {

            cart: {
                cart_id: cart.id,
                total_items: 0,
                subtotal: 0,
                discount: 0,
                grand_total: 0,
                items: [],
            },

            guestToken:
                returnedGuestToken,

        };
    }


    // ========================================================
    // CALCULATE CART
    // ========================================================

    let subtotal = 0;

    let totalItems = 0;


    const items = fullCart.items.map((item) => {

        subtotal += Number(item.total_price);

        totalItems += Number(item.quantity);


        const product =
            item.product?.toJSON?.() ??
            item.product;


        const primaryImage =
            product?.media?.find(
                (media) =>
                    media.media_type === "image" &&
                    Boolean(media.is_primary)
            )?.media_url || null;


        return {

            ...item.toJSON(),

            product: {

                ...product,

                primaryImage,

            },

        };
    });


    // ========================================================
    // RETURN
    // ========================================================

    return {

        cart: {

            cart_id:
                fullCart.id,

            total_items:
                totalItems,

            subtotal,

            // Discount is already reflected
            // in unit_price.
            discount: 0,

            grand_total:
                subtotal,

            items,

        },

        guestToken:
            returnedGuestToken,

    };
};



// ============================================================
// UPDATE CART ITEM
// ============================================================

exports.updateCartItem = async ({
    itemId,
    userId = null,
    guestToken = null,
    quantity,
}) => {

    console.log("=================================");
    console.log("UPDATE CART ITEM");
    console.log("itemId:", itemId);
    console.log("userId:", userId);
    console.log("guestToken:", guestToken);
    console.log("quantity:", quantity);
    console.log("=================================");


    /* ========================================================
       VALIDATE ITEM ID
    ======================================================== */

    const parsedItemId =
        Number(itemId);

    if (
        !Number.isInteger(parsedItemId) ||
        parsedItemId <= 0
    ) {

        throw new Error(
            "Invalid cart item ID."
        );

    }


    /* ========================================================
       VALIDATE QUANTITY
    ======================================================== */

    const parsedQuantity =
        Number(quantity);

    if (
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1
    ) {

        throw new Error(
            "Quantity must be a whole number greater than 0."
        );

    }


    /* ========================================================
       FIND CART ITEM
    ======================================================== */

    const item =
        await CartItem.findByPk(
            parsedItemId,
            {
                include: [
                    {
                        model: Cart,
                        as: "cart",
                    },
                ],
            }
        );


    if (!item) {

        throw new Error(
            "Cart item not found."
        );

    }


    /* ========================================================
       GET CART
    ======================================================== */

    const cart =
        item.cart;


    if (!cart) {

        throw new Error(
            "Cart not found."
        );

    }


    console.log(
        "Cart ID:",
        cart.id
    );

    console.log(
        "Cart user_id:",
        cart.user_id
    );

    console.log(
        "Cart guest_token:",
        cart.guest_token
    );


    /* ========================================================
       VERIFY OWNERSHIP
    ======================================================== */

    if (userId) {

        if (
            Number(cart.user_id) !==
            Number(userId)
        ) {

            throw new Error(
                "You are not authorized to update this cart."
            );

        }

    } else {

        if (!guestToken) {

            throw new Error(
                "Guest cart token is missing."
            );

        }

        if (
            cart.guest_token !==
            guestToken
        ) {

            throw new Error(
                "You are not authorized to update this guest cart."
            );

        }

    }


    /* ========================================================
       VERIFY CART IS ACTIVE
    ======================================================== */

    if (
        cart.status !==
        "active"
    ) {

        throw new Error(
            "This cart is no longer active."
        );

    }


    /* ========================================================
       GET PRODUCT
    ======================================================== */

    const product =
        await Product.findOne({

            where: {

                id:
                    item.product_id,

                status:
                    "active",

            },

        });


    if (!product) {

        throw new Error(
            "Product is no longer available."
        );

    }


    /* ========================================================
       CHECK STOCK
    ======================================================== */

    const stock =
        Number(product.quantity);


    if (
        parsedQuantity >
        stock
    ) {

        throw new Error(
            `Only ${stock} item(s) available in stock.`
        );

    }


    /* ========================================================
       DETERMINE SELLING PRICE
    ======================================================== */

    const originalPrice =
        Number(product.price);


    const discountPrice =
        Number(product.discount_price);


    const hasDiscount =
        Number.isFinite(discountPrice) &&
        discountPrice > 0 &&
        discountPrice < originalPrice;


    const sellingPrice =
        hasDiscount
            ? discountPrice
            : originalPrice;


    /* ========================================================
       UPDATE
    ======================================================== */

    item.quantity =
        parsedQuantity;


    item.unit_price =
        sellingPrice;


    // IMPORTANT:
    // The discount is already reflected
    // in unit_price.
    item.discount_amount =
        0;


    item.total_price =
        sellingPrice *
        parsedQuantity;


    await item.save();


    console.log(
        "UPDATED ITEM:",
        item.toJSON()
    );


    return item;
};



// ============================================================
// REMOVE CART ITEM
// ============================================================

exports.removeCartItem = async ({
    userId = null,
    guestToken = null,
    itemId,
}) => {

    const item = await CartItem.findByPk(
        itemId,
        {
            include: [
                {
                    model: Cart,
                    as: "cart",
                },
            ],
        }
    );


    if (!item) {

        throw new Error(
            "Cart item not found."
        );

    }


    const cart = item.cart;


    if (!cart) {

        throw new Error(
            "Cart not found."
        );

    }


    // ========================================================
    // VERIFY OWNERSHIP
    // ========================================================

    if (userId) {

        if (
            !cart.user_id ||
            Number(cart.user_id) !== Number(userId)
        ) {

            throw new Error(
                "Unauthorized."
            );

        }

    } else {

        if (
            cart.user_id !== null ||
            !guestToken ||
            cart.guest_token !== guestToken
        ) {

            throw new Error(
                "Unauthorized."
            );

        }

    }


    if (cart.status !== "active") {

        throw new Error(
            "This cart is no longer active."
        );

    }


    await item.destroy();


    return true;
};



// ============================================================
// CLEAR CART
// ============================================================

exports.clearCart = async ({
    userId = null,
    guestToken = null,
}) => {

    const {
        cart,
    } = await exports.getOrCreateCart({
        userId,
        guestToken,
    });


    await CartItem.destroy({
        where: {
            cart_id: cart.id,
        },
    });


    return true;
};



// ============================================================
// MERGE GUEST CART INTO USER CART
// ============================================================

exports.mergeGuestCartIntoUserCart = async ({
    userId,
    guestToken,
}) => {

    if (!userId || !guestToken) {
        return null;
    }


    const transaction =
        await sequelize.transaction();


    try {

        console.log(
            "================================="
        );

        console.log(
            "MERGING GUEST CART"
        );

        console.log(
            "USER ID:",
            userId
        );

        console.log(
            "GUEST TOKEN:",
            guestToken
        );

        console.log(
            "================================="
        );


        // ====================================================
        // FIND GUEST CART
        // ====================================================

        const guestCart =
            await Cart.findOne({

                where: {

                    guest_token:
                        guestToken,

                    user_id:
                        null,

                    status:
                        "active",

                },

                transaction,

                lock:
                    transaction.LOCK.UPDATE,

            });


        if (!guestCart) {

            console.log(
                "No active guest cart found."
            );

            await transaction.commit();

            return null;
        }


        // ====================================================
        // GET GUEST ITEMS
        // ====================================================

        const guestItems =
            await CartItem.findAll({

                where: {

                    cart_id:
                        guestCart.id,

                },

                transaction,

            });


        console.log(
            "Guest cart:",
            guestCart.id
        );

        console.log(
            "Guest items:",
            guestItems.length
        );


        // ====================================================
        // FIND USER CART
        // ====================================================

        let userCart =
            await Cart.findOne({

                where: {

                    user_id:
                        userId,

                    status:
                        "active",

                },

                transaction,

                lock:
                    transaction.LOCK.UPDATE,

            });


        // ====================================================
        // CREATE USER CART
        // ====================================================

        if (!userCart) {

            userCart =
                await Cart.create(

                    {

                        user_id:
                            userId,

                        guest_token:
                            null,

                        status:
                            "active",

                    },

                    {
                        transaction,
                    }

                );

        }


        console.log(
            "User cart:",
            userCart.id
        );


        // ====================================================
        // MERGE ITEMS
        // ====================================================

        for (
            const guestItem
            of guestItems
        ) {

            const existingItem =
                await CartItem.findOne({

                    where: {

                        cart_id:
                            userCart.id,

                        product_id:
                            guestItem.product_id,

                    },

                    transaction,

                });


            if (existingItem) {

                const newQuantity =
                    Number(
                        existingItem.quantity
                    ) +
                    Number(
                        guestItem.quantity
                    );


                existingItem.quantity =
                    newQuantity;


                existingItem.total_price =
                    Number(
                        existingItem.unit_price
                    ) *
                    newQuantity;


                existingItem.discount_amount =
                    0;


                await existingItem.save({
                    transaction,
                });

            } else {

                await CartItem.create(

                    {

                        cart_id:
                            userCart.id,

                        product_id:
                            guestItem.product_id,

                        quantity:
                            guestItem.quantity,

                        unit_price:
                            guestItem.unit_price,

                        discount_amount:
                            0,

                        total_price:
                            Number(
                                guestItem.unit_price
                            ) *
                            Number(
                                guestItem.quantity
                            ),

                    },

                    {
                        transaction,
                    }

                );

            }

        }


        // ====================================================
        // DELETE GUEST ITEMS
        // ====================================================

        await CartItem.destroy({

            where: {

                cart_id:
                    guestCart.id,

            },

            transaction,

        });


        // ====================================================
        // CLOSE GUEST CART
        // ====================================================

        guestCart.status =
            "checked_out";

        guestCart.guest_token =
            null;


        await guestCart.save({
            transaction,
        });


        // ====================================================
        // COMMIT
        // ====================================================

        await transaction.commit();


        console.log(
            "================================="
        );

        console.log(
            "CART MERGE SUCCESSFUL"
        );

        console.log(
            "USER CART:",
            userCart.id
        );

        console.log(
            "================================="
        );


        return userCart;

    } catch (error) {

        await transaction.rollback();

        console.error(
            "CART MERGE FAILED:",
            error
        );

        throw error;
    }
};