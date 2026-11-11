import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Course } from "../models/course.js";
import { Lesson } from "../models/lesson.js";
import { LessonAssessmentAttempt, } from "../models/lesson-assessment-attempt.js";
import { ai } from "../services/ai/gateway.js";
import { createAiRateLimit } from "../services/ai/rate-limit.js";
import { generateValidatedJson } from "../services/ai/validated-json.js";
import { lessonAssessmentPrompt } from "../services/ai/prompts.js";
const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const startSchema = z.object({
    params: z.object({ lessonId: objectId }),
    body: z.object({ lessonMaterial: z.string().trim().max(8000).optional() }),
});
const answerSchema = z.object({
    params: z.object({ attemptId: objectId }),
    body: z.object({
        questionId: z.string().regex(/^q[1-3]$/),
        selectedIndex: z.number().int().min(0).max(3),
    }),
});
const attemptSchema = z.object({ params: z.object({ attemptId: objectId }) });
const generatedQuestionSchema = z
    .object({
    text: z.string().trim().min(1).max(500),
    options: z.array(z.string().trim().min(1).max(300)).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(1).max(1000),
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
function getValidated(res) {
    return res.locals.validated;
}
function serializeAttempt(attempt) {
    const submitted = attempt.status === "submitted";
    return {
        id: attempt.id,
        lessonId: attempt.lessonId.toString(),
        status: attempt.status,
        total: attempt.total,
        questions: attempt.questions.map((question) => ({
            id: question.id,
            text: question.text,
            options: question.options,
            selectedIndex: question.selectedIndex,
            ...(submitted
                ? {
                    correct: question.selectedIndex === question.correctIndex,
                    correctIndex: question.correctIndex,
                    correctAnswer: question.options[question.correctIndex],
                    explanation: question.explanation,
                }
                : {}),
        })),
        ...(submitted
            ? {
                score: attempt.score,
                percentage: attempt.percentage,
                submittedAt: attempt.submittedAt,
            }
            : {}),
    };
}
export function createLessonAssessmentsRouter(gateway = ai) {
    const router = Router();
    router.use(requireAuth);
    router.post("/:lessonId/start", validate(startSchema), createAiRateLimit(10), asyncHandler(async (_req, res) => {
        const { params, body } = getValidated(res);
        const userId = res.locals.auth.userId;
        const lesson = await Lesson.findById(params.lessonId).lean();
        if (!lesson) {
            throw new HttpError(404, "LESSON_NOT_FOUND", "Lesson not found.");
        }
        const activeAttempt = await LessonAssessmentAttempt.findOne({
            userId,
            lessonId: lesson._id,
            status: "in_progress",
        }).sort({ createdAt: -1 });
        if (activeAttempt) {
            res.json({ attempt: serializeAttempt(activeAttempt) });
            return;
        }
        const course = await Course.findById(lesson.courseId).select("title").lean();
        const attemptNumber = (await LessonAssessmentAttempt.countDocuments({
            userId,
            lessonId: lesson._id,
        })) + 1;
        const displayedMaterial = body.lessonMaterial ?? "";
        const generatedQuestions = await generateValidatedJson(gateway, "lesson-assessment-generation", {
            system: lessonAssessmentPrompt({
                courseTitle: course?.title ?? "LearnAI",
                lessonTitle: lesson.title,
                attemptNumber,
            }),
            messages: [
                {
                    role: "user",
                    content: JSON.stringify({
                        lessonContent: lesson.content.slice(0, 8000),
                        displayedNotesAndKeyPoints: displayedMaterial,
                    }),
                },
            ],
            maxTokens: 2400,
            temperature: 0.5,
            json: true,
        }, z.array(generatedQuestionSchema).length(3));
        const attempt = await LessonAssessmentAttempt.create({
            userId,
            lessonId: lesson._id,
            total: generatedQuestions.length,
            questions: generatedQuestions.map((question, index) => ({
                ...question,
                id: `q${index + 1}`,
                selectedIndex: null,
            })),
        });
        res.status(201).json({ attempt: serializeAttempt(attempt) });
    }));
    router.patch("/:attemptId/answer", validate(answerSchema), asyncHandler(async (_req, res) => {
        const { params, body } = getValidated(res);
        const attempt = await LessonAssessmentAttempt.findOne({
            _id: params.attemptId,
            userId: res.locals.auth.userId,
        });
        if (!attempt) {
            throw new HttpError(404, "LESSON_ASSESSMENT_NOT_FOUND", "Lesson assessment not found.");
        }
        if (attempt.status !== "in_progress") {
            throw new HttpError(409, "LESSON_ASSESSMENT_SUBMITTED", "This lesson assessment has already been submitted.");
        }
        const question = attempt.questions.find((item) => item.id === body.questionId);
        if (!question) {
            throw new HttpError(400, "QUESTION_NOT_IN_ASSESSMENT", "Question is not part of this lesson assessment.");
        }
        question.selectedIndex = body.selectedIndex;
        await attempt.save();
        res.json({ questionId: body.questionId, selectedIndex: body.selectedIndex });
    }));
    router.post("/:attemptId/submit", validate(attemptSchema), asyncHandler(async (_req, res) => {
        const { attemptId } = getValidated(res).params;
        const attempt = await LessonAssessmentAttempt.findOne({
            _id: attemptId,
            userId: res.locals.auth.userId,
        });
        if (!attempt) {
            throw new HttpError(404, "LESSON_ASSESSMENT_NOT_FOUND", "Lesson assessment not found.");
        }
        if (attempt.status === "submitted") {
            res.json({ attempt: serializeAttempt(attempt) });
            return;
        }
        if (attempt.questions.some((question) => question.selectedIndex === null)) {
            throw new HttpError(400, "UNANSWERED_QUESTIONS", "Answer all questions before submitting.");
        }
        attempt.score = attempt.questions.filter((question) => question.selectedIndex === question.correctIndex).length;
        attempt.percentage = Math.round((attempt.score / attempt.total) * 100);
        attempt.status = "submitted";
        attempt.submittedAt = new Date();
        await attempt.save();
        res.json({ attempt: serializeAttempt(attempt) });
    }));
    return router;
}
export const lessonAssessmentsRouter = createLessonAssessmentsRouter();
