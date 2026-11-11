import { z } from "zod";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Attempt } from "../models/attempt.js";
import { Question } from "../models/question.js";
import { User } from "../models/user.js";
import { documentId, getValidated, objectId } from "./admin-helpers.js";
const listSchema = z.object({
    query: z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
    }),
});
const updateSchema = z.object({
    params: z.object({ id: objectId }),
    body: z
        .object({
        role: z.enum(["student", "admin"]).optional(),
        deactivated: z.boolean().optional(),
    })
        .refine((body) => Object.keys(body).length > 0, {
        message: "At least one user field must be provided.",
    }),
});
function serializeUser(user) {
    return {
        id: documentId(user),
        name: user.name,
        email: user.email,
        role: user.role,
        currentLevel: user.currentLevel,
        deactivated: user.deactivated,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
    };
}
export function registerAdminUserRoutes(router) {
    router.get("/users", validate(listSchema), asyncHandler(async (_req, res) => {
        const { limit } = getValidated(res).query;
        const users = await User.find().sort({ createdAt: -1 }).limit(limit);
        res.json({ users: users.map(serializeUser) });
    }));
    router.patch("/users/:id", validate(updateSchema), asyncHandler(async (_req, res) => {
        const { params, body } = getValidated(res);
        if (params.id === res.locals.auth?.userId) {
            throw new HttpError(400, "CANNOT_MODIFY_SELF", "An admin cannot change their own role or deactivate themselves.");
        }
        const user = await User.findByIdAndUpdate(params.id, { $set: body }, { returnDocument: "after", runValidators: true });
        if (!user) {
            throw new HttpError(404, "USER_NOT_FOUND", "User not found.");
        }
        res.json({ user: serializeUser(user) });
    }));
    router.get("/stats", asyncHandler(async (_req, res) => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalUsers, attemptsThisWeek, averageScore, mostMissed] = await Promise.all([
            User.countDocuments(),
            Attempt.countDocuments({
                status: "submitted",
                completedAt: { $gte: weekAgo },
            }),
            Attempt.aggregate([
                { $match: { status: "submitted" } },
                { $group: { _id: null, averageScore: { $avg: "$percentage" } } },
            ]),
            Attempt.aggregate([
                { $match: { status: "submitted" } },
                { $unwind: "$answers" },
                { $match: { "answers.correct": false } },
                { $group: { _id: "$answers.questionId", misses: { $sum: 1 } } },
                { $sort: { misses: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: Question.collection.name,
                        localField: "_id",
                        foreignField: "_id",
                        as: "question",
                    },
                },
                { $unwind: { path: "$question", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        misses: 1,
                        text: { $ifNull: ["$question.text", "Removed question"] },
                        topic: { $ifNull: ["$question.topic", "Unknown"] },
                    },
                },
            ]),
        ]);
        res.json({
            totalUsers,
            attemptsThisWeek,
            averageScore: Math.round(averageScore[0]?.averageScore ?? 0),
            mostMissedQuestions: mostMissed.map((row) => ({
                id: row._id?.toString() ?? "",
                text: row.text,
                topic: row.topic,
                misses: row.misses,
            })),
        });
    }));
}
