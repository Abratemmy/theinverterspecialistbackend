const authService = require("../services/authService");
const cartService = require("../services/cartService");


// ============================================================
// SHARED COOKIE DOMAIN
// ============================================================
// In production, set this so the cookie is valid on BOTH
// theinverterspecialist.com (frontend) and
// api.theinverterspecialist.com (backend). Locally (dev), we
// leave it undefined so cookies still work on localhost.

const COOKIE_DOMAIN =
    process.env.NODE_ENV === "production"
        ? ".theinverterspecialist.com"
        : undefined;


// ============================================================
// GET GUEST CART TOKEN
// ============================================================

const getGuestCartToken = (req) => {
    return req.cookies?.guest_cart_token || null;
};


// ============================================================
// REGISTER
// ============================================================

exports.register = async (req, res) => {

    try {

        const { user, token } =
            await authService.register(req.body);


        // ====================================================
        // SAVE JWT
        // ====================================================

        res.cookie("token", token, {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite: "lax",

            domain: COOKIE_DOMAIN,

            maxAge:
                7 * 24 * 60 * 60 * 1000,

            path: "/"
        });


        // ====================================================
        // MERGE GUEST CART
        // ====================================================

        const guestToken =
            getGuestCartToken(req);


        if (guestToken) {

            try {

                await cartService.mergeGuestCartIntoUserCart({
                    userId: user.id,
                    guestToken
                });

                // Guest cart is no longer needed
                res.clearCookie(
                    "guest_cart_token",
                    {
                        httpOnly: true,

                        secure:
                            process.env.NODE_ENV ===
                            "production",

                        sameSite: "lax",

                        domain: COOKIE_DOMAIN,

                        path: "/"
                    }
                );

            } catch (cartError) {

                console.error(
                    "Guest cart merge error during registration:",
                    cartError
                );

                // We don't want cart merging to make
                // account creation fail.
            }
        }


        // ====================================================
        // REMOVE PASSWORD
        // ====================================================

        const userResponse =
            user.toJSON();

        delete userResponse.password;


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            data:
                userResponse

        });

    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// ============================================================
// LOGIN
// ============================================================

exports.login = async (
    req,
    res
) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ====================================================
        // LOGIN
        // ====================================================

        const {
            user,
            token
        } =
            await authService.login(
                email,
                password
            );


        // ====================================================
        // GET GUEST CART TOKEN
        // ====================================================

        const guestToken =
            req.cookies?.guest_cart_token ||
            null;


        console.log(
            "LOGIN USER:",
            user.id
        );

        console.log(
            "LOGIN GUEST TOKEN:",
            guestToken
        );


        // ====================================================
        // SAVE JWT
        // ====================================================

        res.cookie(
            "token",
            token,
            {

                httpOnly:
                    true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    "lax",

                domain:
                    COOKIE_DOMAIN,

                maxAge:
                    Number(
                        process.env.COOKIE_EXPIRES_IN
                    ) * 1000,

                path:
                    "/"

            }
        );


        // ====================================================
        // MERGE GUEST CART
        // ====================================================

        if (guestToken) {

            try {

                const mergedCart =
                    await cartService.mergeGuestCartIntoUserCart({

                        userId:
                            user.id,

                        guestToken

                    });


                console.log(
                    "MERGED CART:",
                    mergedCart?.id
                );


                // Clear guest cart cookie
                res.clearCookie(
                    "guest_cart_token",
                    {

                        httpOnly:
                            true,

                        secure:
                            process.env.NODE_ENV ===
                            "production",

                        sameSite:
                            "lax",

                        domain:
                            COOKIE_DOMAIN,

                        path:
                            "/"

                    }
                );


            } catch (cartError) {

                console.error(
                    "Guest cart merge error:",
                    cartError
                );

            }

        }


        // ====================================================
        // USER RESPONSE
        // ====================================================

        const userResponse = {

            id:
                user.id,

            first_name:
                user.first_name,

            last_name:
                user.last_name,

            email:
                user.email,

            phone:
                user.phone,

            role:
                user.role,

            profile_image:
                user.profile_image,

            status:
                user.status,

            last_login:
                user.last_login,

            created_at:
                user.created_at

        };


        return res.status(200).json({

            success:
                true,

            message:
                "Login successful.",

            data:
                userResponse

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(400).json({

            success:
                false,

            message:
                error.message

        });

    }

};


// ============================================================
// LOGOUT
// ============================================================

exports.logout = async (req, res) => {

    try {

        res.clearCookie(
            "token",
            {

                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite: "lax",

                domain: COOKIE_DOMAIN,

                path: "/"

            }
        );


        return res.status(200).json({

            success: true,

            message:
                "Logout successful."

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// ============================================================
// FORGOT PASSWORD
// ============================================================

exports.forgotPassword = async (
    req,
    res
) => {

    try {

        const { email } =
            req.body;


        await authService.forgotPassword(
            email
        );


        return res.status(200).json({

            success: true,

            message:
                "If an account with that email exists, a password reset link has been sent."

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// ============================================================
// RESET PASSWORD
// ============================================================

exports.resetPassword = async (
    req,
    res
) => {

    try {

        const { token } =
            req.params;

        const { password } =
            req.body;


        await authService.resetPassword(
            token,
            password
        );


        return res.status(200).json({

            success: true,

            message:
                "Password reset successful. You can now log in with your new password."

        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// ============================================================
// CHANGE PASSWORD
// ============================================================

exports.changePassword = async (
    req,
    res
) => {

    res.json({

        message:
            "Change Password API"

    });

};


// ============================================================
// GET CURRENT USER
// ============================================================

exports.getCurrentUser = async (
    req,
    res
) => {

    return res.status(200).json({

        success: true,

        message:
            "User retrieved successfully.",

        data:
            req.user

    });

};


// ============================================================
// CHECK AUTH
// ============================================================

exports.checkAuth = async (
    req,
    res
) => {

    return res.status(200).json({

        success: true,

        authenticated: true,

        user:
            req.user

    });

};

// ============================================================
// UPDATE PROFILE
// ============================================================

exports.updateProfile = async (
    req,
    res
) => {

    try {

        console.log("BODY:", req.body);

        console.log("FILE:", req.file);

        console.log("USER:", req.user);

        const updatedUser =
            await authService.updateProfile(
                req.user.id,
                req.body,
                req.file
            );

        return res.status(200).json({

            success: true,

            message:
                "Profile updated successfully.",

            data:
                updatedUser

        });

    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};