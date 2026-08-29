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


module.exports = transporter;