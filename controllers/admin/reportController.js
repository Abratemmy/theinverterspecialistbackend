const reportService = require("../../services/reportService");

// =======================================
// Daily Sales Report
// =======================================

exports.getDailySalesReport = async (req, res) => {

    try {

        const report = await reportService.getDailySalesReport();

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =======================================
// Weekly Sales Report
// =======================================

exports.getWeeklySalesReport = async (req, res) => {

    try {

        const report = await reportService.getWeeklySalesReport();

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =======================================
// Monthly Sales Report
// =======================================

exports.getMonthlySalesReport = async (req, res) => {

    try {

        const report = await reportService.getMonthlySalesReport();

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =======================================
// Yearly Sales Report
// =======================================

exports.getYearlySalesReport = async (req, res) => {

    try {

        const report = await reportService.getYearlySalesReport();

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =======================================
// Custom Sales Report
// =======================================

exports.getCustomSalesReport = async (req, res) => {

    try {

        const {

            start_date,

            end_date

        } = req.query;

        const report =
            await reportService.getCustomSalesReport(

                start_date,

                end_date

            );

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// =======================================
// Orders Report
// =======================================

exports.getOrdersReport = async (req, res) => {

    try {

        const report =
            await reportService.getOrdersReport(req.query);

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =======================================
// Payments Report
// =======================================

exports.getPaymentsReport = async (req, res) => {

    try {

        const report =
            await reportService.getPaymentsReport(req.query);

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =======================================
// Customers Report
// =======================================

exports.getCustomersReport = async (req, res) => {

    try {

        const report =
            await reportService.getCustomersReport(req.query);

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =======================================
// Products Report
// =======================================

exports.getProductsReport = async (req, res) => {

    try {

        const report =
            await reportService.getProductsReport(req.query);

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};