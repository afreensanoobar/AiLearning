import { Schema, model } from "mongoose";
const userBadgeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badgeKey: {
        type: String,
        enum: [
            "first-lesson",
            "first-quiz",
            "perfect-score",
            "level-up",
            "seven-day-streak",
            "challenge-master",
        ],
        required: true,
    },
    awardedAt: { type: Date, default: Date.now },
}, { timestamps: false });
userBadgeSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });
export const UserBadge = model("UserBadge", userBadgeSchema);
