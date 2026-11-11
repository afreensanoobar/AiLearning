import { Schema, Types, model } from "mongoose";

interface UserProgressFields {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  completedLessonIds: Types.ObjectId[];
}

const userProgressSchema = new Schema<UserProgressFields>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessonIds: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  },
  { timestamps: true }
);

userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const UserProgress = model<UserProgressFields>("UserProgress", userProgressSchema);
