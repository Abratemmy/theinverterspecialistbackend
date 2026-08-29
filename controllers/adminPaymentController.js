const adminPaymentService =
    require("../services/adminPaymentService");


// ============================================================
// GET ALL PAYMENTS
// ============================================================

exports.getPayments = async (
    req,
    res
) => {

    try {

        const page =
            Math.max(
                Number(req.query.page) || 1,
                1
            );


        const limit =
            Math.min(
                Math.max(
                    Number(req.query.limit) || 10,
                    1
                ),
                100
            );


        const status =
            req.query.status || undefined;


        const search =
            req.query.search || undefined;


        const result =
            await adminPaymentService.getPayments({

                page,

                limit,

                status,

                search

            });


        return res.status(200).json({

            success: true,

            data: result.payments,

            pagination:
                result.pagination

        });

    }
    catch (error) {

        console.error(
            "Get admin payments error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch payments."

        });

    }

};


// ============================================================
// GET PAYMENT BY ID
// ============================================================

exports.getPaymentById = async (
    req,
    res
) => {

    try {

        const payment =
            await adminPaymentService.getPaymentById(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            data: payment

        });

    }
    catch (error) {

        console.error(
            "Get admin payment error:",
            error
        );


        return res.status(404).json({

            success: false,

            message:
                error.message ||
                "Payment not found."

        });

    }

};