const express = require("express");

const router =
    express.Router();

const contactController =
    require("../controllers/contactController");


// ========================================================
// SUBMIT CONTACT MESSAGE
// ========================================================

router.post(
    "/",
    contactController.createContactMessage
);


module.exports = router;