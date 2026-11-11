import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireAuth } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Lesson } from "../models/lesson.js";
import { User } from "../models/user.js";
import { UserActivity } from "../models/user-activity.js";
import { UserProgress } from "../models/user-progress.js";
import { awardBadge, recordStreakMilestones } from "../services/gamification.js";
const lessonIdSchema = z.object({
    params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});
function getLessonId(res) {
    return res.locals.validated.params.id;
}
export const lessonsRouter = Router();
lessonsRouter.use(requireAuth);
lessonsRouter.post("/:id/complete", validate(lessonIdSchema), asyncHandler(async (_req, res) => {
    const lesson = await Lesson.findById(getLessonId(res));
    if (!lesson) {
        throw new HttpError(404, "LESSON_NOT_FOUND", "Lesson not found.");
    }
    const userId = res.locals.auth.userId;
    if (!(await User.exists({ _id: userId }))) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
    }
    const completedAt = new Date();
    const result = await UserProgress.updateOne({ userId, courseId: lesson.courseId }, {
        $addToSet: { completedLessonIds: lesson._id },
        $setOnInsert: { createdAt: completedAt, updatedAt: completedAt },
    }, { upsert: true, runValidators: true, timestamps: false });
    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
        await Promise.all([
            User.updateOne({ _id: userId }, { $set: { lastActiveAt: completedAt } }),
            UserActivity.create({ userId, lessonId: lesson._id, occurredAt: completedAt }),
        ]);
        await awardBadge(userId, "first-lesson");
        await recordStreakMilestones(userId, completedAt);
        if (result.upsertedCount === 0) {
            await UserProgress.updateOne({ userId, courseId: lesson.courseId }, { $set: { updatedAt: completedAt } }, { timestamps: false });
        }
    }
    res.json({ completed: true });
}));
lessonsRouter.delete("/:id/complete", validate(lessonIdSchema), asyncHandler(async (_req, res) => {
    const lesson = await Lesson.findById(getLessonId(res));
    if (!lesson) {
        throw new HttpError(404, "LESSON_NOT_FOUND", "Lesson not found.");
    }
    await UserProgress.updateOne({ userId: res.locals.auth?.userId, courseId: lesson.courseId }, { $pull: { completedLessonIds: lesson._id } });
    res.json({ completed: false });
}));
lessonsRouter.get("/:id", validate(lessonIdSchema), asyncHandler(async (_req, res) => {
    const lesson = await Lesson.findById(new Types.ObjectId(getLessonId(res))).lean();
    if (!lesson) {
        throw new HttpError(404, "LESSON_NOT_FOUND", "Lesson not found.");
    }
    res.json({ lesson });
}));
