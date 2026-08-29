const contactMessageService =
    require("../services/adminContactMessageService");


// ============================================================
// GET CONTACT MESSAGES
// ============================================================

exports.getContactMessages = async (
    req,
    res
) => {

    try {

        const {

            search,
            status,

            page = 1,

            limit = 10

        } = req.query;


        const result =
            await contactMessageService
                .getContactMessages({

                    search,
                    status,
                    page,
                    limit

                });


        return res.status(200).json({

            success: true,

            message:
                "Contact messages retrieved successfully.",

            data:
                result.data,

            pagination:
                result.pagination

        });

    }
    catch (error) {

        console.error(
            "Get contact messages error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// ============================================================
// GET SINGLE MESSAGE
// ============================================================

exports.getContactMessageById =
    async (
        req,
        res
    ) => {

        try {

            const contactMessage =
                await contactMessageService
                    .getContactMessageById(
                        req.params.id
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Contact message retrieved successfully.",

                data:
                    contactMessage

            });

        }
        catch (error) {

            return res.status(404).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ============================================================
// UPDATE STATUS
// ============================================================

exports.updateContactMessageStatus =
    async (
        req,
        res
    ) => {

        try {

            const {
                status
            } = req.body;


            const contactMessage =
                await contactMessageService
                    .updateContactMessageStatus(

                        req.params.id,

                        status

                    );


            return res.status(200).json({

                success: true,

                message:
                    "Contact message status updated successfully.",

                data:
                    contactMessage

            });

        }
        catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ============================================================
// REPLY
// ============================================================

exports.replyToContactMessage =
    async (
        req,
        res
    ) => {

        try {

            const {
                admin_reply
            } = req.body;

            const result =
                await contactMessageService
                    .replyToContactMessage(

                        req.params.id,

                        admin_reply

                    );


            return res.status(200).json({

                success: true,

                message:
                    result.emailSent
                        ? "Reply saved and email sent successfully."
                        : "Reply saved, but the email could not be sent.",

                data:
                    result.contactMessage,

                emailSent:
                    result.emailSent

            });
            

        }
        catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ============================================================
// DELETE
// ============================================================

exports.deleteContactMessage =
    async (
        req,
        res
    ) => {

        try {

            await contactMessageService
                .deleteContactMessage(
                    req.params.id
                );


            return res.status(200).json({

                success: true,

                message:
                    "Contact message deleted successfully."

            });

        }
        catch (error) {

            return res.status(404).json({

                success: false,

                message:
                    error.message

            });

        }

    };