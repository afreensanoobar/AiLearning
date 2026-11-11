import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireAuth } from "../auth/require-auth.js";
import { calculateNextDifficulty, generateRecommendations, } from "../assessments/engines.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { AiStudyPlanCache } from "../models/ai-study-plan.js";
import { Attempt } from "../models/attempt.js";
import { Question } from "../models/question.js";
import { User } from "../models/user.js";
import { createAiCacheKey } from "../services/ai/cache.js";
import { awardBadge, createNotification, recordStreakMilestones, } from "../services/gamification.js";
import { ai } from "../services/ai/gateway.js";
import { explainAnswerPrompt } from "../services/ai/prompts.js";
import { createAiRateLimit } from "../services/ai/rate-limit.js";
const topics = ["HTML", "CSS", "JavaScript", "React"];
const startSchema = z.object({
    body: z.object({ mode: z.enum(["assessment", "challenge"]) }),
});
const idSchema = z.object({
    params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});
const answerSchema = z.object({
    params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
    body: z.object({
        questionId: z.string().regex(/^[a-f\d]{24}$/i),
        selectedIndex: z.number().int().min(0).max(3),
    }),
});
const historySchema = z.object({
    query: z.object({
        limit: z.coerce.number().int().min(1).max(50).default(20),
        cursor: z
            .string()
            .regex(/^[a-f\d]{24}$/i)
            .optional(),
    }),
});
const explainSchema = z.object({
    params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
    body: z.object({ questionId: z.string().regex(/^[a-f\d]{24}$/i) }),
});
function getValidated(res) {
    return res.locals.validated;
}
function userIdFrom(res) {
    return res.locals.auth.userId;
}
function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}
async function getAttemptQuestions(questionIds) {
    const found = await Question.find({ _id: { $in: questionIds } }).lean();
    const byId = new Map(found.map((question) => [question._id.toString(), question]));
    const questions = questionIds.map((id) => byId.get(id.toString()));
    if (questions.some((question) => !question)) {
        throw new HttpError(409, "QUESTIONS_UNAVAILABLE", "Some assessment questions are unavailable.");
    }
    return questions;
}
async function hasPerfectAdvancedAssessment(userId) {
    return Boolean(await Attempt.exists({
        userId,
        type: "Assessment",
        difficulty: "Advanced",
        status: "submitted",
        percentage: 100,
    }));
}
function questionPayload(question, answer) {
    return {
        id: question._id,
        text: question.text,
        options: question.options,
        ...(answer
            ? {
                selectedIndex: answer.selectedIndex,
                correct: answer.correct,
                correctIndex: question.correctIndex,
                correctAnswer: question.options[question.correctIndex],
                explanation: question.explanation,
            }
            : {}),
    };
}
async function attemptPayload(attempt) {
    const questions = await getAttemptQuestions(attempt.questionIds);
    const answerById = new Map(attempt.answers.map((answer) => [answer.questionId.toString(), answer]));
    const inProgress = attempt.status === "in_progress";
    const questionList = questions.map((question) => {
        const answer = answerById.get(question._id.toString());
        return questionPayload(question, !inProgress && answer ? answer : undefined);
    });
    if (inProgress) {
        return {
            id: attempt.id,
            type: attempt.type,
            difficulty: attempt.difficulty,
            challengeStage: attempt.challengeStage,
            status: attempt.status,
            questions: questionList,
            answers: attempt.answers.map((answer) => ({
                questionId: answer.questionId,
                selectedIndex: answer.selectedIndex,
            })),
            startedAt: attempt.startedAt,
        };
    }
    const canStartChallenge = attempt.type === "Assessment" &&
        attempt.difficulty === "Advanced" &&
        attempt.percentage === 100;
    const challengePassed = attempt.type === "Advanced Challenge" && attempt.percentage === 100;
    const finalChallengeCompleted = challengePassed && attempt.challengeStage === 3;
    return {
        id: attempt.id,
        type: attempt.type,
        difficulty: attempt.difficulty,
        challengeStage: attempt.challengeStage,
        status: attempt.status,
        score: attempt.score,
        total: attempt.total,
        percentage: attempt.percentage,
        topicResults: attempt.topicResults,
        recommendations: generateRecommendations(attempt.topicResults),
        nextLevel: attempt.nextLevel,
        adaptiveMessage: attempt.adaptiveMessage,
        mastered: attempt.mastered,
        canStartChallenge,
        challengePassed,
        nextStage: challengePassed && attempt.challengeStage < 3 ? attempt.challengeStage + 1 : null,
        finalChallengeCompleted,
        questions: questionList,
        completedAt: attempt.completedAt,
    };
}
async function findOwnedAttempt(id, userId) {
    return Attempt.findOne({ _id: id, userId });
}
export function createAssessmentsRouter(gateway = ai) {
    const assessmentsRouter = Router();
    assessmentsRouter.use(requireAuth);
    assessmentsRouter.post("/start", validate(startSchema), asyncHandler(async (_req, res) => {
        const userId = userIdFrom(res);
        const { mode } = getValidated(res).body;
        const type = mode === "assessment" ? "Assessment" : "Advanced Challenge";
        const existing = await Attempt.findOne({ userId, type, status: "in_progress" });
        if (existing) {
            return res.json({ attempt: await attemptPayload(existing) });
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
        }
        let difficulty = user.currentLevel;
        let challengeStage = null;
        const filter = {
            status: "active",
            difficulty,
            challengeStage: null,
        };
        if (mode === "challenge") {
            if (user.currentLevel !== "Advanced" ||
                !(await hasPerfectAdvancedAssessment(userId))) {
                throw new HttpError(403, "CHALLENGE_LOCKED", "Pass an Advanced assessment with 100% to unlock the challenge.");
            }
            const passedStages = await Attempt.find({
                userId,
                type: "Advanced Challenge",
                status: "submitted",
                percentage: 100,
            })
                .select("challengeStage")
                .lean();
            const highestPassedStage = Math.max(0, ...passedStages.map((attempt) => attempt.challengeStage ?? 0));
            if (highestPassedStage >= 3) {
                throw new HttpError(403, "CHALLENGE_COMPLETE", "You have completed all challenge stages.");
            }
            challengeStage = highestPassedStage + 1;
            difficulty = "Advanced";
            filter.difficulty = difficulty;
            filter.challengeStage = challengeStage;
        }
        const questions = shuffle(await Question.find(filter).lean());
        if (questions.length === 0) {
            throw new HttpError(409, "QUESTIONS_UNAVAILABLE", "No questions are available for this assessment.");
        }
        const attempt = await Attempt.create({
            userId,
            type,
            difficulty,
            challengeStage,
            questionIds: questions.map((question) => question._id),
            total: questions.length,
        });
        res.status(201).json({ attempt: await attemptPayload(attempt) });
    }));
    assessmentsRouter.patch("/:id/answer", validate(answerSchema), asyncHandler(async (_req, res) => {
        const validated = getValidated(res);
        const { id } = validated.params;
        const { questionId, selectedIndex } = validated.body;
        const attempt = await findOwnedAttempt(id, userIdFrom(res));
        if (!attempt) {
            throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Assessment attempt not found.");
        }
        if (attempt.status !== "in_progress") {
            throw new HttpError(409, "ATTEMPT_SUBMITTED", "This assessment has already been submitted.");
        }
        if (!attempt.questionIds.some((questionIdInAttempt) => questionIdInAttempt.equals(questionId))) {
            throw new HttpError(400, "QUESTION_NOT_IN_ATTEMPT", "Question is not part of this assessment.");
        }
        const answerIndex = attempt.answers.findIndex((answer) => answer.questionId.equals(questionId));
        if (answerIndex >= 0) {
            attempt.answers[answerIndex].selectedIndex = selectedIndex;
        }
        else {
            attempt.answers.push({
                questionId: new Types.ObjectId(questionId),
                selectedIndex,
                correct: false,
            });
        }
        await attempt.save();
        res.json({ questionId, selectedIndex });
    }));
    assessmentsRouter.post("/:id/submit", validate(idSchema), asyncHandler(async (_req, res) => {
        const { id } = getValidated(res).params;
        const userId = userIdFrom(res);
        const attempt = await findOwnedAttempt(id, userId);
        if (!attempt) {
            throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Assessment attempt not found.");
        }
        if (attempt.status !== "in_progress") {
            throw new HttpError(409, "ATTEMPT_SUBMITTED", "This assessment has already been submitted.");
        }
        const answersById = new Map(attempt.answers.map((answer) => [answer.questionId.toString(), answer]));
        const unanswered = attempt.questionIds.filter((questionId) => !answersById.has(questionId.toString()));
        if (unanswered.length > 0) {
            throw new HttpError(400, "UNANSWERED_QUESTIONS", "Answer all questions before submitting.", unanswered.map((questionId) => ({ questionId: questionId.toString() })));
        }
        const questions = await getAttemptQuestions(attempt.questionIds);
        let score = 0;
        const topicCounts = new Map(topics.map((topic) => [topic, { correct: 0, total: 0 }]));
        const answers = questions.map((question) => {
            const answer = answersById.get(question._id.toString());
            const correct = answer.selectedIndex === question.correctIndex;
            if (correct)
                score += 1;
            const topicCount = topicCounts.get(question.topic);
            topicCount.total += 1;
            if (correct)
                topicCount.correct += 1;
            return {
                questionId: question._id,
                selectedIndex: answer.selectedIndex,
                correct,
            };
        });
        const topicResults = topics.map((topic) => {
            const result = topicCounts.get(topic);
            return {
                topic,
                correct: result.correct,
                total: result.total,
                percentage: result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0,
            };
        });
        const percentage = Math.round((score / attempt.total) * 100);
        const adaptive = calculateNextDifficulty(score, attempt.total, attempt.difficulty);
        const completedAt = new Date();
        const previousSubmittedCount = await Attempt.countDocuments({
            userId,
            status: "submitted",
        });
        const updated = await Attempt.updateOne({ _id: attempt._id, userId, status: "in_progress" }, {
            $set: {
                answers,
                score,
                percentage,
                topicResults,
                nextLevel: adaptive.level,
                adaptiveMessage: adaptive.message,
                mastered: adaptive.mastered,
                status: "submitted",
                completedAt,
            },
        });
        if (updated.modifiedCount === 0) {
            throw new HttpError(409, "ATTEMPT_SUBMITTED", "This assessment has already been submitted.");
        }
        const userUpdate = { lastActiveAt: completedAt };
        if (attempt.type === "Assessment")
            userUpdate.currentLevel = adaptive.level;
        await User.updateOne({ _id: userId }, { $set: userUpdate });
        await AiStudyPlanCache.deleteOne({ userId });
        const attemptKey = attempt._id.toString();
        const awards = [];
        if (previousSubmittedCount === 0)
            awards.push(awardBadge(userId, "first-quiz"));
        if (percentage === 100)
            awards.push(awardBadge(userId, "perfect-score"));
        const levelOrder = ["Beginner", "Intermediate", "Advanced"];
        const leveledUp = attempt.type === "Assessment" &&
            levelOrder.indexOf(adaptive.level) > levelOrder.indexOf(attempt.difficulty);
        if (leveledUp)
            awards.push(awardBadge(userId, "level-up"));
        const passedChallenge = attempt.type === "Advanced Challenge" && percentage === 100;
        const masteredChallenge = passedChallenge && attempt.challengeStage === 3;
        if (masteredChallenge)
            awards.push(awardBadge(userId, "challenge-master"));
        await Promise.all(awards);
        await createNotification(userId, attempt.type === "Assessment"
            ? "Assessment completed"
            : `Challenge stage ${attempt.challengeStage} completed`, `${attempt.type} completed: ${percentage}%`, `attempt-${attemptKey}-completed`);
        if (leveledUp) {
            await createNotification(userId, "Level up", `You have advanced to ${adaptive.level}.`, `attempt-${attemptKey}-level-up`);
        }
        if (attempt.type === "Assessment" &&
            attempt.difficulty === "Advanced" &&
            percentage === 100) {
            await createNotification(userId, "Advanced challenge unlocked", "A perfect Advanced assessment unlocked the challenge.", `attempt-${attemptKey}-challenge-unlocked`);
        }
        if (passedChallenge && attempt.challengeStage < 3) {
            await createNotification(userId, "Challenge stage unlocked", `Challenge stage ${attempt.challengeStage + 1} is ready.`, `attempt-${attemptKey}-next-stage`);
        }
        if (masteredChallenge) {
            await createNotification(userId, "Challenge completed", "You mastered all advanced challenge stages.", `attempt-${attemptKey}-challenge-mastered`);
        }
        await recordStreakMilestones(userId, completedAt);
        const submittedAttempt = await Attempt.findById(attempt._id);
        res.json({ attempt: await attemptPayload(submittedAttempt) });
    }));
    assessmentsRouter.get("/history", validate(historySchema), asyncHandler(async (_req, res) => {
        const userId = userIdFrom(res);
        const { limit, cursor } = getValidated(res).query;
        const filter = { userId };
        if (cursor)
            filter._id = { $lt: cursor };
        const attempts = await Attempt.find(filter)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = attempts.length > limit;
        const items = attempts.slice(0, limit).map((attempt) => ({
            id: attempt._id,
            type: attempt.type,
            difficulty: attempt.difficulty,
            challengeStage: attempt.challengeStage,
            status: attempt.status,
            score: attempt.score,
            total: attempt.total,
            percentage: attempt.percentage,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
        }));
        res.json({
            attempts: items,
            nextCursor: hasMore ? items.at(-1)?.id : null,
        });
    }));
    assessmentsRouter.get("/:id", validate(idSchema), asyncHandler(async (_req, res) => {
        const { id } = getValidated(res).params;
        const attempt = await findOwnedAttempt(id, userIdFrom(res));
        if (!attempt) {
            throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Assessment attempt not found.");
        }
        res.json({ attempt: await attemptPayload(attempt) });
    }));
    assessmentsRouter.post("/:id/explain", validate(explainSchema), createAiRateLimit(20), asyncHandler(async (_req, res) => {
        const validated = getValidated(res);
        const userId = userIdFrom(res);
        const attempt = await findOwnedAttempt(validated.params.id, userId);
        if (!attempt) {
            throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Assessment attempt not found.");
        }
        if (attempt.status !== "submitted") {
            throw new HttpError(409, "ATTEMPT_NOT_SUBMITTED", "Submit the assessment before requesting an explanation.");
        }
        if (!attempt.questionIds.some((questionId) => questionId.equals(validated.body.questionId))) {
            throw new HttpError(400, "QUESTION_NOT_IN_ATTEMPT", "Question is not part of this assessment.");
        }
        const answer = attempt.answers.find((item) => item.questionId.equals(validated.body.questionId));
        if (!answer) {
            throw new HttpError(404, "ANSWER_NOT_FOUND", "Assessment answer not found.");
        }
        if (answer.correct) {
            throw new HttpError(400, "ANSWER_IS_CORRECT", "AI explanations are available for incorrect answers.");
        }
        const question = await Question.findById(validated.body.questionId).lean();
        if (!question) {
            throw new HttpError(404, "QUESTION_NOT_FOUND", "Assessment question not found.");
        }
        const user = await User.findById(userId).select("currentLevel");
        if (!user) {
            throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
        }
        const level = user.currentLevel;
        const cacheKey = createAiCacheKey("assessment-explanation", {
            questionId: question._id.toString(),
            selectedIndex: answer.selectedIndex,
            level,
        });
        const result = await gateway.generate("assessment-explanation", {
            system: explainAnswerPrompt({
                text: question.text,
                options: question.options,
                chosen: question.options[answer.selectedIndex],
                correct: question.options[question.correctIndex],
                topic: question.topic,
                level,
            }),
            messages: [{ role: "user", content: "Explain my answer." }],
            maxTokens: 250,
            temperature: 0.4,
        }, cacheKey);
        res.json({ explanation: result.text });
    }));
    return assessmentsRouter;
}
export const assessmentsRouter = createAssessmentsRouter();
