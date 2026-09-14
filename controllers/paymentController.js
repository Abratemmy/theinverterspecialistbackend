const paymentService = require("../services/paymentService");


// Initialize Paystack payment
exports.initializePayment = async (req, res) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required.",
            });
        }

        const payment = await paymentService.initializePayment(
            order_id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Payment initialized successfully.",
            data: payment,
        });
    } catch (error) {
        console.error("INITIALIZE PAYMENT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// Verify Paystack payment
exports.verifyPayment = async (req, res) => {
    try {
        const result = await paymentService.verifyPayment(
            req.params.reference,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: result.alreadyVerified
                ? "Payment already verified."
                : "Payment verified successfully.",
            data: result,
        });
    } catch (error) {
        console.error("VERIFY PAYMENT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// Create bank transfer payment
exports.createBankTransferPayment = async (req, res) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required.",
            });
        }

        const payment =
            await paymentService.createBankTransferPayment(
                order_id,
                req.user.id
            );

        return res.status(200).json({
            success: true,
            message: payment.alreadyExists
                ? "Bank transfer payment already exists."
                : "Bank transfer payment created successfully.",
            data: payment,
        });

    } catch (error) {
        console.error(
            "BANK TRANSFER PAYMENT ERROR:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

exports.confirmBankTransferPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const result =
            await paymentService.confirmBankTransferPayment(paymentId);

        return res.status(200).json({
            success: true,
            message: result.alreadyConfirmed
                ? "Bank transfer payment has already been confirmed."
                : "Bank transfer payment confirmed successfully.",
            data: result,
        });

    } catch (error) {
        console.error("CONFIRM BANK TRANSFER ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Paystack webhook
exports.paystackWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-paystack-signature"];

        await paymentService.paystackWebhook(
            signature,
            req.body
        );

        return res.sendStatus(200);
    } catch (error) {
        console.error("PAYSTACK WEBHOOK ERROR:", error);

        return res.sendStatus(400);
    }
};