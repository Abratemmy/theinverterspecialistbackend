const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please log in."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        const user = await User.findByPk(decoded.id, {
            attributes: {
                exclude: [
                    "password",
                    "reset_password_token",
                    "reset_password_expires"
                ]
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        if (user.status === "blocked") {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked."
            });
        }

        req.user = user;

        next();

    } 
        catch (error) {

            console.log("AUTH ERROR");
            console.log(error.name);
            console.log(error.message);

            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again."
            });

        }

};

module.exports = protect;