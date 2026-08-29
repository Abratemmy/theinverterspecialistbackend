const express =
    require("express");

const router =
    express.Router();

const authenticate =
    require("../middleware/authMiddleware");

const notificationController =
    require("../controllers/notificationController");


// ============================================================
// GET MY NOTIFICATIONS
// ============================================================

router.get(
    "/",
    authenticate,
    notificationController.getMyNotifications
);


// ============================================================
// GET UNREAD COUNT
// ============================================================

router.get(
    "/unread-count",
    authenticate,
    notificationController.getUnreadCount
);


// ============================================================
// MARK ALL AS READ
// ============================================================

router.patch(
    "/read-all",
    authenticate,
    notificationController.markAllAsRead
);


// ============================================================
// MARK ONE AS READ
// ============================================================

router.patch(
    "/:id/read",
    authenticate,
    notificationController.markAsRead
);


module.exports = router;