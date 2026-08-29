const productService = require("../services/productService");

// ==============================
// Create Product
// ==============================
exports.createProduct = async (req, res) => {

    try {

        const product = await productService.createProduct(req.body);

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data: product
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};


// ==============================
// Get All Products
// ==============================
exports.getProducts = async (req, res) => {

    try {

        const result = await productService.getProducts(req.query);

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("================================");
    console.error("GET PRODUCTS ERROR");
    console.error("MESSAGE:", error.message);
    console.error("NAME:", error.name);
    console.error("STACK:", error.stack);
    console.error("================================");

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ==============================
// Get Product By Slug
// ==============================
exports.getProductBySlug = async (req, res) => {

    try {

        const product =
            await productService.getProductBySlug(
                req.params.slug
            );


        return res.status(200).json({
            success: true,
            data: product,
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message,
        });

    }

};


// ==============================
// Update Product
// ==============================
exports.updateProduct = async (req, res) => {

    try {

        const product = await productService.updateProduct(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data: product
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};


// ==============================
// Delete Product
// ==============================
exports.deleteProduct = async (req, res) => {

    try {

        await productService.deleteProduct(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};
// ==============================
// Get inactive products
// ==============================
exports.getInactiveProducts = async (req, res) => {

    try {

        const result =
            await productService.getInactiveProducts(
                req.query
            );

        return res.status(200).json({

            success: true,

            ...result

        });

    } catch (error) {

        console.error(
            "GET INACTIVE PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ==============================
// Restore Product
// ==============================

exports.restoreProduct = async (req, res) => {

    try {

        const product =
            await productService.restoreProduct(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product restored successfully.",
            data: product
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};


// ==============================
// Permanently delete Product
// ==============================
exports.permanentDeleteProduct = async (req, res) => {

    try {

        await productService.permanentDeleteProduct(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product permanently deleted."
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};