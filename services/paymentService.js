const axios = require("axios");
const crypto = require("crypto");

const {
    Payment,
    Product,
    Order,
    OrderItem,
    User,
    Cart,
    CartItem
} = require("../models");
const notificationService =
    require("./notificationService");

const {sendBankTransferOrderEmail} = require("../config/email")
const sequelize = require("../config/database");


// ============================================================
// PAYSTACK CONFIG
// ============================================================

const PAYSTACK_BASE_URL =
    "https://api.paystack.co";

const PAYSTACK_SECRET_KEY =
    process.env.PAYSTACK_SECRET_KEY;


// ============================================================
// CHECK PAYSTACK KEY
// ============================================================

if (!PAYSTACK_SECRET_KEY) {

    console.warn(
        "WARNING: PAYSTACK_SECRET_KEY is not configured."
    );

}


// ============================================================
// PAYSTACK REQUEST HEADERS
// ============================================================

const paystackHeaders = {

    Authorization:
        `Bearer ${PAYSTACK_SECRET_KEY}`,

    "Content-Type":
        "application/json"

};


// ============================================================
// GENERATE PAYMENT REFERENCE
// ============================================================

const generatePaymentReference = () => {

    const timestamp =
        Date.now();

    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `TIS-PAY-${timestamp}-${random}`;

};


// ============================================================
// INITIALIZE PAYMENT
// ============================================================

exports.initializePayment = async (
    orderId,
    userId
) => {

    // --------------------------------------------------------
    // Check order
    // --------------------------------------------------------

    const order =
        await Order.findOne({

            where: {

                id:
                    orderId,

                user_id:
                    userId

            }

        });


    if (!order) {

        throw new Error(
            "Order not found."
        );

    }


    // --------------------------------------------------------
    // Check order payment status
    // --------------------------------------------------------

    if (
        order.payment_status ===
        "paid"
    ) {

        throw new Error(
            "This order has already been paid for."
        );

    }


    // --------------------------------------------------------
    // Check order status
    // --------------------------------------------------------

    if (
        order.order_status ===
        "cancelled"
    ) {

        throw new Error(
            "This order has been cancelled."
        );

    }


    // --------------------------------------------------------
    // Check user
    // --------------------------------------------------------

    const user =
        await User.findByPk(
            userId
        );


    if (!user) {

        throw new Error(
            "User account not found."
        );

    }


    if (!user.email) {

        throw new Error(
            "A valid email address is required for payment."
        );

    }


    // --------------------------------------------------------
    // Check base order amount
    // --------------------------------------------------------
    const orderAmount =
    Number(order.total_amount);

    if (
        !orderAmount ||
        orderAmount <= 0
    ) {

        throw new Error(
            "Invalid order amount."
        );

    }



    // --------------------------------------------------------
    // Generate new reference
    // --------------------------------------------------------

    const reference =
        generatePaymentReference();


    // --------------------------------------------------------
    // Paystack amount is in kobo
    //
    // ₦50,000 = 5,000,000 kobo
    // --------------------------------------------------------

    const amountInKobo =
        Math.round(
            orderAmount * 100
        );


    try {

        // ====================================================
        // INITIALIZE PAYSTACK TRANSACTION
        // ====================================================

        const response =
            await axios.post(

                `${PAYSTACK_BASE_URL}/transaction/initialize`,

                {

                    email:
                        user.email,

                    amount:
                        amountInKobo,

                    currency:
                        "NGN",

                    reference,

                    metadata: {

                        order_id:
                            order.id,

                        order_number:
                            order.order_number,

                        user_id:
                            userId

                    },

                    callback_url:
                        process.env.PAYSTACK_CALLBACK_URL

                },

                {

                    headers:
                        paystackHeaders

                }

            );


        if (
            !response.data ||
            !response.data.status
        ) {

            throw new Error(
                response.data?.message ||
                "Unable to initialize payment."
            );

        }


        const paystackData =
            response.data.data;


        // ====================================================
        // CREATE / UPDATE PAYMENT RECORD
        // ====================================================

        const payment =
    await Payment.create({

        order_id:
            order.id,

        user_id:
            userId,

        payment_reference:
            reference,

        gateway:
            "paystack",

        payment_method:
            "card",

        amount:
            orderAmount,

        currency:
            "NGN",

        status:
            "pending",

        gateway_response:
            JSON.stringify(
                response.data
            )

    });


        // ====================================================
        // RETURN PAYMENT DATA
        // ====================================================

        return {

            paymentId:
                payment.id,

            orderId:
                order.id,

            orderNumber:
                order.order_number,

            amount:
                orderAmount,

            currency:
                "NGN",

            reference,

            authorizationUrl:
                paystackData.authorization_url,

            accessCode:
                paystackData.access_code

        };

    }
    catch (error) {

        console.error(
            "Paystack initialization error:",
            error.response?.data ||
            error.message
        );


        const paystackMessage =
            error.response?.data?.message;


        throw new Error(
            paystackMessage ||
            "Unable to initialize payment. Please try again."
        );

    }

};


// ============================================================
// CREATE BANK TRANSFER PAYMENT
// ============================================================
exports.createBankTransferPayment = async (orderId, userId) => {
    // Find the order belonging to the logged-in user
    const order = await Order.findOne({
        where: {
            id: orderId,
            user_id: userId,
        },
    });

    if (!order) {
        throw new Error("Order not found.");
    }

    if (order.payment_status === "paid") {
        throw new Error("This order has already been paid for.");
    }

    if (order.order_status === "cancelled") {
        throw new Error("This order has been cancelled.");
    }

    const orderAmount = Number(order.total_amount);

    if (!orderAmount || orderAmount <= 0) {
        throw new Error("Invalid order amount.");
    }

    // Find customer
    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    if (!user.email) {
        throw new Error("Customer email address is not available.");
    }

    // Check if a pending bank transfer payment already exists
    let payment = await Payment.findOne({
        where: {
            order_id: order.id,
            user_id: userId,
            payment_method: "bank_transfer",
            gateway: "bank_transfer",
            status: "pending",
        },
        order: [["created_at", "DESC"]],
    });

    let alreadyExists = false;

    if (payment) {
        alreadyExists = true;
        return {
            paymentId: payment.id,
            orderId: order.id,
            orderNumber: order.order_number,
            amount: orderAmount,
            currency: "NGN",
            reference: payment.payment_reference,
            paymentMethod: "bank_transfer",
            status: payment.status,
            alreadyExists: true,
        };
    } else {
        // Generate payment reference
        const reference = generatePaymentReference();

        payment = await Payment.create({
            order_id: order.id,
            user_id: userId,
            payment_reference: reference,
            gateway: "bank_transfer",
            payment_method: "bank_transfer",
            amount: orderAmount,
            currency: "NGN",
            status: "pending",
            gateway_response: JSON.stringify({
                type: "bank_transfer",
                instructions:
                    "Customer should make payment using the provided bank account details.",
            }),
        });
    }

    // Get order items and products for the email
    const items = await OrderItem.findAll({
        where: {
            order_id: order.id,
        },
        include: [
            {
                model: Product,
                as: "product",
                attributes: ["id", "name"],
            },
        ],
    });

    // Add items to order object for email
    const orderForEmail = {
        ...order.toJSON(),
        items: items.map((item) => item.toJSON()),
    };

    // Send email
    try {
        await sendBankTransferOrderEmail({
            user,
            order: orderForEmail,
        });

        console.log(
            `BANK TRANSFER ORDER EMAIL SENT TO: ${user.email}`
        );
    } catch (emailError) {
        console.error(
            "BANK TRANSFER ORDER EMAIL ERROR:",
            emailError
        );

        // Important:
        // Do not fail the order just because email failed.
    }

    return {
        paymentId: payment.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: orderAmount,
        currency: "NGN",
        reference: payment.payment_reference,
        paymentMethod: "bank_transfer",
        status: payment.status,
        alreadyExists,
    };
};


// ============================================================
// CLEAR / CLOSE CART AFTER SUCCESSFUL PAYMENT
// ============================================================
//
// IMPORTANT:
//
// We don't simply delete the cart.
// We change:
//
// active → checked_out
//
// and remove its cart items.
//
// This preserves the cart record for history/reference,
// while preventing the paid items from remaining in
// the customer's active shopping cart.
//
// ============================================================

const completePaidCart = async (
    order,
    transaction
) => {

    if (!order.cart_id) {

        console.warn(
            `Order ${order.id} has no cart_id.`
        );

        return;

    }


    // --------------------------------------------------------
    // Find the cart
    // --------------------------------------------------------

    const cart =
        await Cart.findOne({

            where: {

                id:
                    order.cart_id,

                user_id:
                    order.user_id

            },

            transaction,

            lock:
                transaction.LOCK.UPDATE

        });


    if (!cart) {

        console.warn(
            `Cart ${order.cart_id} not found for order ${order.id}.`
        );

        return;

    }


    // --------------------------------------------------------
    // Delete cart items
    // --------------------------------------------------------

    await CartItem.destroy({

        where: {

            cart_id:
                cart.id

        },

        transaction

    });


    // --------------------------------------------------------
    // Close the cart
    // --------------------------------------------------------

    cart.status =
        "checked_out";


    await cart.save({

        transaction

    });

};


exports.confirmBankTransferPayment = async (paymentId) => {
    const transaction = await sequelize.transaction();

    try {
        const payment = await Payment.findOne({
            where: {
                id: paymentId,
                payment_method: "bank_transfer",
                gateway: "bank_transfer",
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!payment) {
            throw new Error("Bank transfer payment not found.");
        }

        if (payment.status === "successful") {
            await transaction.commit();

            return {
                alreadyConfirmed: true,
                paymentId: payment.id,
                orderId: payment.order_id,
            };
        }

        const order = await Order.findByPk(payment.order_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!order) {
            throw new Error("Order associated with this payment was not found.");
        }

        // Mark payment as successful
        payment.status = "successful";
        payment.paid_at = new Date();

        payment.gateway_response = JSON.stringify({
            type: "bank_transfer",
            confirmed_by_admin: true,
            confirmed_at: new Date(),
        });

        await payment.save({ transaction });
        
        // =================================================
        // CLEAR / CLOSE CART
        // =================================================

        await completePaidCart(

            order,

            transaction

        );

        // Mark the order as paid
        order.payment_status = "paid";

        await order.save({ transaction });

        await transaction.commit();

        return {
            alreadyConfirmed: false,
            paymentId: payment.id,
            orderId: order.id,
            orderNumber: order.order_number,
            paymentStatus: "paid",
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
// ============================================================
// VERIFY PAYMENT
// ============================================================

exports.verifyPayment = async (
    reference
) => {

    if (!reference) {

        throw new Error(
            "Payment reference is required."
        );

    }


    // --------------------------------------------------------
    // Find payment
    // --------------------------------------------------------

    const payment =
        await Payment.findOne({

            where: {

                payment_reference:
                    reference

            }

        });


    if (!payment) {

        throw new Error(
            "Payment record not found."
        );

    }


    // --------------------------------------------------------
    // Already successful
    //
    // If the webhook already processed the payment,
    // don't process it again.
    // --------------------------------------------------------

    if (
        payment.status ===
        "successful"
    ) {

        const order =
            await Order.findByPk(
                payment.order_id
            );


        return {

            alreadyVerified:
                true,

            payment,

            order,

            status:
                "success",

            baseAmount:
                Number(order.total_amount),

            vatRate:
                0.075,

            vatAmount:
                Number(
                    (
                        Number(payment.amount) -
                        Number(order.total_amount)
                    ).toFixed(2)
                ),

            totalAmount:
                Number(payment.amount)

        };

    }


    try {

        // ====================================================
        // VERIFY WITH PAYSTACK
        // ====================================================

        const response =
            await axios.get(

                `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,

                {

                    headers:
                        paystackHeaders

                }

            );


        if (
            !response.data ||
            !response.data.status
        ) {

            throw new Error(
                response.data?.message ||
                "Payment verification failed."
            );

        }


        const transactionObject =
            response.data.data;


        // ====================================================
        // CHECK PAYSTACK STATUS
        // ====================================================

        if (
            transactionObject.status !==
            "success"
        ) {

            payment.status =
                "failed";

            payment.gateway_response =
                JSON.stringify(
                    transactionObject
                );

            await payment.save();


            throw new Error(
                transactionObject.gateway_response ||
                "Payment was not successful."
            );

        }


        // ====================================================
        // VERIFY AMOUNT
        // ====================================================

        const expectedAmount =
            Math.round(
                Number(payment.amount) *
                100
            );


        if (
            Number(transactionObject.amount) !==
            expectedAmount
        ) {

            throw new Error(
                "Payment amount does not match the order amount."
            );

        }


        // ====================================================
        // START DATABASE TRANSACTION
        // ====================================================

        const dbTransaction =
            await sequelize.transaction();


        try {

            // =================================================
            // UPDATE PAYMENT
            // =================================================

            payment.status =
                "successful";

            payment.gateway_transaction_id =
                String(
                    transactionObject.id
                );

            payment.gateway_response =
                JSON.stringify(
                    transactionObject
                );

            payment.paid_at =
                transactionObject.paid_at
                    ? new Date(
                        transactionObject.paid_at
                    )
                    : new Date();


            await payment.save({

                transaction:
                    dbTransaction

            });


            // =================================================
            // FIND ORDER
            // =================================================

            const order =
                await Order.findByPk(

                    payment.order_id,

                    {

                        transaction:
                            dbTransaction,

                        lock:
                            dbTransaction.LOCK.UPDATE

                    }

                );


            if (!order) {

                throw new Error(
                    "Order associated with payment was not found."
                );

            }


            // =================================================
            // UPDATE ORDER
            // =================================================

            order.payment_status =
                "paid";


            if (
                order.order_status ===
                "pending"
            ) {

                order.order_status =
                    "processing";

            }


            await order.save({

                transaction:
                    dbTransaction

            });

            // ----------------------------------------------------
            // Notify admins and managers about payment
            // ----------------------------------------------------

            const staffUsers =
                await User.findAll({

                    where: {
                        role: [
                            "admin",
                            "manager"
                        ],

                        status: "active"
                    },

                    attributes: [
                        "id"
                    ]

                });


            for (const staff of staffUsers) {

                await notificationService.createNotification({

                    user_id:
                        staff.id,

                    title:
                        "Payment Received",

                    message:
                        `Payment for order ${order.order_number} has been successfully received.`,

                    type:
                        "payment"

                });

            }


            // =================================================
            // CLEAR / CLOSE CART
            // =================================================

            await completePaidCart(

                order,

                dbTransaction

            );


            // =================================================
            // COMMIT EVERYTHING
            // =================================================

            await dbTransaction.commit();


            // =================================================
            // RETURN
            // =================================================

            return {

                alreadyVerified:
                    false,

                payment,

                order,

                status:
                    "success",

                transaction:
                    transactionObject,

                baseAmount:
                    Number(order.total_amount),

                vatRate:
                    0.075,

                vatAmount:
                    Number(
                        (
                            Number(payment.amount) -
                            Number(order.total_amount)
                        ).toFixed(2)
                    ),

                totalAmount:
                    Number(payment.amount)

            };

        }
        catch (error) {

            await dbTransaction.rollback();

            throw error;

        }

    }
    catch (error) {

        console.error(
            "Payment verification error:",
            error.response?.data ||
            error.message
        );


        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Unable to verify payment."
        );

    }

};


// ============================================================
// PAYSTACK WEBHOOK
// ============================================================

exports.paystackWebhook = async (
    signature,
    rawBody
) => {

    // --------------------------------------------------------
    // Check signature
    // --------------------------------------------------------

    if (!signature) {

        throw new Error(
            "Missing Paystack signature."
        );

    }


    if (!rawBody) {

        throw new Error(
            "Missing webhook body."
        );

    }


    // --------------------------------------------------------
    // Generate expected signature
    // --------------------------------------------------------

    const hash =
        crypto
            .createHmac(
                "sha512",
                PAYSTACK_SECRET_KEY
            )
            .update(rawBody)
            .digest("hex");


    // --------------------------------------------------------
    // Compare signatures
    // --------------------------------------------------------

    const received =
        Buffer.from(
            signature
        );

    const expected =
        Buffer.from(
            hash
        );


    if (
        received.length !==
        expected.length ||
        !crypto.timingSafeEqual(
            received,
            expected
        )
    ) {

        throw new Error(
            "Invalid Paystack webhook signature."
        );

    }


    // --------------------------------------------------------
    // Parse body
    // --------------------------------------------------------

    let event;


    try {

        event =
            JSON.parse(
                rawBody.toString()
            );

    }
    catch (error) {

        throw new Error(
            "Invalid webhook payload."
        );

    }


    // --------------------------------------------------------
    // Only process successful charge
    // --------------------------------------------------------

    if (
        event.event !==
        "charge.success"
    ) {

        return {

            processed:
                false,

            event:
                event.event

        };

    }


    const transaction =
        event.data;


    if (!transaction) {

        throw new Error(
            "Invalid Paystack transaction data."
        );

    }


    const reference =
        transaction.reference;


    if (!reference) {

        throw new Error(
            "Payment reference missing."
        );

    }


    // ========================================================
    // FIND PAYMENT
    // ========================================================

    const payment =
        await Payment.findOne({

            where: {

                payment_reference:
                    reference

            }

        });


    if (!payment) {

        console.warn(
            `Payment not found for reference: ${reference}`
        );


        return {

            processed:
                false,

            reason:
                "Payment record not found."

        };

    }


    // --------------------------------------------------------
    // Prevent duplicate processing
    // --------------------------------------------------------

    if (
        payment.status ===
        "successful"
    ) {

        return {

            processed:
                true,

            alreadyProcessed:
                true

        };

    }


    // ========================================================
    // VERIFY AMOUNT
    // ========================================================

    const expectedAmount =
        Math.round(
            Number(payment.amount) *
            100
        );


    if (
        Number(transaction.amount) !==
        expectedAmount
    ) {

        throw new Error(
            "Webhook payment amount does not match."
        );

    }


    // ========================================================
    // DATABASE TRANSACTION
    // ========================================================

    const dbTransaction =
        await sequelize.transaction();


    try {

        // ----------------------------------------------------
        // Update Payment
        // ----------------------------------------------------

        payment.status =
            "successful";

        payment.gateway_transaction_id =
            String(
                transaction.id
            );

        payment.gateway_response =
            JSON.stringify(
                transaction
            );

        payment.paid_at =
            transaction.paid_at
                ? new Date(
                    transaction.paid_at
                )
                : new Date();


        await payment.save({

            transaction:
                dbTransaction

        });


        // ----------------------------------------------------
        // Find Order
        // ----------------------------------------------------

        const order =
            await Order.findByPk(

                payment.order_id,

                {

                    transaction:
                        dbTransaction,

                    lock:
                        dbTransaction.LOCK.UPDATE

                }

            );


        if (!order) {

            throw new Error(
                "Order associated with payment not found."
            );

        }


        // ----------------------------------------------------
        // Update Order
        // ----------------------------------------------------

        order.payment_status =
            "paid";


        if (
            order.order_status ===
            "pending"
        ) {

            order.order_status =
                "processing";

        }


        await order.save({

            transaction:
                dbTransaction

        });


        // ----------------------------------------------------
        // Clear / Close Cart
        // ----------------------------------------------------

        await completePaidCart(

            order,

            dbTransaction

        );


        // ----------------------------------------------------
        // Commit
        // ----------------------------------------------------

        await dbTransaction.commit();


        return {

            processed:
                true,

            reference,

            orderId:
                order.id

        };

    }
    catch (error) {

        await dbTransaction.rollback();

        throw error;

    }

};