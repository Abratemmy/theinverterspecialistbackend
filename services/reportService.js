const { Op, fn, col } = require("sequelize");

const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const OrderItem = require("../models/OrderItem");

// =======================================
// Daily Sales Report
// =======================================

exports.getDailySalesReport = async () => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const report = await Order.findOne({

        attributes: [

            [
                fn("COUNT", col("id")),
                "orders"
            ],

            [
                fn("SUM", col("total_amount")),
                "revenue"
            ],

            [
                fn("AVG", col("total_amount")),
                "average_order_value"
            ]

        ],

        where: {

            payment_status: "paid",

            created_at: {

                [Op.gte]: today

            }

        },

        raw: true

    });

    return {

        date: today.toISOString().split("T")[0],

        orders:
            Number(report.orders || 0),

        revenue:
            Number(report.revenue || 0),

        average_order_value:
            Number(report.average_order_value || 0)

    };

};

// =======================================
// Weekly Sales Report
// =======================================

exports.getWeeklySalesReport = async () => {

    const reports = await Order.findAll({

        attributes: [

            [
                fn("YEAR", col("created_at")),
                "year"
            ],

            [
                fn("WEEK", col("created_at")),
                "week"
            ],

            [
                fn("COUNT", col("id")),
                "orders"
            ],

            [
                fn("SUM", col("total_amount")),
                "revenue"
            ],

            [
                fn("AVG", col("total_amount")),
                "average_order_value"
            ]

        ],

        where: {

            payment_status: "paid"

        },

        group: [

            fn("YEAR", col("created_at")),

            fn("WEEK", col("created_at"))

        ],

        order: [

            [fn("YEAR", col("created_at")), "ASC"],

            [fn("WEEK", col("created_at")), "ASC"]

        ],

        raw: true

    });

    return reports.map(report => ({

        year: Number(report.year),

        week: Number(report.week),

        orders: Number(report.orders),

        revenue: Number(report.revenue || 0),

        average_order_value:
            Number(report.average_order_value || 0)

    }));

};

// =======================================
// Monthly Sales Report
// =======================================

exports.getMonthlySalesReport = async () => {

    const reports = await Order.findAll({

        attributes: [

            [
                fn("YEAR", col("created_at")),
                "year"
            ],

            [
                fn("MONTH", col("created_at")),
                "month_number"
            ],

            [
                fn("MONTHNAME", col("created_at")),
                "month"
            ],

            [
                fn("COUNT", col("id")),
                "orders"
            ],

            [
                fn("SUM", col("total_amount")),
                "revenue"
            ],

            [
                fn("AVG", col("total_amount")),
                "average_order_value"
            ]

        ],

        where: {

            payment_status: "paid"

        },

        group: [
            fn("YEAR", col("created_at")),
            fn("MONTH", col("created_at")),
            fn("MONTHNAME", col("created_at"))
        ],

        order: [
            [fn("YEAR", col("created_at")), "ASC"],
            [fn("MONTH", col("created_at")), "ASC"]
        ],

        raw: true

    });

    return reports.map(report => ({

        year:
            Number(report.year),

        month_number:
            Number(report.month_number),

        month:
            report.month,

        orders:
            Number(report.orders),

        revenue:
            Number(report.revenue || 0),

        average_order_value:
            Number(report.average_order_value || 0)

    }));

};

// =======================================
// Yearly Sales Report
// =======================================

exports.getYearlySalesReport = async () => {

    const reports = await Order.findAll({

        attributes: [

            [
                fn("YEAR", col("created_at")),
                "year"
            ],

            [
                fn("COUNT", col("id")),
                "orders"
            ],

            [
                fn("SUM", col("total_amount")),
                "revenue"
            ],

            [
                fn("AVG", col("total_amount")),
                "average_order_value"
            ]

        ],

        where: {

            payment_status: "paid"

        },

        group: [

            fn("YEAR", col("created_at"))

        ],

        order: [

            [fn("YEAR", col("created_at")), "ASC"]

        ],

        raw: true

    });

    return reports.map(report => ({

        year:
            Number(report.year),

        orders:
            Number(report.orders),

        revenue:
            Number(report.revenue || 0),

        average_order_value:
            Number(report.average_order_value || 0)

    }));

};

// =======================================
// Custom Sales Report
// =======================================

exports.getCustomSalesReport = async (startDate, endDate) => {

    if (!startDate || !endDate) {
        throw new Error(
            "Start date and end date are required."
        );
    }

    // Convert to full day range
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const report = await Order.findOne({

        attributes: [

            [
                fn("COUNT", col("id")),
                "orders"
            ],

            [
                fn("SUM", col("total_amount")),
                "revenue"
            ],

            [
                fn("AVG", col("total_amount")),
                "average_order_value"
            ]

        ],

        where: {

            payment_status: "paid",

            created_at: {

                [Op.between]: [

                    start,
                    end

                ]

            }

        },

        raw: true

    });

    return {

        start_date: startDate,

        end_date: endDate,

        orders:
            Number(report.orders || 0),

        revenue:
            Number(report.revenue || 0),

        average_order_value:
            Number(report.average_order_value || 0)

    };

};

// =======================================
// Orders Report
// =======================================

exports.getOrdersReport = async (query) => {

    const {

        page = 1,

        limit = 10,

        order_status,

        payment_status,

        start_date,

        end_date

    } = query;

    const where = {};

    // Filter by order status
    if (order_status) {
        where.order_status = order_status;
    }

    // Filter by payment status
    if (payment_status) {
        where.payment_status = payment_status;
    }

    // Filter by date range
    if (start_date && end_date) {

        const start = new Date(start_date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);

        where.created_at = {
            [Op.between]: [start, end]
        };

    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Order.findAndCountAll({

        where,

        include: [

            {
                model: User,
                as: "user",
                attributes: [
                    "id",
                    "first_name",
                    "last_name",
                    "email",
                    "phone"
                ]
            }

        ],

        order: [

            ["created_at", "DESC"]

        ],

        offset,

        limit: Number(limit)

    });

    return {

        pagination: {

            total_records: count,

            current_page: Number(page),

            total_pages: Math.ceil(count / limit),

            per_page: Number(limit)

        },

        orders: rows.map(order => ({

            id: order.id,

            order_number: order.order_number,

            customer: {

                id: order.user.id,

                name:
                    `${order.user.first_name} ${order.user.last_name}`,

                email: order.user.email,

                phone: order.user.phone

            },

            total_amount:
                Number(order.total_amount),

            payment_status:
                order.payment_status,

            order_status:
                order.order_status,

            created_at:
                order.created_at

        }))

    };

};

// =======================================
// Payments Report
// =======================================

exports.getPaymentsReport = async (query) => {

    const {

        page = 1,

        limit = 10,

        status,

        start_date,

        end_date

    } = query;

    const where = {};

    // Filter by payment status
    if (status) {
        where.status = status;
    }

    // Filter by date range
    if (start_date && end_date) {

        const start = new Date(start_date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);

        where.created_at = {
            [Op.between]: [start, end]
        };

    }

    const offset = (page - 1) * limit;

    // Summary Statistics
    const [

        successful,

        pending,

        failed,

        refunded,

        totalRevenue

    ] = await Promise.all([

        Payment.count({
            where: {
                ...where,
                status: "successful"
            }
        }),

        Payment.count({
            where: {
                ...where,
                status: "pending"
            }
        }),

        Payment.count({
            where: {
                ...where,
                status: "failed"
            }
        }),

        Payment.count({
            where: {
                ...where,
                status: "refunded"
            }
        }),

        Payment.findOne({

            attributes: [

                [
                    fn("SUM", col("amount")),
                    "revenue"
                ]

            ],

            where: {

                ...where,

                status: "successful"

            },

            raw: true

        })

    ]);

    // Payment Records
    const { rows, count } = await Payment.findAndCountAll({

        where,

        include: [

            {

                model: User,

                as: "user",

                attributes: [

                    "id",

                    "first_name",

                    "last_name",

                    "email"

                ]

            },

            {

                model: Order,

                as: "order",

                attributes: [

                    "id",

                    "order_number"

                ]

            }

        ],

        order: [

            ["created_at", "DESC"]

        ],

        offset,

        limit: Number(limit)

    });

    return {

        summary: {

            successful,

            pending,

            failed,

            refunded,

            total_revenue:
                Number(totalRevenue?.revenue || 0)

        },

        pagination: {

            total_records: count,

            current_page: Number(page),

            total_pages:
                Math.ceil(count / limit),

            per_page: Number(limit)

        },

        payments: rows.map(payment => ({

            id: payment.id,

            reference:
                payment.payment_reference,

            order_number:
                payment.order?.order_number,

            customer: payment.user ? {

                id: payment.user.id,

                name:
                    `${payment.user.first_name} ${payment.user.last_name}`,

                email:
                    payment.user.email

            } : null,

            amount:
                Number(payment.amount),

            payment_method:
                payment.payment_method,

            status:
                payment.status,

            paid_at:
                payment.paid_at,

            created_at:
                payment.created_at

        }))

    };

};

// =======================================
// Customers Report
// =======================================

exports.getCustomersReport = async (query) => {

    const {

        page = 1,

        limit = 10,

        start_date,

        end_date

    } = query;

    const where = {};

    // Filter by registration date
    if (start_date && end_date) {

        const start = new Date(start_date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);

        where.created_at = {

            [Op.between]: [

                start,

                end

            ]

        };

    }

    const offset = (page - 1) * limit;

    // Summary
    const [

        totalCustomers,

        activeCustomers,

        newCustomers

    ] = await Promise.all([

        User.count({

            where: {

                role: "customer"

            }

        }),

        User.count({

            where: {

                role: "customer",

                status: "active"

            }

        }),

        User.count({

            where: {

                role: "customer",

                ...where

            }

        })

    ]);

    // Top Customers
    const topCustomers = await User.findAll({

        where: {

            role: "customer"

        },

        attributes: [

            "id",

            "first_name",

            "last_name",

            "email"

        ],

        include: [

            {

                model: Order,

                as: "orders",

                attributes: [

                    [

                        fn("COUNT", col("orders.id")),

                        "total_orders"

                    ],

                    [

                        fn("SUM", col("orders.total_amount")),

                        "total_spent"

                    ]

                ],

                where: {

                    payment_status: "paid"

                },

                required: false

            }

        ],

        group: [

            "User.id"

        ],

        order: [

            [

                literal("total_spent"),

                "DESC"

            ]

        ],

        limit: 10

    });

    // Customer List
    const {

        rows,

        count

    } = await User.findAndCountAll({

        where: {

            role: "customer",

            ...where

        },

        order: [

            [

                "created_at",

                "DESC"

            ]

        ],

        offset,

        limit: Number(limit)

    });

    return {

        summary: {

            total_customers: totalCustomers,

            active_customers: activeCustomers,

            new_customers: newCustomers

        },

        top_customers: topCustomers.map(customer => ({

            id: customer.id,

            name:
                `${customer.first_name} ${customer.last_name}`,

            email: customer.email,

            total_orders:
                Number(
                    customer.orders?.[0]?.get("total_orders") || 0
                ),

            total_spent:
                Number(
                    customer.orders?.[0]?.get("total_spent") || 0
                )

        })),

        pagination: {

            total_records: count,

            current_page: Number(page),

            total_pages:
                Math.ceil(count / limit),

            per_page:
                Number(limit)

        },

        customers: rows.map(customer => ({

            id: customer.id,

            first_name: customer.first_name,

            last_name: customer.last_name,

            email: customer.email,

            phone: customer.phone,

            status: customer.status,

            created_at: customer.created_at

        }))

    };

};

// =======================================
// Products Report
// =======================================

exports.getProductsReport = async (query) => {

    const {

        page = 1,

        limit = 10,

        status,

        category_id,

        brand_id

    } = query;

    const where = {};

    if (status) {
        where.status = status;
    }

    if (category_id) {
        where.category_id = category_id;
    }

    if (brand_id) {
        where.brand_id = brand_id;
    }

    const offset = (page - 1) * limit;

    // Summary
    const [

        totalProducts,

        activeProducts,

        inactiveProducts,

        lowStockProducts,

        outOfStockProducts,

        inventoryValue

    ] = await Promise.all([

        Product.count(),

        Product.count({
            where: {
                status: "active"
            }
        }),

        Product.count({
            where: {
                status: "inactive"
            }
        }),

        Product.count({
            where: {
                quantity: {
                    [Op.gt]: 0,
                    [Op.lt]: 5
                }
            }
        }),

        Product.count({
            where: {
                quantity: 0
            }
        }),

        Product.findOne({

            attributes: [

                [
                    fn(
                        "SUM",
                        literal("price * quantity")
                    ),
                    "inventory_value"
                ]

            ],

            raw: true

        })

    ]);

    // Top Selling Products
    const topSellingProducts = await OrderItem.findAll({

        attributes: [

            "product_id",

            [
                fn(
                    "SUM",
                    col("OrderItem.quantity")
                ),
                "total_sold"
            ]

        ],

        include: [

            {

                model: Product,

                as: "product",

                attributes: [

                    "id",

                    "name",

                    "price",

                    "quantity"

                ]

            },

            {

                model: Order,

                as: "order",

                attributes: [],

                where: {

                    payment_status: "paid"

                }

            }

        ],

        group: [

            "product_id",

            "product.id"

        ],

        order: [

            [

                literal("total_sold"),

                "DESC"

            ]

        ],

        limit: 10

    });

    // Products List
    const {

        rows,

        count

    } = await Product.findAndCountAll({

        where,

        include: [

            {

                model: Category,

                as: "category",

                attributes: [

                    "id",

                    "name"

                ]

            },

            {

                model: Brand,

                as: "brand",

                attributes: [

                    "id",

                    "name"

                ]

            }

        ],

        order: [

            [

                "created_at",

                "DESC"

            ]

        ],

        offset,

        limit: Number(limit)

    });

    return {

        summary: {

            total_products: totalProducts,

            active_products: activeProducts,

            inactive_products: inactiveProducts,

            low_stock_products: lowStockProducts,

            out_of_stock_products: outOfStockProducts,

            inventory_value:
                Number(
                    inventoryValue?.inventory_value || 0
                )

        },

        top_selling_products:

            topSellingProducts.map(item => ({

                product_id:
                    item.product.id,

                product_name:
                    item.product.name,

                total_sold:
                    Number(
                        item.get("total_sold")
                    ),

                current_stock:
                    item.product.quantity,

                unit_price:
                    Number(item.product.price)

            })),

        pagination: {

            total_records: count,

            current_page: Number(page),

            total_pages:
                Math.ceil(count / limit),

            per_page:
                Number(limit)

        },

        products:

            rows.map(product => ({

                id: product.id,

                name: product.name,

                category:
                    product.category?.name,

                brand:
                    product.brand?.name,

                price:
                    Number(product.price),

                quantity:
                    product.quantity,

                status:
                    product.status

            }))

    };

};