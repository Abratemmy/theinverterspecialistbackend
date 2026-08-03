const brandService = require("../services/brandService");

// Create
exports.createBrand = async (req, res) => {
    try {
        const brand = await brandService.createBrand(req.body);

        return res.status(201).json({
            success: true,
            message: "Brand created successfully.",
            data: brand
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get All
exports.getBrands = async (req, res) => {
    try {
        const brands = await brandService.getBrands();

        return res.status(200).json({
            success: true,
            count: brands.length,
            data: brands
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get By Slug
exports.getBrandBySlug = async (req, res) => {
    try {
        const brand = await brandService.getBrandBySlug(req.params.slug);

        return res.status(200).json({
            success: true,
            data: brand
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update
exports.updateBrand = async (req, res) => {
    try {
        const brand = await brandService.updateBrand(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Brand updated successfully.",
            data: brand
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete
exports.deleteBrand = async (req, res) => {
    try {
        await brandService.deleteBrand(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Brand deleted successfully."
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};