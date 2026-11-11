import { Schema, model } from "mongoose";
const userActivitySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    occurredAt: { type: Date, required: true, default: Date.now },
}, { timestamps: false });
userActivitySchema.index({ userId: 1, occurredAt: 1 });
export const UserActivity = model("UserActivity", userActivitySchema);
