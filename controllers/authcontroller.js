const authService = require("../services/authService");

exports.register = async (req, res) => {
    try {
        const { user, token } =
            await authService.register(req.body);

        // Save JWT in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Change to true in production (HTTPS)
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Remove password before sending response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: userResponse
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// login
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const { user, token } = await authService.login(email, password);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: Number(process.env.COOKIE_EXPIRES_IN) * 1000
        });

        const userResponse = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profile_image: user.profile_image,
            status: user.status,
            last_login: user.last_login,
            created_at: user.created_at
        };

        res.status(200).json({
            success: true,
            message: "Login successful.",
            data: userResponse
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// logout
exports.logout = async (req, res) => {

    try {

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// forgot password
exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        await authService.forgotPassword(email);

        return res.status(200).json({
            success: true,
            message:
                "If an account with that email exists, a password reset link has been sent."
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.resetPassword = async (req, res) => {
    res.json({ message: "Reset Password API" });
};

exports.changePassword = async (req, res) => {
    res.json({ message: "Change Password API" });
};

// get current user
exports.getCurrentUser = async (req, res) => {

    return res.status(200).json({
        success: true,
        message: "User retrieved successfully.",
        data: req.user
    });

};

// check auth
exports.checkAuth = async (req, res) => {

    return res.status(200).json({
        success: true,
        authenticated: true,
        user: req.user
    });

};