import { Schema, model } from "mongoose";
const attemptSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["Assessment", "Advanced Challenge"],
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
    },
    challengeStage: { type: Number, enum: [null, 1, 2, 3], default: null },
    status: {
        type: String,
        enum: ["in_progress", "submitted"],
        default: "in_progress",
        required: true,
    },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question", required: true }],
    answers: [
        {
            questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
            selectedIndex: { type: Number, min: 0, max: 3, required: true },
            correct: { type: Boolean, default: false },
        },
    ],
    score: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 1 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    topicResults: [
        {
            topic: {
                type: String,
                enum: ["HTML", "CSS", "JavaScript", "React"],
                required: true,
            },
            correct: { type: Number, required: true, min: 0 },
            total: { type: Number, required: true, min: 0 },
            percentage: { type: Number, required: true, min: 0, max: 100 },
        },
    ],
    nextLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", null],
        default: null,
    },
    adaptiveMessage: { type: String, default: null },
    mastered: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
}, { timestamps: true });
attemptSchema.index({ userId: 1, completedAt: -1 });
export const Attempt = model("Attempt", attemptSchema);
