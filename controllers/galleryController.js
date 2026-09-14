const Gallery = require("../models/Gallery");
const cloudinary = require("../config/cloudinary");


// ==========================================
// ADMIN - UPLOAD IMAGE
// ==========================================

exports.uploadImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image to upload.",
            });
        }

        const {
            title,
            alt_text,
            display_order,
        } = req.body;

        const galleryImage = await Gallery.create({
            image_url: req.file.path,
            public_id: req.file.filename,
            title: title || null,
            alt_text: alt_text || null,
            display_order: display_order
                ? Number(display_order)
                : 0,
            status: "active",
        });

        return res.status(201).json({
            success: true,
            message: "Gallery image uploaded successfully.",
            data: galleryImage,
        });

    } catch (error) {

        console.error("UPLOAD GALLERY IMAGE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload gallery image.",
        });
    }
};


// ==========================================
// PUBLIC - GET ACTIVE GALLERY
// ==========================================

exports.getGallery = async (req, res) => {
    try {

        const gallery = await Gallery.findAll({
            where: {
                status: "active",
            },
            order: [
                ["display_order", "ASC"],
                ["created_at", "DESC"],
            ],
        });

        return res.status(200).json({
            success: true,
            data: gallery,
        });

    } catch (error) {

        console.error("GET GALLERY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch gallery.",
        });
    }
};


// ==========================================
// ADMIN - DELETE IMAGE
// ==========================================

exports.deleteImage = async (req, res) => {
    try {

        const { id } = req.params;

        const galleryImage = await Gallery.findByPk(id);

        if (!galleryImage) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }

        // Delete image from Cloudinary
        if (galleryImage.public_id) {
            await cloudinary.uploader.destroy(
                galleryImage.public_id
            );
        }

        // Delete from database
        await galleryImage.destroy();

        return res.status(200).json({
            success: true,
            message: "Gallery image deleted successfully.",
        });

    } catch (error) {

        console.error("DELETE GALLERY IMAGE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete gallery image.",
        });
    }
};


// ==========================================
// ADMIN - UPDATE STATUS
// ==========================================

exports.updateStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery status.",
            });
        }

        const galleryImage = await Gallery.findByPk(id);

        if (!galleryImage) {
            return res.status(404).json({
                success: false,
                message: "Gallery image not found.",
            });
        }

        galleryImage.status = status;

        await galleryImage.save();

        return res.status(200).json({
            success: true,
            message: "Gallery status updated successfully.",
            data: galleryImage,
        });

    } catch (error) {

        console.error("UPDATE GALLERY STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update gallery status.",
        });
    }
};

exports.getAdminGallery = async (req, res) => {
    try {

        const gallery = await Gallery.findAll({
            order: [
                ["display_order", "ASC"],
                ["created_at", "DESC"],
            ],
        });

        return res.status(200).json({
            success: true,
            data: gallery,
        });

    } catch (error) {

        console.error(
            "GET ADMIN GALLERY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch gallery.",
        });
    }
};