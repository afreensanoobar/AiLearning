import { Schema, model } from "mongoose";
const userProgressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessonIds: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
}, { timestamps: true });
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
export const UserProgress = model("UserProgress", userProgressSchema);
