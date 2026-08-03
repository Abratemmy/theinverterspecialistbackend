const Category = require("../models/Category");
const slugify = require("slugify");

// Create Category
exports.createCategory = async (data) => {

    const { name, description, image } = data;

    const existing = await Category.findOne({
        where: { name }
    });

    if (existing) {
        throw new Error("Category already exists.");
    }

    const slug = slugify(name, {
        lower: true,
        strict: true
    });

    const category = await Category.create({
        name,
        slug,
        description,
        image
    });

    return category;
};

// Get All Categories
exports.getCategories = async () => {

    return await Category.findAll({
        where: {
            status: "active"
        },
        order: [["name", "ASC"]]
    });

};

// Get Category By Slug
exports.getCategoryBySlug = async (slug) => {

    const category = await Category.findOne({
        where: {
            slug,
            status: "active"
        }
    });

    if (!category) {
        throw new Error("Category not found.");
    }

    return category;
}; 

// Update Category
exports.updateCategory = async (id, data) => {
  
    const category = await Category.findByPk(id);

    if (!category) {
        throw new Error("Category not found.");
    }

    if (data.name) {
        data.slug = slugify(data.name, {
            lower: true,
            strict: true
        });
    }

    await category.update(data);

    return category;
};

// Soft Delete Category
exports.deleteCategory = async (id) => {

    const category = await Category.findByPk(id);

    if (!category) {
        throw new Error("Category not found.");
    }

    category.status = "inactive";

    await category.save();

    return true;
};