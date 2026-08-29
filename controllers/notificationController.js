const notificationService =
    require("../services/notificationService");


// ============================================================
// GET MY NOTIFICATIONS
// ============================================================

exports.getMyNotifications = async (
    req,
    res
) => {

    try {

        const notifications =
            await notificationService.getUserNotifications(
                req.user.id
            );


        return res.status(200).json({

            success: true,

            message:
                "Notifications retrieved successfully.",

            data:
                notifications

        });

    }
    catch (error) {

        console.error(
            "Get notifications error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }
};


// ============================================================
// GET UNREAD COUNT
// ============================================================

exports.getUnreadCount = async (
    req,
    res
) => {

    try {

        const count =
            await notificationService.getUnreadCount(
                req.user.id
            );


        return res.status(200).json({

            success: true,

            data: {
                count
            }

        });

    }
    catch (error) {

        console.error(
            "Get unread notification count error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }
};


// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================

exports.markAsRead = async (
    req,
    res
) => {

    try {

        const notification =
            await notificationService.markAsRead(

                req.params.id,

                req.user.id

            );


        return res.status(200).json({

            success: true,

            message:
                "Notification marked as read.",

            data:
                notification

        });

    }
    catch (error) {

        return res.status(404).json({

            success: false,

            message:
                error.message

        });

    }
};


// ============================================================
// MARK ALL AS READ
// ============================================================

exports.markAllAsRead = async (
    req,
    res
) => {

    try {

        await notificationService.markAllAsRead(
            req.user.id
        );


        return res.status(200).json({

            success: true,

            message:
                "All notifications marked as read."

        });

    }
    catch (error) {

        console.error(
            "Mark all notifications as read error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }
};