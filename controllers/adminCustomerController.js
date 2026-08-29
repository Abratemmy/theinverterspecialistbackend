const customerService =
    require("../services/adminCustomerService");


// ============================================================
// GET CUSTOMERS
// ============================================================

exports.getCustomers = async (
    req,
    res
) => {

    try {

        const {
            search,
            role,
            status,
            page,
            limit
        } = req.query;


        const result =
            await customerService.getCustomers({

                search,
                role,
                status,
                page,
                limit

            });


        return res.status(200).json({

            success: true,

            message:
                "Customers retrieved successfully.",

            data:
                result.data,

            pagination:
                result.pagination

        });

    }
    catch (error) {

        console.error(
            "Get customers error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// ============================================================
// GET SINGLE CUSTOMER
// ============================================================

exports.getCustomerById = async (
    req,
    res
) => {

    try {

        const customer =
            await customerService.getCustomerById(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            message:
                "Customer retrieved successfully.",

            data:
                customer

        });

    }
    catch (error) {

        return res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

};


// ============================================================
// UPDATE ROLE
// ============================================================

exports.updateUserRole = async (
    req,
    res
) => {

    try {

        const {
            role
        } = req.body;


        const customer =
            await customerService.updateUserRole(

                req.params.id,

                role,

                req.user.id

            );


        return res.status(200).json({

            success: true,

            message:
                "User role updated successfully.",

            data:
                customer

        });

    }
    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// ============================================================
// UPDATE STATUS
// ============================================================

exports.updateUserStatus = async (
    req,
    res
) => {

    try {

        const {
            status
        } = req.body;


        const customer =
            await customerService.updateUserStatus(

                req.params.id,

                status,

                req.user.id

            );


        return res.status(200).json({

            success: true,

            message:
                "User status updated successfully.",

            data:
                customer

        });

    }
    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};