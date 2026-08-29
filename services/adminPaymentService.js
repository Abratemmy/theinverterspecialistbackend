const {
    Payment,
    Order,
    User
} = require("../models");

const {
    Op
} = require("sequelize");


// ============================================================
// GET PAYMENTS
// ============================================================

exports.getPayments = async ({
    page = 1,
    limit = 10,
    status,
    search
}) => {

    const offset =
        (page - 1) * limit;


    const where = {};


    // ========================================================
    // STATUS FILTER
    // ========================================================

    if (status) {

        where.status = status;

    }


    // ========================================================
    // SEARCH
    // ========================================================

    if (search) {

        where[Op.or] = [

            {
                payment_reference: {
                    [Op.like]:
                        `%${search}%`
                }
            },

            {
                gateway_transaction_id: {
                    [Op.like]:
                        `%${search}%`
                }
            }

        ];

    }


    // ========================================================
    // FETCH PAYMENTS
    // ========================================================

    const {
        count,
        rows
    } = await Payment.findAndCountAll({

        where,

        include: [

            {
                model: Order,

                as: "order",

                attributes: [
                    "id",
                    "order_number",
                    "order_status",
                    "payment_status",
                    "total_amount"
                ]

            },

            {
                model: User,

                as: "user",

                attributes: [
                    "id",
                    "first_name",
                    "last_name",
                    "email",
                    "phone"
                ]

            }

        ],

        order: [
            [
                "created_at",
                "DESC"
            ]
        ],

        limit,

        offset

    });


    return {

        payments: rows,

        pagination: {

            total: count,

            page,

            limit,

            totalPages:
                Math.ceil(
                    count / limit
                )

        }

    };

};


// ============================================================
// GET PAYMENT BY ID
// ============================================================

exports.getPaymentById = async (
    paymentId
) => {

    const payment =
        await Payment.findByPk(
            paymentId,
            {

                include: [

                    {
                        model: Order,

                        as: "order",

                        include: [

                            {
                                model: User,

                                as: "user",

                                attributes: [
                                    "id",
                                    "first_name",
                                    "last_name",
                                    "email",
                                    "phone"
                                ]

                            }

                        ]

                    },

                    {
                        model: User,

                        as: "user",

                        attributes: [
                            "id",
                            "first_name",
                            "last_name",
                            "email",
                            "phone"
                        ]

                    }

                ]

            }
        );


    if (!payment) {

        throw new Error(
            "Payment not found."
        );

    }


    return payment;

};