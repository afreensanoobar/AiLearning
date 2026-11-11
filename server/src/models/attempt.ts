import { Schema, Types, model } from "mongoose";
import type { LearningLevel } from "./user.js";
import type { QuestionTopic } from "./question.js";

export type AttemptType = "Assessment" | "Advanced Challenge";

interface AttemptAnswer {
  questionId: Types.ObjectId;
  selectedIndex: number;
  correct: boolean;
}

interface TopicResult {
  topic: QuestionTopic;
  correct: number;
  total: number;
  percentage: number;
}

interface AttemptFields {
  userId: Types.ObjectId;
  type: AttemptType;
  difficulty: LearningLevel;
  challengeStage: number | null;
  status: "in_progress" | "submitted";
  questionIds: Types.ObjectId[];
  answers: AttemptAnswer[];
  score: number;
  total: number;
  percentage: number;
  topicResults: TopicResult[];
  nextLevel: LearningLevel | null;
  adaptiveMessage: string | null;
  mastered: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

const attemptSchema = new Schema<AttemptFields>(
  {
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
  },
  { timestamps: true }
);

attemptSchema.index({ userId: 1, completedAt: -1 });

export const Attempt = model<AttemptFields>("Attempt", attemptSchema);
