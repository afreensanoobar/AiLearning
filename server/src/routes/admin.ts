import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Question } from "../models/question.js";
import type { QuestionTopic } from "../models/question.js";
import type { LearningLevel } from "../models/user.js";
import { ai } from "../services/ai/gateway.js";
import type { AiRequest } from "../services/ai/provider.js";
import { questionGenerationPrompt } from "../services/ai/prompts.js";
import { createAiRateLimit } from "../services/ai/rate-limit.js";
import { generateValidatedJson } from "../services/ai/validated-json.js";

const generationSchema = z.object({
  body: z.object({
    topic: z.enum(["HTML", "CSS", "JavaScript", "React"]),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    count: z.number().int().min(1).max(10),
  }),
});

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

function normalizeQuestionText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function isNearDuplicate(first: string, second: string) {
  const firstText = normalizeQuestionText(first);
  const secondText = normalizeQuestionText(second);
  if (!firstText || !secondText) return false;
  if (firstText === secondText) return true;

  const firstWords = new Set(firstText.split(/\s+/));
  const secondWords = new Set(secondText.split(/\s+/));
  const overlap = [...firstWords].filter((word) => secondWords.has(word)).length;
  return (2 * overlap) / (firstWords.size + secondWords.size) >= 0.8;
}

export function createAdminRouter(
  gateway: {
    generate(feature: string, request: AiRequest): Promise<{ text: string }>;
  } = ai
) {
  const router = Router();
  router.use(requireAuth, requireRole("admin"));

  router.post(
    "/questions/generate",
    validate(generationSchema),
    createAiRateLimit(10),
    asyncHandler(async (_req, res) => {
      const { topic, difficulty, count } = (
        res.locals.validated as {
          body: {
            topic: QuestionTopic;
            difficulty: LearningLevel;
            count: number;
          };
        }
      ).body;
      const existing = await Question.find({ topic, difficulty })
        .select("text")
        .sort({ createdAt: -1 })
        .lean();
      const generatedSchema = z.array(generatedQuestionSchema).length(count);
      const questions = await generateValidatedJson(
        gateway,
        "question-generation",
        {
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
        },
        generatedSchema
      );

      const existingTexts = existing.map((question) => question.text);
      const seen: string[] = [];
      for (const question of questions) {
        if (
          [...existingTexts, ...seen].some((text) => isNearDuplicate(question.text, text))
        ) {
          throw new HttpError(
            409,
            "DUPLICATE_QUESTION",
            "AI generated a question too similar to existing content."
          );
        }
        seen.push(question.text);
      }

      const drafts = await Question.insertMany(
        questions.map((question) => ({
          ...question,
          topic,
          difficulty,
          status: "draft",
          source: "ai",
          createdBy: res.locals.auth!.userId,
        }))
      );
      res.status(201).json({
        count: drafts.length,
        questionIds: drafts.map((question) => question.id),
      });
    })
  );

  return router;
}

export const adminRouter = createAdminRouter();
