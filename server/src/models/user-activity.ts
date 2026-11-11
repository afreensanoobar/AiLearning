import { Schema, Types, model } from "mongoose";

interface UserActivityFields {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  occurredAt: Date;
}

const userActivitySchema = new Schema<UserActivityFields>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    occurredAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false }
);

userActivitySchema.index({ userId: 1, occurredAt: 1 });

export const UserActivity = model<UserActivityFields>("UserActivity", userActivitySchema);
