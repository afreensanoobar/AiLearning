import { Schema, model } from "mongoose";
const courseSchema = new Schema({
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
    },
    skills: { type: [String], default: [] },
    order: { type: Number, required: true, min: 0 },
    ui: {
        color: { type: String, required: true },
        bg: { type: String, required: true },
        icon: { type: String, required: true },
        iconColor: { type: String, required: true },
    },
}, { timestamps: true });
export const Course = model("Course", courseSchema);
