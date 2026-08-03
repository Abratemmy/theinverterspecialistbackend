const { query } = require("express-validator");

// =======================================
// Pagination
// =======================================

const paginationValidation = [

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer."),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100.")

];

// =======================================
// Date Range
// =======================================

const dateRangeValidation = [

    query("start_date")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid date (YYYY-MM-DD)."),

    query("end_date")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid date (YYYY-MM-DD).")

];

// =======================================
// Orders Report
// =======================================

exports.ordersReportValidation = [

    ...paginationValidation,

    ...dateRangeValidation,

    query("order_status")
        .optional()
        .isIn([
            "pending",
            "processing",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ])
        .withMessage("Invalid order status."),

    query("payment_status")
        .optional()
        .isIn([
            "pending",
            "paid",
            "failed",
            "refunded"
        ])
        .withMessage("Invalid payment status.")

];

// =======================================
// Payments Report
// =======================================

exports.paymentsReportValidation = [

    ...paginationValidation,

    ...dateRangeValidation,

    query("status")
        .optional()
        .isIn([
            "pending",
            "successful",
            "failed",
            "refunded"
        ])
        .withMessage("Invalid payment status.")

];

// =======================================
// Customers Report
// =======================================

exports.customersReportValidation = [

    ...paginationValidation,

    ...dateRangeValidation

];

// =======================================
// Products Report
// =======================================

exports.productsReportValidation = [

    ...paginationValidation,

    query("status")
        .optional()
        .isIn([
            "active",
            "inactive"
        ])
        .withMessage("Invalid product status."),

    query("category_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Category ID must be an integer."),

    query("brand_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Brand ID must be an integer.")

];

// =======================================
// Sales Report
// =======================================

exports.salesReportValidation = [

    ...dateRangeValidation

];