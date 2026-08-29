const Notification =
    require("../models/Notification");


// ============================================================
// CREATE NOTIFICATION
// ============================================================

exports.createNotification = async ({
    user_id,
    title,
    message,
    type = "system"
}) => {

    if (!user_id) {
        throw new Error(
            "User ID is required."
        );
    }

    if (!title?.trim()) {
        throw new Error(
            "Notification title is required."
        );
    }

    if (!message?.trim()) {
        throw new Error(
            "Notification message is required."
        );
    }

    const notification =
        await Notification.create({

            user_id,

            title:
                title.trim(),

            message:
                message.trim(),

            type

        });

    return notification;
};


// ============================================================
// GET USER NOTIFICATIONS
// ============================================================

exports.getUserNotifications = async (
    userId
) => {

    const notifications =
        await Notification.findAll({

            where: {
                user_id: userId
            },

            order: [
                ["created_at", "DESC"]
            ]

        });

    return notifications;
};


// ============================================================
// GET UNREAD COUNT
// ============================================================

exports.getUnreadCount = async (
    userId
) => {

    const count =
        await Notification.count({

            where: {

                user_id: userId,

                is_read: false

            }

        });

    return count;
};


// ============================================================
// MARK ONE AS READ
// ============================================================

exports.markAsRead = async (
    notificationId,
    userId
) => {

    const notification =
        await Notification.findOne({

            where: {

                id: notificationId,

                user_id: userId

            }

        });


    if (!notification) {

        throw new Error(
            "Notification not found."
        );

    }


    notification.is_read =
        true;


    await notification.save();


    return notification;
};


// ============================================================
// MARK ALL AS READ
// ============================================================

exports.markAllAsRead = async (
    userId
) => {

    await Notification.update(

        {
            is_read: true
        },

        {
            where: {

                user_id: userId,

                is_read: false

            }
        }

    );


    return true;
};