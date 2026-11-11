import { Schema, Types, model } from "mongoose";
import type { LearningLevel } from "./user.js";

export type QuestionTopic = "HTML" | "CSS" | "JavaScript" | "React";
export type QuestionStatus = "active" | "draft" | "rejected";
export type QuestionSource = "manual" | "ai";

interface QuestionFields {
  topic: QuestionTopic;
  difficulty: LearningLevel;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  challengeStage: number | null;
  status: QuestionStatus;
  source: QuestionSource;
  createdBy: Types.ObjectId | null;
}

const questionSchema = new Schema<QuestionFields>(
  {
    topic: {
      type: String,
      enum: ["HTML", "CSS", "JavaScript", "React"] satisfies QuestionTopic[],
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
        validator: (options: string[]) =>
          options.length === 4 &&
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
      enum: ["active", "draft", "rejected"] satisfies QuestionStatus[],
      default: "active",
      required: true,
    },
    source: {
      type: String,
      enum: ["manual", "ai"] satisfies QuestionSource[],
      default: "manual",
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

questionSchema.index({ topic: 1, difficulty: 1, status: 1 });

export const Question = model<QuestionFields>("Question", questionSchema);
