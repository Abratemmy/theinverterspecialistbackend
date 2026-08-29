const Category = require("../models/Category");
const Product = require("../models/Product");
const slugify = require("slugify");


// ==========================================================
// CREATE CATEGORY
// ==========================================================

exports.createCategory = async (data) => {

    const {
        name,
        description,
        image
    } = data;


    const existing =
        await Category.findOne({
            where: {
                name
            }
        });


    if (existing) {

        throw new Error(
            "Category already exists."
        );

    }


    const slug =
        slugify(name, {
            lower: true,
            strict: true
        });


    const category =
        await Category.create({

            name,

            slug,

            description,

            image

        });


    return category;

};


// ==========================================================
// GET ALL CATEGORIES
// ==========================================================

exports.getCategories = async () => {

    return await Category.findAll({

        where: {
            status: "active"
        },

        order: [
            ["name", "ASC"]
        ]

    });

};


// ==========================================================
// GET CATEGORY BY SLUG
// ==========================================================

exports.getCategoryBySlug = async (slug) => {

    const category =
        await Category.findOne({

            where: {

                slug,

                status: "active"

            }

        });


    if (!category) {

        throw new Error(
            "Category not found."
        );

    }


    return category;

};


// ==========================================================
// UPDATE CATEGORY
// ==========================================================

exports.updateCategory = async (
    id,
    data
) => {

    const category =
        await Category.findByPk(id);


    if (!category) {

        throw new Error(
            "Category not found."
        );

    }


    /*
     * IMPORTANT:
     *
     * We intentionally DO NOT regenerate
     * the slug when the category name changes.
     *
     * Example:
     *
     * Old:
     * name = Solar Panels
     * slug = solar-panels
     *
     * Admin changes name to:
     * Solar Panels & Kits
     *
     * Slug remains:
     * solar-panels
     *
     * This prevents existing URLs from breaking.
     */


    await category.update({

        name:
            data.name ?? category.name,

        description:
            data.description ?? category.description,

        image:
            data.image ?? category.image

    });


    return category;

};


// ==========================================================
// DELETE CATEGORY
// ==========================================================

exports.deleteCategory = async (id) => {

    const category =
        await Category.findByPk(id);


    if (!category) {

        throw new Error(
            "Category not found."
        );

    }


    /*
     * Check whether products
     * are using this category.
     */

    const productCount =
        await Product.count({

            where: {
                category_id: id
            }

        });


    if (productCount > 0) {

        throw new Error(
            `!Ohpps, You cannot delete ${category.name}. ` +
            `${productCount} product` +
            `${productCount > 1 ? "s are" : " is"} ` +
            `using this category. ` +
            `Please reassign the product` +
            `${productCount > 1 ? "s" : ""} ` +
            `to another category first.`
        );

    }


    /*
     * Permanently delete category.
     */

    await category.destroy();


    return true;

};