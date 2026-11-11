import { Schema, model } from "mongoose";
const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
const lessonSchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 0 },
    content: { type: String, required: true, trim: true },
    videoId: {
        type: String,
        trim: true,
        validate: {
            validator: (value) => value === undefined || value === "" || videoIdPattern.test(value),
            message: "Video ID must contain exactly 11 valid characters.",
        },
    },
    channel: { type: String, trim: true, maxlength: 100 },
    keyPoints: {
        type: [{ type: String, trim: true, maxlength: 200 }],
        default: [],
        validate: {
            validator: (value) => value.length <= 6,
            message: "A lesson can have at most 6 key points.",
        },
    },
    estimatedMinutes: { type: Number, required: true, min: 1 },
}, { timestamps: true });
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });
export const Lesson = model("Lesson", lessonSchema);
