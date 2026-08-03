const {
    Cart,
    CartItem,
    Product,
    ProductMedia
} = require("../models");

exports.getOrCreateCart = async (userId) => {

    let cart = await Cart.findOne({

        where: {
            user_id: userId,
            status: "active"
        }

    });

    if (!cart) {

        cart = await Cart.create({
            user_id: userId
        });

    }

    return cart;

};

// add product to cart
exports.addToCart = async (userId, data) => {

    const { product_id, quantity } = data;

    // Check product exists
    const product = await Product.findOne({

        where: {
            id: product_id,
            status: "active"
        }

    });

    if (!product) {
        throw new Error("Product not found.");
    }

    // Check stock
    if (quantity > product.quantity) {
        throw new Error(
            `Only ${product.quantity} item(s) available in stock.`
        );
    }

    // Get active cart
    const cart = await exports.getOrCreateCart(userId);

    // Check if item already exists
    let item = await CartItem.findOne({

        where: {

            cart_id: cart.id,

            product_id

        }

    });

    if (item) {

        const newQuantity = item.quantity + quantity;

        if (newQuantity > product.quantity) {

            throw new Error(
                `Only ${product.quantity} item(s) available in stock.`
            );

        }

        item.quantity = newQuantity;

        item.total_price =
            newQuantity * item.unit_price - item.discount_amount;

        await item.save();

    } else {
        const unitPrice = Number(product.price);
        const totalPrice = unitPrice * Number(quantity);

        console.log("====== CART ITEM ======");
        console.log({
            quantity,
            unitPrice,
            totalPrice
        });


        item = await CartItem.create({

            cart_id: cart.id,

            product_id,

            quantity,

            unit_price: product.price,

            discount_amount: 0,

            total_price: quantity * product.price

        });

    }

    return item;

};

// get cart
exports.getCart = async (userId) => {

    const cart = await Cart.findOne({

        where: {

            user_id: userId,

            status: "active"

        },

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

                                as: "media"

                            }

                        ]

                    }

                ]

            }

        ]

    });

    if (!cart) {

        return {

            total_items: 0,

            subtotal: 0,

            discount: 0,

            grand_total: 0,

            items: []

        };

    }

    let subtotal = 0;

    let discount = 0;

    cart.items.forEach(item => {

        subtotal += Number(item.total_price);

        discount += Number(item.discount_amount);

    });

    return {

        cart_id: cart.id,

        total_items: cart.items.length,

        subtotal,

        discount,

        grand_total: subtotal,

        items: cart.items

    };

};

// update product quantity
exports.updateCartItem = async (
    itemId,
    userId,
    quantity
) => {

    const item = await CartItem.findByPk(itemId, {

        include: [

            {

                model: Cart,

                as: "cart"

            },

            {

                model: Product,

                as: "product"

            }

        ]

    });

    if (!item) {
        throw new Error("Cart item not found.");
    }

    if (item.cart.user_id !== userId) {
        throw new Error("Unauthorized.");
    }

    if (quantity > item.product.quantity) {

        throw new Error(
            `Only ${item.product.quantity} item(s) available.`
        );

    }

    item.quantity = quantity;

    item.total_price =
        quantity * item.unit_price - item.discount_amount;

    await item.save();

    return item;

};

// remove product from cart
exports.removeCartItem = async (
    itemId,
    userId
) => {

    const item = await CartItem.findByPk(itemId, {

        include: [

            {

                model: Cart,

                as: "cart"

            }

        ]

    });

    if (!item) {
        throw new Error("Cart item not found.");
    }

    if (item.cart.user_id !== userId) {
        throw new Error("Unauthorized.");
    }

    await item.destroy();

    return true;

};

// clear cart
exports.clearCart = async (userId) => {

    const cart = await Cart.findOne({

        where: {

            user_id: userId,

            status: "active"

        }

    });

    if (!cart) {
        return true;
    }

    await CartItem.destroy({

        where: {

            cart_id: cart.id

        }

    });

    return true;

};