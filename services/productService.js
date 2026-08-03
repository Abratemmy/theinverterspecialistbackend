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

// =============================
// Get All Products
// =============================

exports.getProducts = async (query) => {

    const {
        page = 1,
        limit = 10,
        search,
        category,
        brand,
        featured,
        minPrice,
        maxPrice,
        sort = "newest"
    } = query;

    const where = {
        status: "active"
    };

    // Search by product name
    if (search) {
        where.name = {
            [Op.like]: `%${search}%`
        };
    }

    // Featured products
    if (featured === "true") {
        where.featured = true;
    }

    // Price filters
    if (minPrice || maxPrice) {

        where.price = {};

        if (minPrice) {
            where.price[Op.gte] = minPrice;
        }

        if (maxPrice) {
            where.price[Op.lte] = maxPrice;
        }
    }

    let order = [["created_at", "DESC"]];

    switch (sort) {

        case "oldest":
            order = [["created_at", "ASC"]];
            break;

        case "price_asc":
            order = [["price", "ASC"]];
            break;

        case "price_desc":
            order = [["price", "DESC"]];
            break;

        case "name":
            order = [["name", "ASC"]];
            break;

        default:
            order = [["created_at", "DESC"]];
    }

    const result = await Product.findAndCountAll({

        where,

        include: [
            {
                model: Category,
                as: "category",
                attributes: ["id", "name", "slug"]
            },
            {
                model: Brand,
                as: "brand",
                attributes: ["id", "name", "slug"]
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
                    "display_order"
                ],
                separate: true,
                order: [["display_order", "ASC"]]
            },
            {
                model: ProductSpecification,
                as: "specifications",
                attributes: [
                    "id",
                    "specification_name",
                    "specification_value",
                    "display_order"
                ],
                separate: true,
                order: [["display_order", "ASC"]]
            }
        ],

        limit: Number(limit),

        offset: (page - 1) * limit,

        order

    });

    return {

        total: result.count,

        currentPage: Number(page),

        totalPages: Math.ceil(result.count / limit),

        products: result.rows

    };

};


// =============================
// Get Product By Slug
// =============================

exports.getProductBySlug = async (slug) => {

    const product = await Product.findOne({

        where: {
            slug,
            status: "active"
        },

        include: [

            {
                model: Category,
                as: "category"
            },

            {
                model: Brand,
                as: "brand"
            }

        ]

    });

    if (!product)
        throw new Error("Product not found.");

    return product;

};


// =============================
// Update Product
// =============================

exports.updateProduct = async (id, data) => {

    const product = await Product.findByPk(id);

    if (!product)
        throw new Error("Product not found.");

    if (data.category_id) {

        const category = await Category.findByPk(data.category_id);

        if (!category)
            throw new Error("Category not found.");

    }

    if (data.brand_id) {

        const brand = await Brand.findByPk(data.brand_id);

        if (!brand)
            throw new Error("Brand not found.");

    }

    if (data.name) {

        data.slug = slugify(data.name, {

            lower: true,

            strict: true

        });

    }

    await product.update(data);

    return product;

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

// =============================
// Admin - Get Inactive Products. 
// =============================
exports.getInactiveProducts = async () => {

    return await Product.findAll({

        where: {
            status: "inactive"
        },

        include: [
            {
                model: Category,
                as: "category",
                attributes: ["id", "name", "slug"]
            },
            {
                model: Brand,
                as: "brand",
                attributes: ["id", "name", "slug"]
            }
        ],

        order: [
            ["updated_at", "DESC"]
        ]

    });

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