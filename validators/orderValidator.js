const { body } = require("express-validator");


// ============================================================
// CREATE ORDER
// ============================================================

exports.createOrderValidator = [

    // --------------------------------------------------------
    // Fulfillment method
    // --------------------------------------------------------

    body("fulfillment_method")
        .notEmpty()
        .withMessage(
            "Fulfillment method is required."
        )
        .isIn([
            "shipping",
            "pickup"
        ])
        .withMessage(
            "Fulfillment method must be shipping or pickup."
        ),


    // --------------------------------------------------------
    // Shipping address
    // --------------------------------------------------------

    body("shipping_address_id")
        .custom((value, { req }) => {

            // Pickup does not require an address
            if (
                req.body.fulfillment_method ===
                "pickup"
            ) {
                return true;
            }


            // Shipping requires an address
            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                throw new Error(
                    "Shipping address is required."
                );
            }


            // Must be an integer
            if (
                !Number.isInteger(
                    Number(value)
                )
            ) {
                throw new Error(
                    "Shipping address must be an integer."
                );
            }


            return true;

        }),


    // --------------------------------------------------------
    // Notes
    // --------------------------------------------------------

    body("notes")
        .optional()
        .isString()
        .withMessage(
            "Notes must be a string."
        )

];


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

exports.updateOrderStatusValidator = [

    body("order_status")
        .notEmpty()
        .withMessage(
            "Status is required."
        )
        .isIn([
            "pending",
            "processing",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ])
        .withMessage(
            "Invalid order status."
        )

]

