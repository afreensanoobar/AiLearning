import { Attempt } from "../models/attempt.js";
import { Notification } from "../models/notification.js";
import { User } from "../models/user.js";
import { UserActivity } from "../models/user-activity.js";
import { UserBadge } from "../models/user-badge.js";
import { calculateStreak } from "../progress/streak.js";
export const badgeDefinitions = [
    {
        key: "first-lesson",
        name: "First Lesson",
        description: "Complete your first lesson.",
    },
    {
        key: "first-quiz",
        name: "First Quiz",
        description: "Complete your first assessment.",
    },
    {
        key: "perfect-score",
        name: "Perfect Score",
        description: "Earn 100% on an assessment or challenge.",
    },
    {
        key: "level-up",
        name: "Level Up",
        description: "Advance to a higher learning level.",
    },
    {
        key: "seven-day-streak",
        name: "7-Day Streak",
        description: "Learn for seven consecutive days.",
    },
    {
        key: "challenge-master",
        name: "Challenge Master",
        description: "Complete all advanced challenge stages.",
    },
];
function isDuplicateKeyError(error) {
    return (typeof error === "object" && error !== null && "code" in error && error.code === 11000);
}
export async function awardBadge(userId, badgeKey) {
    try {
        const result = await UserBadge.updateOne({ userId, badgeKey }, { $setOnInsert: { awardedAt: new Date() } }, { upsert: true });
        return result.upsertedCount > 0;
    }
    catch (error) {
        if (isDuplicateKeyError(error))
            return false;
        throw error;
    }
}
export async function createNotification(userId, title, message, eventKey) {
    try {
        const result = await Notification.updateOne({ userId, eventKey }, { $setOnInsert: { title, message, read: false } }, { upsert: true });
        return result.upsertedCount > 0;
    }
    catch (error) {
        if (isDuplicateKeyError(error))
            return false;
        throw error;
    }
}
export async function recordStreakMilestones(userId, now) {
    const [user, attempts, activities] = await Promise.all([
        User.findById(userId).select("timezone").lean(),
        Attempt.find({ userId, status: "submitted" }).select("completedAt").lean(),
        UserActivity.find({ userId }).select("occurredAt").lean(),
    ]);
    if (!user)
        return;
    const activityDates = [
        ...attempts.flatMap((attempt) => (attempt.completedAt ? [attempt.completedAt] : [])),
        ...activities.map((activity) => activity.occurredAt),
    ];
    const streak = calculateStreak(activityDates, user.timezone, now);
    if (streak >= 7)
        await awardBadge(userId, "seven-day-streak");
    for (const milestone of [3, 7, 30]) {
        if (streak === milestone) {
            await createNotification(userId, `${milestone}-day learning streak`, `You have learned for ${milestone} days in a row. Keep it up!`, `streak-${milestone}`);
        }
    }
}
