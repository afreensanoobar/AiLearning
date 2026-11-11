import { Schema, Types, model } from "mongoose";

interface LessonFields {
  courseId: Types.ObjectId;
  title: string;
  order: number;
  content: string;
  videoId?: string;
  channel?: string;
  keyPoints: string[];
  estimatedMinutes: number;
}

const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;

const lessonSchema = new Schema<LessonFields>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 0 },
    content: { type: String, required: true, trim: true },
    videoId: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string | undefined) =>
          value === undefined || value === "" || videoIdPattern.test(value),
        message: "Video ID must contain exactly 11 valid characters.",
      },
    },
    channel: { type: String, trim: true, maxlength: 100 },
    keyPoints: {
      type: [{ type: String, trim: true, maxlength: 200 }],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 6,
        message: "A lesson can have at most 6 key points.",
      },
    },
    estimatedMinutes: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

export const Lesson = model<LessonFields>("Lesson", lessonSchema);
