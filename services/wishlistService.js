const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const ProductMedia = require("../models/ProductMedia");


// ========================================================
// GET USER WISHLIST
// ========================================================

exports.getWishlist = async (userId) => {

    const wishlist = await Wishlist.findAll({

        where: {
            user_id: userId
        },

        include: [
            {
                model: Product,

                where: {
                    status: "active"
                },

                required: true,

                include: [
                    {
                        model: ProductMedia,

                        as: "media",

                        required: false
                    }
                ]
            }
        ],

        order: [
            ["created_at", "DESC"]
        ]

    });

    return wishlist;
};


// ========================================================
// ADD TO WISHLIST
// ========================================================

exports.addToWishlist = async (
    userId,
    productId
) => {

    // ----------------------------------------------------
    // Check product exists
    // ----------------------------------------------------

    const product =
        await Product.findOne({

            where: {
                id: productId,
                status: "active"
            }

        });


    if (!product) {

        throw new Error(
            "Product not found or is no longer available."
        );

    }


    // ----------------------------------------------------
    // Check if already exists
    // ----------------------------------------------------

    const existingWishlist =
        await Wishlist.findOne({

            where: {
                user_id: userId,
                product_id: productId
            }

        });


    if (existingWishlist) {

        throw new Error(
            "Product is already in your wishlist."
        );

    }


    // ----------------------------------------------------
    // Create wishlist item
    // ----------------------------------------------------

    const wishlist =
        await Wishlist.create({

            user_id: userId,

            product_id: productId

        });


    return wishlist;
};


// ========================================================
// REMOVE FROM WISHLIST
// ========================================================

exports.removeFromWishlist = async (
    userId,
    productId
) => {

    const deleted =
        await Wishlist.destroy({

            where: {
                user_id: userId,
                product_id: productId
            }

        });


    if (!deleted) {

        throw new Error(
            "Product is not in your wishlist."
        );

    }


    return true;
};


// ========================================================
// CHECK WISHLIST
// ========================================================

exports.checkWishlist = async (
    userId,
    productId
) => {

    const wishlist =
        await Wishlist.findOne({

            where: {
                user_id: userId,
                product_id: productId
            }

        });


    return {
        isWishlisted: !!wishlist
    };
};