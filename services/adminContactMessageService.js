const {
    Op
} = require("sequelize");

const ContactMessage =
    require("../models/ContactMessage");
const transporter =
    require("../config/email");


// ============================================================
// GET CONTACT MESSAGES
// ============================================================

exports.getContactMessages = async ({
    search,
    status,
    page = 1,
    limit = 10
} = {}) => {

    const where = {};


    // --------------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------------

    if (
        status &&
        [
            "new",
            "read",
            "replied",
            "closed"
        ].includes(status)
    ) {

        where.status = status;

    }


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (search?.trim()) {

        const searchValue =
            `%${search.trim()}%`;

        where[Op.or] = [

            {
                full_name: {
                    [Op.like]:
                        searchValue
                }
            },

            {
                email: {
                    [Op.like]:
                        searchValue
                }
            },

            {
                phone: {
                    [Op.like]:
                        searchValue
                }
            },

            {
                subject: {
                    [Op.like]:
                        searchValue
                }
            },

            {
                message: {
                    [Op.like]:
                        searchValue
                }
            }

        ];

    }


    // --------------------------------------------------------
    // PAGINATION
    // --------------------------------------------------------

    const currentPage =
        Math.max(
            Number(page) || 1,
            1
        );

    const pageLimit =
        Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            100
        );

    const offset =
        (currentPage - 1) *
        pageLimit;


    // --------------------------------------------------------
    // GET MESSAGES
    // --------------------------------------------------------

    const {
        rows,
        count
    } =
        await ContactMessage.findAndCountAll({

            where,

            order: [

                [
                    "created_at",
                    "DESC"
                ]

            ],

            limit:
                pageLimit,

            offset

        });


    return {

        data:
            rows,

        pagination: {

            page:
                currentPage,

            limit:
                pageLimit,

            total:
                count,

            totalPages:
                Math.ceil(
                    count /
                    pageLimit
                )

        }

    };

};


// ============================================================
// GET SINGLE CONTACT MESSAGE
// ============================================================

exports.getContactMessageById =
    async (
        messageId
    ) => {

        const contactMessage =
            await ContactMessage.findByPk(
                messageId
            );


        if (!contactMessage) {

            throw new Error(
                "Contact message not found."
            );

        }


        return contactMessage;

    };


// ============================================================
// UPDATE MESSAGE STATUS
// ============================================================

exports.updateContactMessageStatus =
    async (
        messageId,
        status
    ) => {

        const allowedStatuses = [

            "new",
            "read",
            "replied",
            "closed"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            throw new Error(
                "Invalid contact message status."
            );

        }


        const contactMessage =
            await ContactMessage.findByPk(
                messageId
            );


        if (!contactMessage) {

            throw new Error(
                "Contact message not found."
            );

        }


        contactMessage.status =
            status;


        await contactMessage.save();


        return contactMessage;

    };


// ============================================================
// REPLY TO CONTACT MESSAGE
// ============================================================

exports.replyToContactMessage =
    async (
        messageId,
        adminReply
    ) => {

        // ----------------------------------------------------
        // Validate reply
        // ----------------------------------------------------

        if (
            !adminReply ||
            !adminReply.trim()
        ) {

            throw new Error(
                "Reply message is required."
            );

        }


        // ----------------------------------------------------
        // Find contact message
        // ----------------------------------------------------

        const contactMessage =
            await ContactMessage.findByPk(
                messageId
            );


        if (!contactMessage) {

            throw new Error(
                "Contact message not found."
            );

        }


        // ----------------------------------------------------
        // Save reply
        // ----------------------------------------------------

        contactMessage.admin_reply =
            adminReply.trim();

        contactMessage.status =
            "replied";

        contactMessage.replied_at =
            new Date();


        await contactMessage.save();


        // ----------------------------------------------------
        // Send email to customer
        // ----------------------------------------------------

        let emailSent = true;


        try {

            // ------------------------------------------------
            // DEBUG INFORMATION
            // ------------------------------------------------

            console.log(
                "================================"
            );

            console.log(
                "SENDING CONTACT REPLY"
            );

            console.log(
                "TO:",
                contactMessage.email
            );

            console.log(
                "FROM:",
                process.env.EMAIL_USER
            );

            console.log(
                "SUBJECT:",
                `Re: ${contactMessage.subject}`
            );

            console.log(
                "================================"
            );


            // ------------------------------------------------
            // SEND EMAIL
            // ------------------------------------------------

            const info =
                await transporter.sendMail({

                    from:
                        `"The Inverter Specialist" <${process.env.EMAIL_USER}>`,

                    to:
                        contactMessage.email,

                    replyTo:
                        process.env.EMAIL_USER,

                    subject:
                        `Re: ${contactMessage.subject}`,

                    html: `

                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 650px;
                            margin: auto;
                            color: #333;
                            line-height: 1.6;
                        ">

                            <h2 style="
                                color: #16a34a;
                            ">
                                The Inverter Specialist
                            </h2>


                            <p>
                                Hello
                                <strong>
                                    ${contactMessage.full_name}
                                </strong>,
                            </p>


                            <p>
                                Thank you for contacting
                                The Inverter Specialist.
                            </p>


                            <p>
                                We have received your message
                                regarding:
                            </p>


                            <div style="
                                background: #f5f5f5;
                                padding: 12px 15px;
                                border-radius: 8px;
                                margin: 15px 0;
                            ">

                                <strong>
                                    ${contactMessage.subject}
                                </strong>

                            </div>


                            <p>
                                Our response:
                            </p>


                            <div style="
                                background: #f9fafb;
                                border-left: 4px solid #16a34a;
                                padding: 15px 20px;
                                margin: 15px 0;
                                white-space: pre-line;
                            ">

                                ${adminReply.trim()}

                            </div>


                            <hr style="
                                border: 0;
                                border-top: 1px solid #e5e7eb;
                                margin: 25px 0;
                            ">


                            <p style="
                                font-size: 13px;
                                color: #777;
                            ">

                                This is a response to the
                                contact message you submitted
                                on The Inverter Specialist website.

                            </p>


                            <p style="
                                font-size: 13px;
                                color: #777;
                            ">

                                Regards,<br>

                                <strong>
                                    The Inverter Specialist
                                </strong>

                            </p>

                        </div>

                    `

                });


            // ------------------------------------------------
            // EMAIL SUCCESS
            // ------------------------------------------------

            console.log(
                "CONTACT REPLY EMAIL SENT SUCCESSFULLY"
            );

            console.log(
                "MESSAGE ID:",
                info.messageId
            );

            console.log(
                "SMTP RESPONSE:",
                info.response
            );

            console.log(
                "================================"
            );

        }
        catch (emailError) {

            emailSent = false;


            // ------------------------------------------------
            // EMAIL ERROR
            // ------------------------------------------------

            console.error(
                "================================"
            );

            console.error(
                "CONTACT REPLY EMAIL ERROR:"
            );

            console.error(
                emailError
            );

            console.error(
                "================================"
            );

        }


        // ----------------------------------------------------
        // Return response
        // ----------------------------------------------------

        return {

            contactMessage,

            emailSent

        };

    };

// ============================================================
// DELETE CONTACT MESSAGE
// ============================================================

exports.deleteContactMessage =
    async (
        messageId
    ) => {

        const contactMessage =
            await ContactMessage.findByPk(
                messageId
            );


        if (!contactMessage) {

            throw new Error(
                "Contact message not found."
            );

        }


        await contactMessage.destroy();


        return true;

    };