require("dotenv").config();

const transporter = require("./config/email");

const sendTestEmail = async () => {

    try {

        console.log("EMAIL_USER:", process.env.EMAIL_USER);

        console.log(
            "EMAIL_PASS:",
            process.env.EMAIL_PASS
                ? "PASSWORD EXISTS"
                : "PASSWORD MISSING"
        );


        await transporter.verify();

        console.log(
            "SMTP CONNECTION SUCCESSFUL"
        );


        const info =
            await transporter.sendMail({

                from:
                    `"The Inverter Specialist" <${process.env.EMAIL_USER}>`,

                to:
                    process.env.EMAIL_USER,

                subject:
                    "The Inverter Specialist - Test Email",

                text:
                    "This is a test email from the backend."

            });


        console.log(
            "EMAIL SENT SUCCESSFULLY"
        );

        console.log(
            "MESSAGE ID:",
            info.messageId
        );

    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "EMAIL TEST FAILED"
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "CODE:",
            error.code
        );

        console.error(
            "COMMAND:",
            error.command
        );

        console.error(
            "RESPONSE:",
            error.response
        );

        console.error(
            "================================"
        );

    }

};

sendTestEmail();