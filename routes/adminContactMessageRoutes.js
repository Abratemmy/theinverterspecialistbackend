const express =
    require("express");

const router =
    express.Router();

const controller =
    require("../controllers/adminContactMessageController");


// ============================================================
// CONTACT MESSAGES
// ============================================================

router.get(
    "/",
    controller.getContactMessages
);


router.get(
    "/:id",
    controller.getContactMessageById
);


router.patch(
    "/:id/status",
    controller.updateContactMessageStatus
);


router.patch(
    "/:id/reply",
    controller.replyToContactMessage
);


router.delete(
    "/:id",
    controller.deleteContactMessage
);


module.exports = router;