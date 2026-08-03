const paymentService = require("../services/paymentService");

exports.initializePayment = async (req, res) => {

    try {

        const { order_id } = req.body;

        const payment =
            await paymentService.initializePayment(
                order_id,
                req.user.id
            );

        return res.status(200).json({
            success: true,
            message: "Payment initialized successfully.",
            data: payment
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};


exports.verifyPayment = async (req, res) => {

    try {

        const result =
            await paymentService.verifyPayment(
                req.params.reference
            );

        return res.status(200).json({

            success: true,

            message: result.alreadyVerified
                ? "Payment already verified."
                : "Payment verified successfully.",

            data: result

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

exports.paystackWebhook = async (req, res) => {

    try {

        const signature =
            req.headers["x-paystack-signature"];

        await paymentService.paystackWebhook(
            signature,
            req.body
        );

        return res.sendStatus(200);

    } catch (error) {

        console.error(error);

        return res.sendStatus(400);

    }

};