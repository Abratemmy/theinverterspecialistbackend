const jwt = require("jsonwebtoken");
const { User } = require("../models");

const optionalAuthenticate = async (req, res, next) => {

    try {

        const token = req.cookies?.token;

        // No login cookie.
        // That's okay because guests are allowed.
        if (!token) {

            req.user = null;

            return next();

        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        const user =
            await User.findByPk(
                decoded.id
            );

        if (!user) {

            req.user = null;

            return next();

        }

        if (user.status === "blocked") {

            req.user = null;

            return next();

        }

        req.user = user;

        next();

    } catch (error) {

        // Invalid/expired token should not
        // prevent guest cart access.

        req.user = null;

        next();

    }

};

module.exports =
    optionalAuthenticate;