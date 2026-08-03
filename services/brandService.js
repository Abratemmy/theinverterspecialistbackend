const Brand = require("../models/Brand");
const slugify = require("slugify");

// Create Brand
exports.createBrand = async (data) => {

    const { name, description, logo, website } = data;

    const existing = await Brand.findOne({
        where: { name }
    });

    if (existing) {
        throw new Error("Brand already exists.");
    }

    const slug = slugify(name, {
        lower: true,
        strict: true
    });

    return await Brand.create({
        name,
        slug,
        description,
        logo,
        website
    });
};

// Get All Brands
exports.getBrands = async () => {

    return await Brand.findAll({
        where: {
            status: "active"
        },
        order: [["name", "ASC"]]
    });

};

// Get Brand By Slug
exports.getBrandBySlug = async (slug) => {

    const brand = await Brand.findOne({
        where: {
            slug,
            status: "active"
        }
    });

    if (!brand) {
        throw new Error("Brand not found.");
    }

    return brand;
};

// Update Brand
exports.updateBrand = async (id, data) => {

    const brand = await Brand.findByPk(id);

    if (!brand) {
        throw new Error("Brand not found.");
    }

    if (data.name) {
        data.slug = slugify(data.name, {
            lower: true,
            strict: true
        });
    }

    await brand.update(data);

    return brand;
};

// Soft Delete Brand
exports.deleteBrand = async (id) => {

    const brand = await Brand.findByPk(id);

    if (!brand) {
        throw new Error("Brand not found.");
    }

    brand.status = "inactive";

    await brand.save();

    return true;
};