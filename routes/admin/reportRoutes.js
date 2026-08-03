const express = require("express");

const router = express.Router();

const reportController = require("../../controllers/admin/reportController");

const protect = require("../../middleware/authMiddleware");
const authorize = require("../../middleware/roleMiddleware");


const {

    ordersReportValidation,

    paymentsReportValidation,

    customersReportValidation,

    productsReportValidation,

    salesReportValidation

} = require("../../validators/reportValidator");

const validate = require("../../middleware/validate");

// ======================================================
// Sales Reports
// ======================================================

// Daily Sales
router.get(
    "/sales/daily",
    protect,
    authorize("admin", "manager"),
    reportController.getDailySalesReport
);

// Weekly Sales
router.get(
    "/sales/weekly",
    protect,
    authorize("admin", "manager"),
    reportController.getWeeklySalesReport
);

// Monthly Sales
router.get(
    "/sales/monthly",
    protect,
    authorize("admin", "manager"),
    reportController.getMonthlySalesReport
);

// Yearly Sales
router.get(
    "/sales/yearly",
    protect,
    authorize("admin", "manager"),
    reportController.getYearlySalesReport
);

// Custom Sales Report
router.get(
    "/sales/custom",
    protect,
    authorize("admin", "manager"),
    salesReportValidation,
    validate,
    reportController.getCustomSalesReport

);

// ======================================================
// Orders Report
// ======================================================

router.get(

    "/orders",

    protect,

    authorize("admin", "manager"),

    ordersReportValidation,

    validate,

    reportController.getOrdersReport

);

// ======================================================
// Payments Report
// ======================================================
router.get(

    "/payments",

    protect,

    authorize("admin", "manager"),

    paymentsReportValidation,

    validate,

    reportController.getPaymentsReport

);

// ======================================================
// Customers Report
// ======================================================

router.get(

    "/customers",

    protect,

    authorize("admin", "manager"),

    customersReportValidation,

    validate,

    reportController.getCustomersReport

);

// ======================================================
// Products Report
// ======================================================
router.get(

    "/products",

    protect,

    authorize("admin", "manager"),

    productsReportValidation,

    validate,

    reportController.getProductsReport

);

module.exports = router;