import { Schema, Types, model } from "mongoose";

interface LessonFields {
  courseId: Types.ObjectId;
  title: string;
  order: number;
  content: string;
  estimatedMinutes: number;
}

const lessonSchema = new Schema<LessonFields>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 0 },
    content: { type: String, required: true, trim: true },
    estimatedMinutes: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

export const Lesson = model<LessonFields>("Lesson", lessonSchema);
