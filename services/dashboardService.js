const { Op, fn, col, literal } = require("sequelize");

const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

// Configurable Low Stock Threshold
const LOW_STOCK_THRESHOLD =
    Number(process.env.LOW_STOCK_THRESHOLD) || 5;



// =======================================
// Dashboard Summary
// =======================================

const getSummary = async () => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const [

        totalUsers,

        totalProducts,

        totalCategories,

        totalBrands,

        totalOrders,

        pendingOrders,

        processingOrders,

        packedOrders,

        shippedOrders,

        deliveredOrders,

        cancelledOrders,

        totalRevenue,

        todayOrders,

        todayRevenue,

        lowStockCount

    ] = await Promise.all([

        User.count({

            where: {

                role: "customer"

            }

        }),

        Product.count({

            where: {

                status: "active"

            }

        }),

        Category.count(),

        Brand.count(),

        Order.count(),

        Order.count({

            where: {

                order_status: "pending"

            }

        }),

        Order.count({

            where: {

                order_status: "processing"

            }

        }),

        Order.count({

            where: {

                order_status: "packed"

            }

        }),

        Order.count({

            where: {

                order_status: "shipped"

            }

        }),

        Order.count({

            where: {

                order_status: "delivered"

            }

        }),

        Order.count({

            where: {

                order_status: "cancelled"

            }

        }),

        Order.findOne({

            attributes: [

                [

                    fn("SUM", col("total_amount")),

                    "totalRevenue"

                ]

            ],

            where: {

                payment_status: "paid"

            },

            raw: true

        }),

        Order.count({

            where: {

                created_at: {

                    [Op.gte]: today

                }

            }

        }),

        Order.findOne({

            attributes: [

                [

                    fn("SUM", col("total_amount")),

                    "todayRevenue"

                ]

            ],

            where: {

                payment_status: "paid",

                created_at: {

                    [Op.gte]: today

                }

            },

            raw: true

        }),

        Product.count({

            where: {

                quantity: {

                    [Op.lt]: LOW_STOCK_THRESHOLD

                },

                status: "active"

            }

        })

    ]);

    return {

        total_users: totalUsers,

        total_products: totalProducts,

        total_categories: totalCategories,

        total_brands: totalBrands,

        total_orders: totalOrders,

        pending_orders: pendingOrders,

        processing_orders: processingOrders,

        packed_orders: packedOrders,

        shipped_orders: shippedOrders,

        delivered_orders: deliveredOrders,

        cancelled_orders: cancelledOrders,

        total_revenue:
            Number(totalRevenue?.totalRevenue || 0),

        today_orders: todayOrders,

        today_revenue:
            Number(todayRevenue?.todayRevenue || 0),

        low_stock_count: lowStockCount

    };

};

// =======================================
// Recent Orders
// =======================================

const getRecentOrders = async () => {

    const orders = await Order.findAll({

        limit: 10,

        order: [

            ["created_at", "DESC"]

        ],

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

            }

        ]

    });

    return orders.map(order => ({

        id: order.id,

        order_number: order.order_number,

        customer: {

            id: order.user.id,

            name:
                `${order.user.first_name} ${order.user.last_name}`,

            email: order.user.email

        },

        total_amount:
            Number(order.total_amount),

        payment_status:
            order.payment_status,

        order_status:
            order.order_status,

        created_at:
            order.created_at

    }));

};



// =======================================
// Recent Customers
// =======================================

const getRecentCustomers = async () => {

    const customers = await User.findAll({

        where: {

            role: "customer"

        },

        attributes: [

            "id",

            "first_name",

            "last_name",

            "email",

            "phone",

            "status",

            "created_at"

        ],

        order: [

            ["created_at", "DESC"]

        ],

        limit: 5

    });

    return customers.map(customer => ({

        id: customer.id,

        full_name:
            `${customer.first_name} ${customer.last_name}`,

        email: customer.email,

        phone: customer.phone,

        status: customer.status,

        joined_at: customer.created_at

    }));

};

// =======================================
// Top Selling Products
// =======================================

const getTopSellingProducts = async () => {

    const products = await OrderItem.findAll({

        attributes: [

            "product_id",

            [
                fn("SUM", col("OrderItem.quantity")),
                "total_sold"
            ],

            [
                fn("SUM", col("OrderItem.total_price")),
                "total_revenue"
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

    return products.map(item => ({

        product_id:
            item.product.id,

        product_name:
            item.product.name,

        unit_price:
            Number(item.product.price),

        current_stock:
            item.product.quantity,

        total_sold:
            Number(item.get("total_sold")),

        total_revenue:
            Number(item.get("total_revenue"))

    }));

};

// =======================================
// Low Stock Products
// =======================================

const getLowStockProducts = async () => {

    const products = await Product.findAll({

        where: {

            quantity: {

                [Op.lt]: LOW_STOCK_THRESHOLD

            },

            status: "active"

        },

        attributes: [

            "id",

            "name",

            "price",

            "quantity"

        ],

        order: [

            ["quantity", "ASC"]

        ],

        limit: 10

    });

    return products.map(product => ({

        id: product.id,

        name: product.name,

        unit_price: Number(product.price),

        quantity: product.quantity,

        stock_status:
            product.quantity === 0
                ? "Out of Stock"
                : "Low Stock"

    }));

};

// =======================================
// Monthly Sales
// =======================================

const getMonthlySales = async () => {

    const sales = await Order.findAll({

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

                fn("SUM", col("total_amount")),

                "revenue"

            ],

            [

                fn("COUNT", col("id")),

                "orders"

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

    return sales.map(item => ({

        year:
            Number(item.year),

        month_number:
            Number(item.month_number),

        month:
            item.month,

        revenue:
            Number(item.revenue),

        orders:
            Number(item.orders)

    }));

};

// =======================================
// Dashboard
// =======================================

exports.getDashboard = async () => {

    const [

        summary,

        recentOrders,

        recentCustomers,

        topSellingProducts,

        lowStockProducts,

        monthlySales

    ] = await Promise.all([

        getSummary(),

        getRecentOrders(),

        getRecentCustomers(),

        getTopSellingProducts(),

        getLowStockProducts(),

        getMonthlySales()

    ]);

    return {

        summary,

        recent_orders: recentOrders,

        recent_customers: recentCustomers,

        top_selling_products: topSellingProducts,

        low_stock_products: lowStockProducts,

        monthly_sales: monthlySales

    };

};