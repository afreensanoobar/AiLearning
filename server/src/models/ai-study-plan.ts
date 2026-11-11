import { Schema, Types, model } from "mongoose";
import type { QuestionTopic } from "./question.js";

export interface StudyPlanDay {
  day: string;
  focusTopic: QuestionTopic;
  tasks: string[];
  minutes: number;
}

export interface StudyPlan {
  summary: string;
  weeklyPlan: StudyPlanDay[];
  tips: string[];
}

interface AiStudyPlanFields {
  userId: Types.ObjectId;
  plan: StudyPlan;
}

const studyPlanDaySchema = new Schema<StudyPlanDay>(
  {
    day: { type: String, required: true },
    focusTopic: {
      type: String,
      enum: ["HTML", "CSS", "JavaScript", "React"],
      required: true,
    },
    tasks: [{ type: String, required: true }],
    minutes: { type: Number, required: true, min: 1, max: 60 },
  },
  { _id: false }
);

const studyPlanSchema = new Schema<StudyPlan>(
  {
    summary: { type: String, required: true },
    weeklyPlan: { type: [studyPlanDaySchema], required: true },
    tips: [{ type: String, required: true }],
  },
  { _id: false }
);

const aiStudyPlanSchema = new Schema<AiStudyPlanFields>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    plan: { type: studyPlanSchema, required: true },
  },
  { timestamps: true }
);

export const AiStudyPlanCache = model<AiStudyPlanFields>(
  "AiStudyPlanCache",
  aiStudyPlanSchema
);
