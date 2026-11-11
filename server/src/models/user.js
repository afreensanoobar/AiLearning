import { Schema, model } from "mongoose";
const userSchema = new Schema({
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
        enum: ["student", "admin"],
        default: "student",
        required: true,
    },
    currentLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
        required: true,
    },
    timezone: { type: String, trim: true, default: "UTC", maxlength: 100 },
    showOnLeaderboard: { type: Boolean, default: true },
    deactivated: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const User = model("User", userSchema);
