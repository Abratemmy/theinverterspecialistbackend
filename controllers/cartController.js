const cartService =
    require("../services/cartService");


// ============================================================
// GET GUEST TOKEN
// ============================================================

const getGuestToken = (req) => {

    return (
        req.cookies?.guest_cart_token ||
        req.headers["x-guest-token"] ||
        null
    );

};


// ============================================================
// SET GUEST TOKEN
// ============================================================

const setGuestToken = (
    res,
    guestToken
) => {

    if (!guestToken) {
        return;
    }


    res.cookie(
        "guest_cart_token",
        guestToken,
        {

            httpOnly: true,

            secure:
                process.env.NODE_ENV ===
                "production",

            sameSite: "lax",

            maxAge:
                30 *
                24 *
                60 *
                60 *
                1000,

            path: "/",

        }
    );

};


// ============================================================
// ADD TO CART
// ============================================================

exports.addToCart =
async (
    req,
    res
) => {

    try {

        const userId =
            req.user?.id ||
            null;


        // IMPORTANT:
        // Logged-in users don't use guest cart.
        const guestToken =
            userId
                ? null
                : getGuestToken(req);


        const result =
            await cartService.addToCart({

                userId,

                guestToken,

                product_id:
                    req.body.product_id,

                quantity:
                    req.body.quantity,

            });


        // ====================================================
        // SAVE NEW GUEST TOKEN
        // ====================================================

        if (
            !userId &&
            result.guestToken
        ) {

            setGuestToken(
                res,
                result.guestToken
            );

        }


        return res.status(200).json({

            success: true,

            message:
                result.message,

            data:
                result.item,

        });

    } catch (error) {

        console.error(
            "Add cart error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message,

        });

    }

};



// ============================================================
// GET CART
// ============================================================

exports.getCart =
async (
    req,
    res
) => {

    try {

        const userId =
            req.user?.id ||
            null;


        // ====================================================
        // IMPORTANT
        // Logged-in users ONLY use their user cart.
        // ====================================================

        const guestToken =
            userId
                ? null
                : getGuestToken(req);


        const result =
            await cartService.getCart({

                userId,

                guestToken,

            });


        // ====================================================
        // SAVE GUEST TOKEN IF NEW
        // ====================================================

        if (
            !userId &&
            result.guestToken
        ) {

            setGuestToken(
                res,
                result.guestToken
            );

        }


        return res.status(200).json({

            success: true,

            data:
                result.cart,

            guestToken:
                result.guestToken ||
                null,

        });

    } catch (error) {

        console.error(
            "Get cart error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

        });

    }

};



// ============================================================
// UPDATE CART ITEM
// ============================================================

exports.updateCartItem = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?.id || null;


        const guestToken =
            userId
                ? null
                : req.cookies?.guest_cart_token ||
                  req.headers["x-guest-token"] ||
                  null;


        console.log(
            "================================="
        );

        console.log(
            "UPDATE CART CONTROLLER"
        );

        console.log(
            "userId:",
            userId
        );

        console.log(
            "guestToken:",
            guestToken
        );

        console.log(
            "itemId:",
            req.params.itemId
        );

        console.log(
            "body:",
            req.body
        );

        console.log(
            "================================="
        );


        const item =
            await cartService.updateCartItem({

                itemId:
                    req.params.itemId,

                userId,

                guestToken,

                quantity:
                    req.body.quantity,

            });


        return res.status(200).json({

            success: true,

            message:
                "Cart quantity updated successfully.",

            data:
                item,

        });

    } catch (error) {

        console.error(
            "UPDATE CART ERROR:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message,

        });

    }

};



// ============================================================
// REMOVE CART ITEM
// ============================================================

exports.removeCartItem =
async (
    req,
    res
) => {

    try {

        const userId =
            req.user?.id ||
            null;


        const guestToken =
            userId
                ? null
                : getGuestToken(req);


        const itemId =
            Number(
                req.params.itemId
            );


        if (
            !Number.isInteger(itemId) ||
            itemId < 1
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid cart item ID.",

            });

        }


        await cartService.removeCartItem({

            itemId,

            userId,

            guestToken,

        });


        return res.status(200).json({

            success: true,

            message:
                "Item removed from cart.",

        });

    } catch (error) {

        console.error(
            "Remove cart item error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message,

        });

    }

};



// ============================================================
// CLEAR CART
// ============================================================

exports.clearCart =
async (
    req,
    res
) => {

    try {

        const userId =
            req.user?.id ||
            null;


        const guestToken =
            userId
                ? null
                : getGuestToken(req);


        await cartService.clearCart({

            userId,

            guestToken,

        });


        return res.status(200).json({

            success: true,

            message:
                "Cart cleared successfully.",

        });

    } catch (error) {

        console.error(
            "Clear cart error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message,

        });

    }

};



// ============================================================
// MERGE GUEST CART
// ============================================================

exports.mergeGuestCart =
async (
    req,
    res
) => {

    try {

        // ====================================================
        // USER MUST BE LOGGED IN
        // ====================================================

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required.",

            });

        }


        const guestToken =
            getGuestToken(req);


        // ====================================================
        // NO GUEST CART
        // ====================================================

        if (!guestToken) {

            return res.status(200).json({

                success: true,

                message:
                    "No guest cart to merge.",

                data:
                    null,

            });

        }


        // ====================================================
        // MERGE
        // ====================================================

        const cart =
            await cartService.mergeGuestCartIntoUserCart({

                userId:
                    req.user.id,

                guestToken,

            });


        // ====================================================
        // CLEAR GUEST COOKIE
        // ====================================================

        res.clearCookie(
            "guest_cart_token",
            {

                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite: "lax",

                path: "/",

            }
        );


        return res.status(200).json({

            success: true,

            message:
                cart
                    ? "Guest cart merged successfully."
                    : "No active guest cart found.",

            data:
                cart,

        });

    } catch (error) {

        console.error(
            "Merge cart error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

        });

    }

};