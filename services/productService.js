const { Op } = require("sequelize");

const sequelize = require("../config/database");
const slugify = require("slugify");

const {
    Product,
    Category,
    Brand,
    ProductMedia,
    ProductSpecification
} = require("../models");

// =============================  
// Create a product
// =============================

exports.createProduct = async (body) => {

    const transaction = await sequelize.transaction();

    try {

        const {
            product,
            media = [],
            specifications = []
        } = body;

        // Validate request
        if (!product) {
            throw new Error("Product information is required.");
        }

        // Check Category
        const category = await Category.findByPk(product.category_id, {
            transaction
        });

        if (!category) {
            throw new Error("Category not found.");
        }

        // Check Brand
        const brand = await Brand.findByPk(product.brand_id, {
            transaction
        });

        if (!brand) {
            throw new Error("Brand not found.");
        }

        // Duplicate Name
        const existing = await Product.findOne({
            where: {
                name: product.name
            },
            transaction
        });

        if (existing) {
            throw new Error("Product name already exists.");
        }

        // Generate Slug
        const slug = slugify(product.name, {
            lower: true,
            strict: true
        });

        // Create Product
        const createdProduct = await Product.create(
            {
                ...product,
                slug
            },
            { transaction }
        );

        // Save Media
        if (media.length) {

            await ProductMedia.bulkCreate(

                media.map(item => ({
                    product_id: createdProduct.id,
                    media_type: item.media_type,
                    media_url: item.media_url,
                    thumbnail_url: item.thumbnail_url || null,
                    alt_text: item.alt_text || null,
                    is_primary: item.is_primary || false,
                    display_order: item.display_order || 1
                })),

                { transaction }

            );

        }

        // Save Specifications
        if (specifications.length) {

            await ProductSpecification.bulkCreate(

                specifications.map(item => ({
                    product_id: createdProduct.id,
                    specification_name: item.specification_name,
                    specification_value: item.specification_value,
                    display_order: item.display_order || 1
                })),

                { transaction }

            );

        }

        await transaction.commit();

        // Return Complete Product
        return await Product.findByPk(createdProduct.id, {

            include: [

                {
                    model: Category,
                    as: "category"
                },

                {
                    model: Brand,
                    as: "brand"
                },

                {
                    model: ProductMedia,
                    as: "media"
                },

                {
                    model: ProductSpecification,
                    as: "specifications"
                }

            ]

        });

    } catch (error) {

        await transaction.rollback();

        throw error;

    }

};

// ============================================================
// GET PRODUCTS
// ============================================================

exports.getProducts = async (query = {}) => {

    const {
        page = 1,
        limit = 8,
        search,
        category,
        brand,
        featured,
        minPrice,
        maxPrice,
        sort = "newest"
    } = query;


    // ========================================================
    // PAGINATION
    // ========================================================

    const currentPage =
        Math.max(
            Number(page) || 1,
            1
        );

    const pageLimit =
        Math.min(
            Math.max(
                Number(limit) || 8,
                1
            ),
            100
        );

    const offset =
        (currentPage - 1) * pageLimit;


    // ========================================================
    // WHERE
    // ========================================================

    const where = {

        status: "active"

    };


    // ========================================================
    // SEARCH
    //
    // Searches:
    //
    // Product name
    // OR
    // Category name
    //
    // Example:
    //
    // "inver"
    //
    // matches:
    //
    // Solar Inverter
    // Hybrid Inverter
    // Inverter Battery
    // ========================================================

    const searchText =
        typeof search === "string"
            ? search.trim()
            : "";


    if (searchText) {

        where[Op.or] = [

            {
                name: {
                    [Op.like]:
                        `%${searchText}%`
                }
            },

            {
                "$category.name$": {
                    [Op.like]:
                        `%${searchText}%`
                }
            }

        ];

    }


    // ========================================================
    // CATEGORY FILTER
    // ========================================================

    if (category) {

        where.category_id =
            Number(category);

    }


    // ========================================================
    // BRAND FILTER
    // ========================================================

    if (brand) {

        where.brand_id =
            Number(brand);

    }


    // ========================================================
    // PRICE FILTER
    // ========================================================

    if (
        minPrice !== undefined &&
        minPrice !== ""
    ) {

        where.price = {

            ...(where.price || {}),

            [Op.gte]:
                Number(minPrice)

        };

    }


    if (
        maxPrice !== undefined &&
        maxPrice !== ""
    ) {

        where.price = {

            ...(where.price || {}),

            [Op.lte]:
                Number(maxPrice)

        };

    }


    // ========================================================
    // FEATURED
    // ========================================================

    if (
        featured !== undefined &&
        featured !== ""
    ) {

        where.featured =
            featured === true ||
            featured === "true";

    }


    // ========================================================
    // SORT
    // ========================================================

    let order = [

        [
            "created_at",
            "DESC"
        ]

    ];


    switch (sort) {

        case "oldest":

            order = [

                [
                    "created_at",
                    "ASC"
                ]

            ];

            break;


        case "price_asc":

            order = [

                [
                    "price",
                    "ASC"
                ]

            ];

            break;


        case "price_desc":

            order = [

                [
                    "price",
                    "DESC"
                ]

            ];

            break;


        case "name":

            order = [

                [
                    "name",
                    "ASC"
                ]

            ];

            break;


        case "featured":

            order = [

                [
                    "featured",
                    "DESC"
                ],

                [
                    "created_at",
                    "DESC"
                ]

            ];

            break;


        case "newest":

        default:

            order = [

                [
                    "created_at",
                    "DESC"
                ]

            ];

            break;

    }


    // ========================================================
    // GET PRODUCTS
    // ========================================================

    const {
        rows,
        count
    } = await Product.findAndCountAll({

        where,

        include: [

            // ==================================================
            // CATEGORY
            // ==================================================

            {
                model: Category,

                as: "category",

                required: false
            },


            // ==================================================
            // BRAND
            // ==================================================

            {
                model: Brand,

                as: "brand",

                required: false
            },


            // ==================================================
            // MEDIA
            // ==================================================

            {
                model: ProductMedia,

                as: "media",

                required: false,

                separate: true,

                order: [

                    [
                        "display_order",
                        "ASC"
                    ]

                ]

            },


            // ==================================================
            // SPECIFICATIONS
            // ==================================================

            {
                model: ProductSpecification,

                as: "specifications",

                required: false,

                separate: true,

                order: [

                    [
                        "display_order",
                        "ASC"
                    ]

                ]

            }

        ],

        order,

        limit: pageLimit,

        offset,

        distinct: true

    });


    // ========================================================
    // RESPONSE
    // ========================================================

    return {

        products: rows,

        total: count,

        page: currentPage,

        limit: pageLimit,

        totalPages:
            Math.ceil(
                count / pageLimit
            )

    };

};    

// =============================
// Get Product By Slug
// =============================

exports.getProductBySlug = async (slug) => {

    const product = await Product.findOne({

        where: {
            slug,
            status: "active",
        },

        include: [
            {
                model: Category,
                as: "category",
                attributes: [
                    "id",
                    "name",
                    "slug",
                ],
            },

            {
                model: Brand,
                as: "brand",
                attributes: [
                    "id",
                    "name",
                    "slug",
                ],
            },

            {
                model: ProductMedia,
                as: "media",
                attributes: [
                    "id",
                    "media_type",
                    "media_url",
                    "thumbnail_url",
                    "alt_text",
                    "is_primary",
                    "display_order",
                ],
                separate: true,
                order: [
                    ["display_order", "ASC"],
                ],
            },

            {
                model: ProductSpecification,
                as: "specifications",
                attributes: [
                    "id",
                    "specification_name",
                    "specification_value",
                    "display_order",
                ],
                separate: true,
                order: [
                    ["display_order", "ASC"],
                ],
            },
        ],
    });


    if (!product) {
        throw new Error("Product not found.");
    }


    const json = product.toJSON();


    const primaryMedia = json.media.find(
        (item) =>
            item.is_primary &&
            item.media_type === "image"
    );


    json.primaryImage = primaryMedia
        ? primaryMedia.media_url
        : null;


    if (json.quantity <= 0) {

        json.stockStatus =
            "out_of_stock";

    } else if (json.quantity <= 5) {

        json.stockStatus =
            "low_stock";

    } else {

        json.stockStatus =
            "in_stock";
    }


    const price = Number(json.price);

    const discountPrice =
        Number(json.discount_price);


    if (
        discountPrice &&
        discountPrice > 0 &&
        discountPrice < price
    ) {

        json.discountPercentage =
            Math.round(
                ((price - discountPrice) /
                    price) *
                    100
            );

    } else {

        json.discountPercentage = 0;
    }


    return json;
};


// =============================
// Update Product
// =============================

// ============================================================
// UPDATE PRODUCT
// ============================================================

exports.updateProduct = async (id, body) => {

    const transaction =
        await sequelize.transaction();

    try {

        // ========================================================
        // GET PRODUCT
        // ========================================================

        const product =
            await Product.findByPk(
                id,
                {
                    transaction
                }
            );


        if (!product) {

            throw new Error(
                "Product not found."
            );

        }


        // ========================================================
        // GET DATA
        // ========================================================

        const {
            product: productData,
            media,
            specifications
        } = body;


        /*
         * The frontend can send either:
         *
         * {
         *     product: {...},
         *     media: [...],
         *     specifications: [...]
         * }
         *
         * or just:
         *
         * {
         *     name: "...",
         *     price: ...
         * }
         *
         * We support both.
         */

        const data =
            productData || body;


        // ========================================================
        // CHECK CATEGORY
        // ========================================================

        if (
            data.category_id !== undefined &&
            data.category_id !== null
        ) {

            const category =
                await Category.findByPk(
                    data.category_id,
                    {
                        transaction
                    }
                );


            if (!category) {

                throw new Error(
                    "Category not found."
                );

            }

        }


        // ========================================================
        // CHECK BRAND
        // ========================================================

        if (
            data.brand_id !== undefined &&
            data.brand_id !== null
        ) {

            const brand =
                await Brand.findByPk(
                    data.brand_id,
                    {
                        transaction
                    }
                );


            if (!brand) {

                throw new Error(
                    "Brand not found."
                );

            }

        }


        // ========================================================
        // CHECK DUPLICATE PRODUCT NAME
        // ========================================================

        if (
            data.name &&
            data.name.trim() !== product.name
        ) {

            const existing =
                await Product.findOne({

                    where: {

                        name: data.name,

                        id: {
                            [Op.ne]: id
                        }

                    },

                    transaction

                });


            if (existing) {

                throw new Error(
                    "Product name already exists."
                );

            }

        }


        // ========================================================
        // GENERATE SLUG
        // ========================================================

        if (data.name) {

            data.slug =
                slugify(
                    data.name,
                    {
                        lower: true,
                        strict: true
                    }
                );

        }


        // ========================================================
        // UPDATE PRODUCT
        // ========================================================

        await product.update(
            data,
            {
                transaction
            }
        );


        // ========================================================
        // UPDATE MEDIA
        // ========================================================

        /*
         * IMPORTANT:
         *
         * If media is undefined:
         *     Don't touch existing media.
         *
         * If media is []:
         *     Delete all existing media.
         *
         * If media contains items:
         *     Delete old media and create new ones.
         */

        if (media !== undefined) {

            await ProductMedia.destroy({

                where: {
                    product_id: id
                },

                transaction

            });


            if (
                Array.isArray(media) &&
                media.length > 0
            ) {

                await ProductMedia.bulkCreate(

                    media.map(
                        (item, index) => ({

                            product_id: id,

                            media_type:
                                item.media_type,

                            media_url:
                                item.media_url,

                            thumbnail_url:
                                item.thumbnail_url ||
                                null,

                            alt_text:
                                item.alt_text ||
                                null,

                            is_primary:
                                item.is_primary ||
                                false,

                            display_order:
                                item.display_order ||
                                index + 1

                        })
                    ),

                    {
                        transaction
                    }

                );

            }

        }


        // ========================================================
        // UPDATE SPECIFICATIONS
        // ========================================================

        /*
         * Same behavior as media.
         */

        if (
            specifications !== undefined
        ) {

            await ProductSpecification.destroy({

                where: {
                    product_id: id
                },

                transaction

            });


            if (
                Array.isArray(
                    specifications
                ) &&
                specifications.length > 0
            ) {

                await ProductSpecification.bulkCreate(

                    specifications.map(
                        (item, index) => ({

                            product_id: id,

                            specification_name:
                                item.specification_name,

                            specification_value:
                                item.specification_value,

                            display_order:
                                item.display_order ||
                                index + 1

                        })
                    ),

                    {
                        transaction
                    }

                );

            }

        }


        // ========================================================
        // COMMIT
        // ========================================================

        await transaction.commit();


        // ========================================================
        // RETURN COMPLETE PRODUCT
        // ========================================================

        return await Product.findByPk(

            id,

            {

                include: [

                    {
                        model: Category,

                        as: "category"
                    },

                    {
                        model: Brand,

                        as: "brand"
                    },

                    {
                        model: ProductMedia,

                        as: "media",

                        separate: true,

                        order: [

                            [
                                "display_order",
                                "ASC"
                            ]

                        ]
                    },

                    {
                        model: ProductSpecification,

                        as: "specifications",

                        separate: true,

                        order: [

                            [
                                "display_order",
                                "ASC"
                            ]

                        ]
                    }

                ]

            }

        );

    } catch (error) {

        await transaction.rollback();

        throw error;

    }

};


// =============================
// Delete Product (Soft Delete) what we do here is that when admin delete a product, it doesn't remove it from the 
// database. it only male the product inactive. we will create another function to get all inactive product
// =============================

exports.deleteProduct = async (id) => {

    const product = await Product.findByPk(id);

    if (!product)
        throw new Error("Product not found.");

    product.status = "inactive";

    await product.save();

    return true;

};

// ============================================================
// ADMIN - GET INACTIVE PRODUCTS
// ============================================================

// ============================================================
// ADMIN - GET INACTIVE PRODUCTS
// Search + Pagination
// ============================================================

exports.getInactiveProducts = async (query = {}) => {

    const {
        page = 1,
        limit = 8,
        search
    } = query;


    // ========================================================
    // PAGINATION
    // ========================================================

    const currentPage =
        Math.max(
            Number(page) || 1,
            1
        );

    const pageLimit =
        Math.min(
            Math.max(
                Number(limit) || 8,
                1
            ),
            100
        );

    const offset =
        (currentPage - 1) * pageLimit;


    // ========================================================
    // WHERE
    // ========================================================

    const where = {
        status: "inactive"
    };


    // ========================================================
    // SEARCH
    // ========================================================

    if (
        typeof search === "string" &&
        search.trim()
    ) {

        where.name = {
            [Op.like]: `%${search.trim()}%`
        };

    }


    // ========================================================
    // GET PRODUCTS
    // ========================================================

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
                    "name",
                    "slug"
                ]
            },

            {
                model: Brand,
                as: "brand",
                attributes: [
                    "id",
                    "name",
                    "slug"
                ]
            },

            {
                model: ProductMedia,
                as: "media",
                required: false,
                separate: true,
                order: [
                    [
                        "display_order",
                        "ASC"
                    ]
                ]
            }

        ],

        order: [
            [
                "updated_at",
                "DESC"
            ]
        ],

        limit: pageLimit,

        offset,

        distinct: true

    });


    // ========================================================
    // RESPONSE
    // ========================================================

    return {

        products: rows,

        total: count,

        page: currentPage,

        limit: pageLimit,

        totalPages:
            Math.ceil(
                count / pageLimit
            )

    };

};

// =============================
// Restore Product
// =============================
exports.restoreProduct = async (id) => {

    const product = await Product.findByPk(id);

    if (!product) {
        throw new Error("Product not found.");
    }

    product.status = "active";

    await product.save();

    return product;

};

// =============================
// Permanent Delete
// =============================
exports.permanentDeleteProduct = async (id) => {

    const product = await Product.findByPk(id);

    if (!product) {
        throw new Error("Product not found.");
    }

    if (product.status !== "inactive") {
        throw new Error(
            "Please deactivate the product before permanently deleting it."
        );
    }

    await product.destroy();

    return true;

};