import { Schema, model } from "mongoose";
const questionSchema = new Schema({
    topic: {
        type: String,
        enum: ["HTML", "CSS", "JavaScript", "React"],
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
    },
    text: { type: String, required: true, trim: true },
    options: {
        type: [{ type: String, trim: true, required: true }],
        required: true,
        validate: {
            validator: (options) => options.length === 4 &&
                new Set(options.map((option) => option.toLowerCase())).size === 4,
            message: "A question must have exactly four distinct options.",
        },
    },
    correctIndex: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
        validate: Number.isInteger,
    },
    explanation: { type: String, required: true, trim: true, minlength: 1 },
    challengeStage: { type: Number, enum: [null, 1, 2, 3], default: null },
    status: {
        type: String,
        enum: ["active", "draft", "rejected", "archived"],
        default: "active",
        required: true,
    },
    source: {
        type: String,
        enum: ["manual", "ai"],
        default: "manual",
        required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
questionSchema.index({ topic: 1, difficulty: 1, status: 1 });
export const Question = model("Question", questionSchema);
