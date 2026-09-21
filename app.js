const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");


const app = express();

require("./models");
const authRoutes = require("./routes/authRoutes");
const adminCategoryRoutes = require("./routes/admin/categoryRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const adminBrandRoutes = require("./routes/admin/brandRoutes");
const productRoutes = require("./routes/productRoutes");
const adminProductRoutes = require("./routes/admin/productRoutes");
const productReviewRoutes = require("./routes/productReviewRoutes");
const adminProductReviewRoutes = require("./routes/admin/productReviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const shippingAddressRoutes = require("./routes/shippingAddressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/admin/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/admin/dashboardRoutes");
const reportRoutes = require("./routes/admin/reportRoutes");
const path = require("path");
const wishlistRoutes = require("./routes/wishlistRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminPaymentRoutes = require("./routes/admin/paymentRoutes");

const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminContactMessageRoutes = require("./routes/adminContactMessageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const customerFeedbackRoutes = require("./routes/customerFeedbackRoutes");

app.use(cors({
    origin: "http://localhost:3000", // React frontend
    credentials: true
}));

// Webhook MUST receive the raw body
app.use(
    "/api/payments/webhook",
    express.raw({ type: "application/json" })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// app.use(
//     "/api/uploads",
//     express.static(
//         path.join(
//             __dirname,
//             "uploads"
//         )
//     )
// );

app.use(
    "/api/uploads",
    (req, res, next) => {

        res.header(
            "Access-Control-Allow-Origin",
            "http://localhost:3000"
        );

        res.header(
            "Cross-Origin-Resource-Policy",
            "cross-origin"
        );

        next();
    },

    express.static(
        path.join(__dirname, "uploads")
    )
);
app.use("/api/auth", authRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/admin/brands", adminBrandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api", productReviewRoutes);
app.use("/api/admin/reviews", adminProductReviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/shipping-addresses", shippingAddressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use(
    "/api/admin/dashboard",
    dashboardRoutes
);
app.use("/api/admin/reports", reportRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/contact-messages",adminContactMessageRoutes);
app.use( "/api/notifications", notificationRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/feedback", customerFeedbackRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "The Inverter Specialist API is running."
    });
});

module.exports = app;