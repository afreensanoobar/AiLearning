import { Router } from "express";
import { requireAuth } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { Attempt } from "../models/attempt.js";
import { User } from "../models/user.js";
import { UserProgress } from "../models/user-progress.js";
export const leaderboardRouter = Router();
leaderboardRouter.use(requireAuth);
leaderboardRouter.get("/", asyncHandler(async (_req, res) => {
    const rows = await User.aggregate([
        {
            $match: {
                role: "student",
                showOnLeaderboard: { $ne: false },
                deactivated: { $ne: true },
            },
        },
        {
            $lookup: {
                from: Attempt.collection.name,
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$userId", "$$userId"] },
                                    { $eq: ["$status", "submitted"] },
                                ],
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$percentage" } } },
                ],
                as: "attemptTotals",
            },
        },
        {
            $lookup: {
                from: UserProgress.collection.name,
                let: { userId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
                    {
                        $project: {
                            completedCount: {
                                $size: { $ifNull: ["$completedLessonIds", []] },
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$completedCount" } } },
                ],
                as: "lessonTotals",
            },
        },
        {
            $set: {
                points: {
                    $add: [
                        { $ifNull: [{ $arrayElemAt: ["$attemptTotals.total", 0] }, 0] },
                        {
                            $multiply: [
                                { $ifNull: [{ $arrayElemAt: ["$lessonTotals.total", 0] }, 0] },
                                10,
                            ],
                        },
                    ],
                },
            },
        },
        { $sort: { points: -1, name: 1 } },
        { $limit: 20 },
        { $project: { _id: 0, displayName: "$name", points: 1 } },
    ]);
    res.json({
        leaderboard: rows.map((row, index) => ({
            rank: index + 1,
            displayName: row.displayName,
            points: row.points,
        })),
    });
}));
