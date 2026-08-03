const categoryService = require("../services/categoryService");

exports.createCategory = async (req, res) => {
    try {

        const category =
            await categoryService.createCategory(req.body);

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            data: category
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

exports.getCategories = async (req, res) => {

    try {

        const categories =
            await categoryService.getCategories();

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get Category By Slug
exports.getCategoryBySlug = async (req, res) => {

    try {

        const category = await categoryService.getCategoryBySlug(
            req.params.slug
        );

        return res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });

    }

};

// Update Category
exports.updateCategory = async (req, res) => {

    try {

        const category = await categoryService.updateCategory(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            data: category
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// Delete Category
exports.deleteCategory = async (req, res) => {

    try {

        await categoryService.deleteCategory(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully."
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};