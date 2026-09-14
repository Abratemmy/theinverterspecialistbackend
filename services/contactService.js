const ContactMessage = require("../models/ContactMessage");
const {transporter} = require("../config/email");
const notificationService =
    require("./notificationService");
const User =
    require("../models/User");

// ========================================================
// CREATE CONTACT MESSAGE
// ========================================================

exports.createContactMessage = async ({
    full_name,
    email,
    phone,
    subject,
    message
}) => {

    // ----------------------------------------------------
    // Save message to database
    // ----------------------------------------------------

    const contactMessage =
        await ContactMessage.create({

            full_name,

            email,

            phone: phone || null,

            subject,

            message

        });
    
        // ----------------------------------------------------
        // Notify admins and managers
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
                    "New Contact Message",

                message:
                    `${full_name} sent a new contact message: ${subject}`,

                type:
                    "system"

            });

        }


    // ----------------------------------------------------
    // Send email notification
    // ----------------------------------------------------

    try {

        await transporter.sendMail({

            from: `"The Inverter Specialist" <${process.env.EMAIL_USER}>`,

            to: process.env.EMAIL_USER,

            replyTo: email,

            subject: `New Contact Message: ${subject}`,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 650px;
                    margin: auto;
                    color: #333;
                ">

                    <h2 style="color: #16a34a;">
                        New Contact Message
                    </h2>

                    <p>
                        A customer has submitted a new
                        contact message from your website.
                    </p>

                    <hr>

                    <p>
                        <strong>Name:</strong>
                        ${full_name}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${email}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${phone || "Not provided"}
                    </p>

                    <p>
                        <strong>Subject:</strong>
                        ${subject}
                    </p>

                    <p>
                        <strong>Message:</strong>
                    </p>

                    <div style="
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 8px;
                        white-space: pre-line;
                    ">
                        ${message}
                    </div>

                    <hr>

                    <p style="font-size: 13px; color: #777;">
                        This message was sent from
                        The Inverter Specialist website.
                    </p>

                </div>
            `

        });

        console.log(
            "CONTACT EMAIL SENT SUCCESSFULLY"
        );

    } catch (emailError) {

        // ------------------------------------------------
        // Email failure should NOT delete the database
        // message.
        // ------------------------------------------------

        console.error(
            "CONTACT EMAIL NOTIFICATION ERROR:",
            emailError
        );

    }


    return contactMessage;
};