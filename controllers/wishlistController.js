const wishlistService =
    require("../services/wishlistService");


// ========================================================
// GET WISHLIST
// ========================================================

exports.getWishlist = async (req, res) => {
    try {

        console.log("WISHLIST USER ID:", req.user.id);

        const wishlist =
            await wishlistService.getWishlist(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data: wishlist
        });

    } catch (error) {

        console.error("================================");
        console.error("GET WISHLIST ERROR");
        console.error("MESSAGE:", error.message);
        console.error("NAME:", error.name);
        console.error("STACK:", error.stack);
        console.error("================================");

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ========================================================
// ADD TO WISHLIST
// ========================================================

exports.addToWishlist = async (
    req,
    res
) => {

    try {

        const productId =
            Number(req.params.productId);


        if (!Number.isInteger(productId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product ID."

            });

        }


        const wishlist =
            await wishlistService.addToWishlist(

                req.user.id,

                productId

            );


        return res.status(201).json({

            success: true,

            message:
                "Product added to wishlist.",

            data: wishlist

        });

    } catch (error) {

        console.error(
            "Add wishlist error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to add product to wishlist."

        });

    }

};


// ========================================================
// REMOVE FROM WISHLIST
// ========================================================

exports.removeFromWishlist = async (
    req,
    res
) => {

    try {

        const productId =
            Number(req.params.productId);


        if (!Number.isInteger(productId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product ID."

            });

        }


        await wishlistService.removeFromWishlist(

            req.user.id,

            productId

        );


        return res.status(200).json({

            success: true,

            message:
                "Product removed from wishlist."

        });

    } catch (error) {

        console.error(
            "Remove wishlist error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to remove product from wishlist."

        });

    }

};


// ========================================================
// CHECK WISHLIST
// ========================================================

exports.checkWishlist = async (
    req,
    res
) => {

    try {

        const productId =
            Number(req.params.productId);


        if (!Number.isInteger(productId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product ID."

            });

        }


        const result =
            await wishlistService.checkWishlist(

                req.user.id,

                productId

            );


        return res.status(200).json({

            success: true,

            data: result

        });

    } catch (error) {

        console.error(
            "Check wishlist error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to check wishlist."

        });

    }

};