import { Schema, model } from "mongoose";
const studyPlanDaySchema = new Schema({
    day: { type: String, required: true },
    focusTopic: {
        type: String,
        enum: ["HTML", "CSS", "JavaScript", "React"],
        required: true,
    },
    tasks: [{ type: String, required: true }],
    minutes: { type: Number, required: true, min: 1, max: 60 },
}, { _id: false });
const studyPlanSchema = new Schema({
    summary: { type: String, required: true },
    weeklyPlan: { type: [studyPlanDaySchema], required: true },
    tips: [{ type: String, required: true }],
}, { _id: false });
const aiStudyPlanSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    plan: { type: studyPlanSchema, required: true },
}, { timestamps: true });
export const AiStudyPlanCache = model("AiStudyPlanCache", aiStudyPlanSchema);
