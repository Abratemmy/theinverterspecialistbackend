const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

});


// ============================================================
// VERIFY EMAIL CONNECTION
// ============================================================

transporter.verify((error, success) => {

    if (error) {

        console.error(
            "EMAIL TRANSPORTER ERROR:",
            error
        );

    } else {

        console.log(
            "EMAIL SERVER IS READY"
        );

    }

});

const sendBankTransferOrderEmail = async ({
    user,
    order,
}) => {

    const bankName =
        "UNITED BANK FOR AFRICA (UBA)";

    const accountName =
        "Ebton Greener Energy co.";

    const accountNumber =
        "1026270424";


    const formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
            }
        ).format(Number(amount || 0));

    };


    const formatDate = (date) => {

        return new Intl.DateTimeFormat(
            "en-NG",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        ).format(new Date(date));

    };


    const itemsHtml =
        order.items
            .map((item) => {

                return `
                    <tr>
                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eeeeee;
                        ">
                            ${item.product?.name || "Product"}
                        </td>

                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eeeeee;
                            text-align:center;
                        ">
                            ${item.quantity}
                        </td>

                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eeeeee;
                            text-align:right;
                        ">
                            ${formatCurrency(item.unit_price)}
                        </td>

                        <td style="
                            padding:12px;
                            border-bottom:1px solid #eeeeee;
                            text-align:right;
                        ">
                            ${formatCurrency(item.total_price)}
                        </td>
                    </tr>
                `;

            })
            .join("");


    const html = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8" />

            <title>
                Order Received - ${order.order_number}
            </title>

        </head>


        <body style="
            margin:0;
            padding:0;
            background:#f5f5f5;
            font-family:Arial, Helvetica, sans-serif;
            color:#333333;
        ">

            <div style="
                max-width:700px;
                margin:30px auto;
                background:#ffffff;
                border-radius:10px;
                overflow:hidden;
            ">


                <!-- HEADER -->

                <div style="
                    background:#111827;
                    padding:30px;
                    text-align:center;
                ">

                    <h1 style="
                        margin:0;
                        color:#ffffff;
                        font-size:26px;
                    ">
                        Order Received
                    </h1>

                </div>


                <!-- CONTENT -->

                <div style="
                    padding:30px;
                ">

                    <h2 style="
                        margin-top:0;
                    ">
                        Thank you for your order, <span style="text-transform: uppercase">${user.first_name || user.name || "Customer"}.</span>
                    </h2>


                    <p style="
                        line-height:1.7;
                        color:#555555;
                    ">
                        Your order has been received successfully.
                        Please make your payment using the bank details
                        below. Your order will be processed after your
                        payment has been confirmed.
                    </p>


                    <!-- ORDER SUMMARY -->

                    <div style="
                        margin-top:25px;
                        padding:20px;
                        background:#f9fafb;
                        border-radius:8px;
                    ">

                        <h3>
                            Order Information
                        </h3>

                        <p>
                            <strong>Order Number:</strong>
                            ${order.order_number}
                        </p>

                        <p>
                            <strong>Order Date:</strong>
                            ${formatDate(order.created_at)}
                        </p>

                        <p>
                            <strong>Payment Method:</strong>
                            Direct Bank Transfer
                        </p>

                        <p>
                            <strong>Payment Status:</strong>
                            Awaiting Payment
                        </p>

                    </div>


                    <!-- BANK DETAILS -->

                    <div style="
                        margin-top:25px;
                        padding:25px;
                        background:#fff7ed;
                        border:1px solid #fed7aa;
                        border-radius:8px;
                    ">

                        <h3 style="
                            margin-top:0;
                        ">
                            Bank Transfer Details
                        </h3>


                        <p>
                            <strong>Bank Name:</strong><br>
                            ${bankName}
                        </p>


                        <p>
                            <strong>Account Name:</strong><br>
                            ${accountName}
                        </p>


                        <p>
                            <strong>Account Number:</strong><br>

                            <span style="
                                font-size:20px;
                                font-weight:bold;
                                letter-spacing:1px;
                            ">
                                ${accountNumber}
                            </span>
                        </p>

                    </div>


                    <!-- PAYMENT AMOUNT -->

                    <div style="
                        margin-top:25px;
                        padding:20px;
                        background:#ecfdf5;
                        border-radius:8px;
                        text-align:center;
                    ">

                        <p style="
                            margin:0;
                            color:#555555;
                        ">
                            Amount to Transfer
                        </p>


                        <h2 style="
                            margin:8px 0 0;
                            color:#047857;
                            font-size:28px;
                        ">
                            ${formatCurrency(order.total_amount)}
                        </h2>

                    </div>


                    <!-- INSTRUCTION -->

                    <div style="
                        margin-top:25px;
                    ">

                        <h3>
                            Payment Instructions
                        </h3>


                        <ol style="
                            line-height:1.8;
                            color:#555555;
                        ">

                            <li>
                                Transfer the exact amount shown above.
                            </li>

                            <li>
                                Use your order number
                                <strong>${order.order_number}</strong>
                                as the transfer narration/reference
                                where applicable.
                            </li>

                            <li>
                                Keep your transfer receipt for reference.
                            </li>

                            <li>
                                Your order will be processed after
                                payment has been confirmed.
                            </li>

                        </ol>

                    </div>


                    <!-- ORDER ITEMS -->

                    <h3 style="
                        margin-top:30px;
                    ">
                        Order Details
                    </h3>


                    <table style="
                        width:100%;
                        border-collapse:collapse;
                        font-size:14px;
                    ">

                        <thead>

                            <tr style="
                                background:#f9fafb;
                            ">

                                <th style="
                                    padding:12px;
                                    text-align:left;
                                ">
                                    Product
                                </th>

                                <th style="
                                    padding:12px;
                                    text-align:center;
                                ">
                                    Qty
                                </th>

                                <th style="
                                    padding:12px;
                                    text-align:right;
                                ">
                                    Price
                                </th>

                                <th style="
                                    padding:12px;
                                    text-align:right;
                                ">
                                    Total
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${itemsHtml}

                        </tbody>

                    </table>


                    <!-- TOTALS -->

                    <div style="
                        margin-top:20px;
                        border-top:1px solid #eeeeee;
                        padding-top:20px;
                    ">

                        <p style="
                            text-align:right;
                        ">
                            Subtotal:
                            <strong>
                                ${formatCurrency(order.subtotal)}
                            </strong>
                        </p>


                        <p style="
                            text-align:right;
                        ">
                            Discount:
                            <strong>
                                ${formatCurrency(order.discount)}
                            </strong>
                        </p>


                        <p style="
                            text-align:right;
                        ">
                            VAT:
                            <strong>
                                ${formatCurrency(order.tax)}
                            </strong>
                        </p>


                        <p style="
                            text-align:right;
                        ">
                            Shipping:
                            <strong>
                                ${formatCurrency(order.shipping_fee)}
                            </strong>
                        </p>


                        <p style="
                            text-align:right;
                            font-size:20px;
                        ">
                            <strong>
                                Total:
                                ${formatCurrency(order.total_amount)}
                            </strong>
                        </p>

                    </div>


                    <!-- FOOTER -->

                    <div style="
                        margin-top:30px;
                        padding-top:20px;
                        border-top:1px solid #eeeeee;
                        color:#777777;
                        font-size:13px;
                        line-height:1.6;
                    ">

                        <p>
                            If you have already made the transfer,
                            please keep your payment receipt until
                            your payment has been confirmed. you can also send 
                            your payment receipt to our WhatsApp <strong>+234 803 358 5468</strong>
                        </p>


                        <p>
                            Thank you for shopping with us.
                        </p>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `;


    await transporter.sendMail({

        from:
            `"The Inverter Specialist" <${process.env.EMAIL_USER}>`,

        to:
            user.email,

        subject:
            `Order Received - ${order.order_number}`,

        html,

    });

};

module.exports = {
    transporter,
    sendBankTransferOrderEmail,
};
