const Product = require("./Product");
const Category = require("./Category");
const Brand = require("./Brand");
const ProductMedia = require("./ProductMedia");
const ProductSpecification = require("./ProductSpecification");
const ProductReview = require("./ProductReview");
const User = require("./User");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const ShippingAddress = require("./ShippingAddress");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

const Payment = require("./Payment");
const Wishlist = require("./Wishlist");
const Gallery = require('./Gallery')

// Category
Category.hasMany(Product, {
    foreignKey: "category_id",
    as: "products"
});

Product.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category"
});

// Brand
Brand.hasMany(Product, {
    foreignKey: "brand_id",
    as: "products"
});

Product.belongsTo(Brand, {
    foreignKey: "brand_id",
    as: "brand"
});

// Product -> Media
Product.hasMany(ProductMedia, {
    foreignKey: "product_id",
    as: "media",
    onDelete: "CASCADE",
    hooks: true
});

ProductMedia.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product"
});

// Product -> Specifications
Product.hasMany(ProductSpecification, {
    foreignKey: "product_id",
    as: "specifications",
    onDelete: "CASCADE",
    hooks: true
});

ProductSpecification.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product"
});

// product reviews
Product.hasMany(ProductReview, {
    foreignKey: "product_id",
    as: "reviews"
});

ProductReview.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product"
});

// users reviews
User.hasMany(ProductReview, {
    foreignKey: "user_id",
    as: "reviews"
});

ProductReview.belongsTo(User, {
    foreignKey: "user_id",
    as: "user"
});

// user cart
User.hasMany(Cart, {
    foreignKey: "user_id",
    as: "carts"
});

Cart.belongsTo(User, {
    foreignKey: "user_id",
    as: "user"
});

// cart items
Cart.hasMany(CartItem, {
    foreignKey: "cart_id",
    as: "items"
});

CartItem.belongsTo(Cart, {
    foreignKey: "cart_id",
    as: "cart"
});

// product to cart
Product.hasMany(CartItem, {
    foreignKey: "product_id",
    as: "cartItems"
});

CartItem.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product"
});

// shipping address
User.hasMany(ShippingAddress, {
    foreignKey: "user_id",
    as: "shippingAddresses"
});

ShippingAddress.belongsTo(User, {
    foreignKey: "user_id",
    as: "user"
});

// users to order
User.hasMany(Order, {
    foreignKey: "user_id",
    as: "orders"
});

Order.belongsTo(User, {
    foreignKey: "user_id",
    as: "user"
});

// ShippingAddress to order
ShippingAddress.hasMany(Order, {
    foreignKey: "shipping_address_id",
    as: "orders"
});

Order.belongsTo(ShippingAddress, {
    foreignKey: "shipping_address_id",
    as: "shippingAddress"
});

//  order to order items
Order.hasMany(OrderItem, {
    foreignKey: "order_id",
    as: "items"
});

OrderItem.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order"
});

// product to order items
Product.hasMany(OrderItem, {
    foreignKey: "product_id",
    as: "orderItems"
});

OrderItem.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product"
});

// payment association
Order.hasMany(Payment, {
    foreignKey: "order_id",
    as: "payments"
});

Payment.belongsTo(Order, {
    foreignKey: "order_id",
    as: "order"
});

User.hasMany(Payment, {
    foreignKey: "user_id",
    as: "payments"
});

Payment.belongsTo(User, {
    foreignKey: "user_id",
    as: "user"
});

//wishlist
User.hasMany(Wishlist, {
    foreignKey: "user_id",
    onDelete: "CASCADE"
});

Wishlist.belongsTo(User, {
    foreignKey: "user_id"
});


Product.hasMany(Wishlist, {
    foreignKey: "product_id",
    onDelete: "CASCADE"
});

Wishlist.belongsTo(Product, {
    foreignKey: "product_id"
});

module.exports = {
    Product,
    Category,
    Brand,
    ProductMedia,
    ProductSpecification,
    ProductReview,
    User,
    Cart,
    CartItem,
    ShippingAddress,
    Order,
    OrderItem,
    Payment,
    Wishlist,
    Gallery

};