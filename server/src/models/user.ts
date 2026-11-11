import { Schema, model } from "mongoose";

export type UserRole = "student" | "admin";
export type LearningLevel = "Beginner" | "Intermediate" | "Advanced";

interface UserFields {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  currentLevel: LearningLevel;
  timezone: string;
  showOnLeaderboard: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserFields>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "admin"] satisfies UserRole[],
      default: "student",
      required: true,
    },
    currentLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"] satisfies LearningLevel[],
      default: "Beginner",
      required: true,
    },
    timezone: { type: String, trim: true, default: "UTC", maxlength: 100 },
    showOnLeaderboard: { type: Boolean, default: true },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = model<UserFields>("User", userSchema);
