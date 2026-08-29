const contactService =
    require("../services/contactService");


// ========================================================
// CREATE CONTACT MESSAGE
// ========================================================

exports.createContactMessage = async (
    req,
    res
) => {

    try {

        const {
            full_name,
            email,
            phone,
            subject,
            message
        } = req.body;


        // ------------------------------------------------
        // Basic validation
        // ------------------------------------------------

        if (
            !full_name ||
            !email ||
            !subject ||
            !message
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email, subject and message are required."

            });

        }


        // ------------------------------------------------
        // Create message
        // ------------------------------------------------

        const contactMessage =
            await contactService.createContactMessage({

                full_name,
                email,
                phone,
                subject,
                message

            });


        return res.status(201).json({

            success: true,

            message:
                "Your message has been sent successfully.",

            data: contactMessage

        });

    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "CREATE CONTACT MESSAGE ERROR"
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "NAME:",
            error.name
        );

        console.error(
            "STACK:",
            error.stack
        );

        console.error(
            "================================"
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to send your message. Please try again later."

        });

    }

};