import { Schema, Types, model } from "mongoose";

export interface LessonAssessmentQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex: number | null;
}

interface LessonAssessmentAttemptFields {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  questions: LessonAssessmentQuestion[];
  total: number;
  score: number;
  percentage: number;
  status: "in_progress" | "submitted";
  startedAt: Date;
  submittedAt: Date | null;
}

const questionSchema = new Schema<LessonAssessmentQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    options: {
      type: [{ type: String, trim: true, required: true }],
      required: true,
      validate: (options: string[]) => options.length === 4,
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true, trim: true },
    selectedIndex: { type: Number, min: 0, max: 3, default: null },
  },
  { _id: false }
);

const lessonAssessmentAttemptSchema = new Schema<LessonAssessmentAttemptFields>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    questions: { type: [questionSchema], required: true },
    total: { type: Number, required: true, min: 1 },
    score: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["in_progress", "submitted"],
      default: "in_progress",
      required: true,
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

lessonAssessmentAttemptSchema.index({ userId: 1, lessonId: 1, status: 1 });

export const LessonAssessmentAttempt = model<LessonAssessmentAttemptFields>(
  "LessonAssessmentAttempt",
  lessonAssessmentAttemptSchema
);
