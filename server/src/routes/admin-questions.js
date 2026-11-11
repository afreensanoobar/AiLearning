import { z } from "zod";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Question } from "../models/question.js";
import { questionGenerationPrompt } from "../services/ai/prompts.js";
import { createAiRateLimit } from "../services/ai/rate-limit.js";
import { generateValidatedJson } from "../services/ai/validated-json.js";
import { documentId, getValidated, idParams, objectId } from "./admin-helpers.js";
const topics = ["HTML", "CSS", "JavaScript", "React"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const statuses = ["active", "draft", "rejected", "archived"];
const sources = ["manual", "ai"];
const generatedQuestionSchema = z
    .object({
    text: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(1),
})
    .strict()
    .superRefine((question, context) => {
    if (new Set(question.options.map((option) => option.toLowerCase())).size !== 4) {
        context.addIssue({
            code: "custom",
            message: "Options must be distinct.",
            path: ["options"],
        });
    }
});
const questionFields = z.object({
    text: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(1),
    topic: z.enum(topics),
    difficulty: z.enum(difficulties),
    challengeStage: z.union([z.literal(1), z.literal(2), z.literal(3), z.null()]).optional(),
    status: z.enum(["active", "draft"]).optional(),
});
const questionBody = questionFields.superRefine((question, context) => {
    if (new Set(question.options.map((option) => option.toLowerCase())).size !== 4) {
        context.addIssue({
            code: "custom",
            message: "Options must be distinct.",
            path: ["options"],
        });
    }
});
const questionPatchBody = questionFields.partial().refine((body) => Object.keys(body).length > 0, { message: "At least one question field must be provided." });
const listSchema = z.object({
    query: z.object({
        topic: z.enum(topics).optional(),
        difficulty: z.enum(difficulties).optional(),
        status: z.enum(statuses).optional(),
        source: z.enum(sources).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
    }),
});
const generationSchema = z.object({
    body: z.object({
        topic: z.enum(topics),
        difficulty: z.enum(difficulties),
        count: z.number().int().min(1).max(10),
    }),
});
function normalizeQuestionText(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
}
function isNearDuplicate(first, second) {
    const firstText = normalizeQuestionText(first);
    const secondText = normalizeQuestionText(second);
    if (!firstText || !secondText)
        return false;
    if (firstText === secondText)
        return true;
    const firstWords = new Set(firstText.split(/\s+/));
    const secondWords = new Set(secondText.split(/\s+/));
    const overlap = [...firstWords].filter((word) => secondWords.has(word)).length;
    return (2 * overlap) / (firstWords.size + secondWords.size) >= 0.8;
}
function serializeQuestion(question) {
    return {
        id: documentId(question),
        topic: question.topic,
        difficulty: question.difficulty,
        text: question.text,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        challengeStage: question.challengeStage ?? null,
        status: question.status,
        source: question.source,
    };
}
export function registerAdminQuestionRoutes(router, gateway) {
    router.get("/questions", validate(listSchema), asyncHandler(async (_req, res) => {
        const query = getValidated(res).query;
        const filter = {};
        if (query.topic)
            filter.topic = query.topic;
        if (query.difficulty)
            filter.difficulty = query.difficulty;
        if (query.status)
            filter.status = query.status;
        if (query.source)
            filter.source = query.source;
        const questions = await Question.find(filter)
            .sort({ updatedAt: -1 })
            .limit(query.limit);
        res.json({ questions: questions.map(serializeQuestion) });
    }));
    router.post("/questions", validate(z.object({ body: questionBody })), asyncHandler(async (_req, res) => {
        const body = getValidated(res).body;
        const question = await Question.create({
            ...body,
            challengeStage: body.challengeStage ?? null,
            status: body.status ?? "active",
            source: "manual",
            createdBy: res.locals.auth.userId,
        });
        res.status(201).json({ question: serializeQuestion(question) });
    }));
    router.patch("/questions/:id", validate(z.object({
        params: z.object({ id: objectId }),
        body: questionPatchBody,
    })), asyncHandler(async (_req, res) => {
        const { params, body } = getValidated(res);
        const question = await Question.findByIdAndUpdate(params.id, { $set: body }, { returnDocument: "after", runValidators: true });
        if (!question) {
            throw new HttpError(404, "QUESTION_NOT_FOUND", "Question not found.");
        }
        res.json({ question: serializeQuestion(question) });
    }));
    router.post("/questions/:id/approve", validate(idParams), asyncHandler(async (_req, res) => {
        const { id } = getValidated(res).params;
        const question = await Question.findById(id);
        if (!question) {
            throw new HttpError(404, "QUESTION_NOT_FOUND", "Question not found.");
        }
        if (question.status !== "draft") {
            throw new HttpError(409, "QUESTION_NOT_DRAFT", "Only draft questions can be approved.");
        }
        question.status = "active";
        await question.save();
        res.json({ question: serializeQuestion(question) });
    }));
    router.post("/questions/:id/reject", validate(idParams), asyncHandler(async (_req, res) => {
        const { id } = getValidated(res).params;
        const question = await Question.findById(id);
        if (!question) {
            throw new HttpError(404, "QUESTION_NOT_FOUND", "Question not found.");
        }
        if (question.status !== "draft") {
            throw new HttpError(409, "QUESTION_NOT_DRAFT", "Only draft questions can be rejected.");
        }
        question.status = "rejected";
        await question.save();
        res.json({ question: serializeQuestion(question) });
    }));
    router.delete("/questions/:id", validate(idParams), asyncHandler(async (_req, res) => {
        const { id } = getValidated(res).params;
        const question = await Question.findById(id);
        if (!question) {
            throw new HttpError(404, "QUESTION_NOT_FOUND", "Question not found.");
        }
        question.status = "archived";
        await question.save();
        res.json({ question: serializeQuestion(question) });
    }));
    router.post("/questions/generate", validate(generationSchema), createAiRateLimit(10), asyncHandler(async (_req, res) => {
        const { topic, difficulty, count } = getValidated(res).body;
        const existing = await Question.find({ topic, difficulty })
            .select("text")
            .sort({ createdAt: -1 })
            .lean();
        const generatedSchema = z.array(generatedQuestionSchema).length(count);
        const questions = await generateValidatedJson(gateway, "question-generation", {
            system: questionGenerationPrompt({
                count,
                topic,
                difficulty,
                existingSamples: existing.map((question) => question.text),
            }),
            messages: [{ role: "user", content: "Generate the requested question set." }],
            maxTokens: 3000,
            temperature: 0.5,
            json: true,
        }, generatedSchema);
        const existingTexts = existing.map((question) => question.text);
        const seen = [];
        for (const question of questions) {
            if ([...existingTexts, ...seen].some((text) => isNearDuplicate(question.text, text))) {
                throw new HttpError(409, "DUPLICATE_QUESTION", "AI generated a question too similar to existing content.");
            }
            seen.push(question.text);
        }
        const drafts = await Question.insertMany(questions.map((question) => ({
            ...question,
            topic,
            difficulty,
            status: "draft",
            source: "ai",
            createdBy: res.locals.auth.userId,
        })));
        res.status(201).json({
            count: drafts.length,
            questionIds: drafts.map((question) => question.id),
        });
    }));
}
