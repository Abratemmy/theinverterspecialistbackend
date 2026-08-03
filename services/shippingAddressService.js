const { ShippingAddress } = require("../models");

exports.createAddress = async (userId, data) => {

    // Check if this is the user's first address
    const addressCount = await ShippingAddress.count({
        where: {
            user_id: userId
        }
    });

    const address = await ShippingAddress.create({

        user_id: userId,

        full_name: data.full_name,

        phone: data.phone,

        address_line_1: data.address_line_1,

        address_line_2: data.address_line_2,

        city: data.city,

        state: data.state,

        country: data.country || "Nigeria",

        postal_code: data.postal_code,

        address_type: data.address_type || "home",

        is_default: addressCount === 0

    });

    return address;

};

// get a user addresses
exports.getAddresses = async (userId) => {
    return await ShippingAddress.findAll({

        where: {

            user_id: userId

        },

        order: [

            ["is_default", "DESC"],

            ["created_at", "DESC"]

        ]

    });

};

// get user one address
exports.getAddress = async (id, userId) => {

    const address = await ShippingAddress.findOne({

        where: {

            id,

            user_id: userId

        }

    });

    if (!address) {

        throw new Error("Address not found.");

    }

    return address;

};

// update address
exports.updateAddress = async (id, userId, data) => {

    const address = await exports.getAddress(id, userId);

    await address.update(data);

    return address;

};

// delete address
exports.deleteAddress = async (id, userId) => {

    const address = await exports.getAddress(id, userId);

    await address.destroy();

    return true;

};

// set default address
exports.setDefaultAddress = async (id, userId) => {

    const address = await exports.getAddress(id, userId);

    // Remove current default
    await ShippingAddress.update(
        {
            is_default: false
        },
        {
            where: {
                user_id: userId
            }
        }
    );

    // Set new default
    address.is_default = true;

    await address.save();

    return address;

};