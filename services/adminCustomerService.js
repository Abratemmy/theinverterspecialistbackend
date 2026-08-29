const {
    Op
} = require("sequelize");

const User = require("../models/User");


// ============================================================
// GET CUSTOMERS
// ============================================================

// ============================================================
// GET CUSTOMERS
// ============================================================

exports.getCustomers = async ({
    search,
    role,
    status,
    page = 1,
    limit = 10
} = {}) => {

    const where = {};


    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------

    const currentPage =
        Math.max(
            Number(page) || 1,
            1
        );

    const pageLimit =
        Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            100
        );

    const offset =
        (currentPage - 1) * pageLimit;


    // --------------------------------------------------------
    // Role filter
    // --------------------------------------------------------

    if (
        role &&
        ["customer", "manager", "admin"].includes(role)
    ) {

        where.role = role;

    }


    // --------------------------------------------------------
    // Status filter
    // --------------------------------------------------------

    if (
        status &&
        ["active", "inactive", "blocked"].includes(status)
    ) {

        where.status = status;

    }


    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------

    if (search?.trim()) {

        const searchValue =
            `%${search.trim()}%`;

        where[Op.or] = [

            {
                first_name: {
                    [Op.like]:
                        searchValue
                }
            },

            {
                last_name: {
                    [Op.like]:
                        searchValue
                }
            },

            {
                email: {
                    [Op.like]:
                        searchValue
                }
            },

            {
                phone: {
                    [Op.like]:
                        searchValue
                }
            }

        ];

    }


    // --------------------------------------------------------
    // Get users
    // --------------------------------------------------------

    const {
        rows,
        count
    } = await User.findAndCountAll({

        where,

        attributes: [

            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "role",
            "status",
            "profile_image",
            "last_login",
            "created_at",
            "updated_at"

        ],

        order: [

            ["created_at", "DESC"]

        ],

        limit:
            pageLimit,

        offset,

    });


    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------

    const total =
        Number(count);

    const totalPages =
        Math.ceil(
            total / pageLimit
        );


    return {

        data:
            rows,

        pagination: {

            page:
                currentPage,

            limit:
                pageLimit,

            total,

            totalPages,

        }

    };

};


// ============================================================
// GET SINGLE CUSTOMER
// ============================================================

exports.getCustomerById = async (
    userId
) => {

    const user =
        await User.findByPk(

            userId,

            {

                attributes: [

                    "id",
                    "first_name",
                    "last_name",
                    "email",
                    "phone",
                    "role",
                    "status",
                    "profile_image",
                    "last_login",
                    "created_at",
                    "updated_at"

                ]

            }

        );


    if (!user) {

        throw new Error(
            "User not found."
        );

    }


    return user;

};


// ============================================================
// UPDATE USER ROLE
// ============================================================

exports.updateUserRole = async (
    userId,
    role,
    adminUserId
) => {

    // --------------------------------------------------------
    // Validate role
    // --------------------------------------------------------

    const allowedRoles = [

        "customer",
        "manager",
        "admin"

    ];


    if (
        !allowedRoles.includes(role)
    ) {

        throw new Error(
            "Invalid user role."
        );

    }


    // --------------------------------------------------------
    // Find user
    // --------------------------------------------------------

    const user =
        await User.findByPk(
            userId
        );


    if (!user) {

        throw new Error(
            "User not found."
        );

    }


    // --------------------------------------------------------
    // Prevent admin from changing own role
    // --------------------------------------------------------

    if (
        Number(user.id) ===
        Number(adminUserId)
    ) {

        throw new Error(
            "You cannot change your own role."
        );

    }


    // --------------------------------------------------------
    // Update role
    // --------------------------------------------------------

    user.role =
        role;


    await user.save();


    // --------------------------------------------------------
    // Remove password
    // --------------------------------------------------------

    const response =
        user.toJSON();

    delete response.password;

    delete response.reset_password_token;

    delete response.reset_password_expires;


    return response;

};


// ============================================================
// UPDATE USER STATUS
// ============================================================

exports.updateUserStatus = async (
    userId,
    status,
    adminUserId
) => {

    const allowedStatuses = [

        "active",
        "inactive",
        "blocked"

    ];


    if (
        !allowedStatuses.includes(status)
    ) {

        throw new Error(
            "Invalid user status."
        );

    }


    const user =
        await User.findByPk(
            userId
        );


    if (!user) {

        throw new Error(
            "User not found."
        );

    }


    // --------------------------------------------------------
    // Prevent admin from blocking/deactivating self
    // --------------------------------------------------------

    if (
        Number(user.id) ===
        Number(adminUserId)
    ) {

        throw new Error(
            "You cannot change your own account status."
        );

    }


    user.status =
        status;


    await user.save();


    const response =
        user.toJSON();

    delete response.password;

    delete response.reset_password_token;

    delete response.reset_password_expires;


    return response;

};