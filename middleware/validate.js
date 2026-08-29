const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        console.log(
            "================================="
        );

        console.log(
            "VALIDATION ERROR"
        );

        console.log(
            "METHOD:",
            req.method
        );

        console.log(
            "URL:",
            req.originalUrl
        );

        console.log(
            "BODY:",
            req.body
        );

        console.log(
            "ERRORS:",
            errors.array()
        );

        console.log(
            "================================="
        );

        return res.status(400).json({

            success: false,

            message:
                errors
                    .array()
                    .map(error => error.msg)
                    .join(", "),

            errors:
                errors.array()

        });

    }

    next();
};