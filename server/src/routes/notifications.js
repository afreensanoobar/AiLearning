import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Notification } from "../models/notification.js";
const notificationIdSchema = z.object({
    params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});
export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);
notificationsRouter.get("/", asyncHandler(async (_req, res) => {
    const userId = res.locals.auth.userId;
    const [notifications, unreadCount] = await Promise.all([
        Notification.find({ userId })
            .select("title message read createdAt")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean(),
        Notification.countDocuments({ userId, read: false }),
    ]);
    res.json({
        notifications: notifications.map((notification) => ({
            id: notification._id.toString(),
            title: notification.title,
            message: notification.message,
            read: notification.read,
            createdAt: notification.createdAt,
        })),
        unreadCount,
    });
}));
notificationsRouter.patch("/:id/read", validate(notificationIdSchema), asyncHandler(async (_req, res) => {
    const { id } = res.locals.validated.params;
    const notification = await Notification.findOneAndUpdate({ _id: id, userId: res.locals.auth.userId }, { $set: { read: true } }, { returnDocument: "after" }).select("title message read createdAt");
    if (!notification) {
        throw new HttpError(404, "NOTIFICATION_NOT_FOUND", "Notification not found.");
    }
    res.json({
        notification: {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            read: notification.read,
            createdAt: notification.createdAt,
        },
    });
}));
notificationsRouter.post("/read-all", asyncHandler(async (_req, res) => {
    const result = await Notification.updateMany({ userId: res.locals.auth.userId, read: false }, { $set: { read: true } });
    res.json({ updatedCount: result.modifiedCount });
}));
