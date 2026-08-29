const express = require("express");

const router =
    express.Router();


const protect =
    require("../middleware/authMiddleware");

const adminOnly =
    require("../middleware/adminMiddleware");


const customerController =
    require("../controllers/adminCustomerController");

const authorize = require("../middleware/roleMiddleware");


// ============================================================
// GET ALL USERS / CUSTOMERS
// ============================================================

router.get(

    "/",

    protect,

    authorize("admin", "manager"),

    customerController.getCustomers

);


// ============================================================
// GET SINGLE USER
// ============================================================

router.get(

    "/:id",

    protect,

    authorize("admin", "manager"),

    customerController.getCustomerById

);


// ============================================================
// UPDATE USER ROLE
// ============================================================

router.patch(

    "/:id/role",

    protect,

    adminOnly,

    customerController.updateUserRole

);


// ============================================================
// UPDATE USER STATUS
// ============================================================

router.patch(

    "/:id/status",

    protect,

    adminOnly,

    customerController.updateUserStatus

);


module.exports = router;