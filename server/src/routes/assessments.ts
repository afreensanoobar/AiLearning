import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireAuth } from "../auth/require-auth.js";
import {
  calculateNextDifficulty,
  generateRecommendations,
} from "../assessments/engines.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Attempt } from "../models/attempt.js";
import { Notification } from "../models/notification.js";
import { Question } from "../models/question.js";
import type { QuestionTopic } from "../models/question.js";
import { User } from "../models/user.js";
import type { LearningLevel } from "../models/user.js";

const topics: QuestionTopic[] = ["HTML", "CSS", "JavaScript", "React"];

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

function getValidated<T>(res: { locals: Record<string, unknown> }) {
  return res.locals.validated as T;
}

function userIdFrom(res: { locals: { auth?: { userId: string } } }) {
  return res.locals.auth!.userId;
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

async function getAttemptQuestions(questionIds: Types.ObjectId[]) {
  const found = await Question.find({ _id: { $in: questionIds } }).lean();
  const byId = new Map(found.map((question) => [question._id.toString(), question]));
  const questions = questionIds.map((id) => byId.get(id.toString()));
  if (questions.some((question) => !question)) {
    throw new HttpError(
      409,
      "QUESTIONS_UNAVAILABLE",
      "Some assessment questions are unavailable."
    );
  }
  return questions as NonNullable<(typeof questions)[number]>[];
}

async function hasPerfectAdvancedAssessment(userId: string) {
  return Boolean(
    await Attempt.exists({
      userId,
      type: "Assessment",
      difficulty: "Advanced",
      status: "submitted",
      percentage: 100,
    })
  );
}

function questionPayload(
  question: Awaited<ReturnType<typeof getAttemptQuestions>>[number],
  answer?: { selectedIndex: number; correct: boolean }
) {
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

async function attemptPayload(
  attempt: NonNullable<Awaited<ReturnType<typeof findOwnedAttempt>>>
) {
  const questions = await getAttemptQuestions(attempt.questionIds);
  const answerById = new Map(
    attempt.answers.map((answer) => [answer.questionId.toString(), answer])
  );
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

  const canStartChallenge =
    attempt.type === "Assessment" &&
    attempt.difficulty === "Advanced" &&
    attempt.percentage === 100;
  const challengePassed =
    attempt.type === "Advanced Challenge" && attempt.percentage === 100;
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
    nextStage:
      challengePassed && attempt.challengeStage! < 3 ? attempt.challengeStage! + 1 : null,
    finalChallengeCompleted,
    questions: questionList,
    completedAt: attempt.completedAt,
  };
}

async function findOwnedAttempt(id: string, userId: string) {
  return Attempt.findOne({ _id: id, userId });
}

export const assessmentsRouter = Router();

assessmentsRouter.use(requireAuth);

assessmentsRouter.post(
  "/start",
  validate(startSchema),
  asyncHandler(async (_req, res) => {
    const userId = userIdFrom(res);
    const { mode } = getValidated<{
      body: { mode: "assessment" | "challenge" };
    }>(res).body;
    const type = mode === "assessment" ? "Assessment" : "Advanced Challenge";
    const existing = await Attempt.findOne({ userId, type, status: "in_progress" });
    if (existing) {
      return res.json({ attempt: await attemptPayload(existing) });
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
    }

    let difficulty: LearningLevel = user.currentLevel;
    let challengeStage: number | null = null;
    const filter: Record<string, unknown> = {
      status: "active",
      difficulty,
      challengeStage: null,
    };

    if (mode === "challenge") {
      if (
        user.currentLevel !== "Advanced" ||
        !(await hasPerfectAdvancedAssessment(userId))
      ) {
        throw new HttpError(
          403,
          "CHALLENGE_LOCKED",
          "Pass an Advanced assessment with 100% to unlock the challenge."
        );
      }

      const passedStages = await Attempt.find({
        userId,
        type: "Advanced Challenge",
        status: "submitted",
        percentage: 100,
      })
        .select("challengeStage")
        .lean();
      const highestPassedStage = Math.max(
        0,
        ...passedStages.map((attempt) => attempt.challengeStage ?? 0)
      );
      if (highestPassedStage >= 3) {
        throw new HttpError(
          403,
          "CHALLENGE_COMPLETE",
          "You have completed all challenge stages."
        );
      }

      challengeStage = highestPassedStage + 1;
      difficulty = "Advanced";
      filter.difficulty = difficulty;
      filter.challengeStage = challengeStage;
    }

    const questions = shuffle(await Question.find(filter).lean());
    if (questions.length === 0) {
      throw new HttpError(
        409,
        "QUESTIONS_UNAVAILABLE",
        "No questions are available for this assessment."
      );
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
  })
);

assessmentsRouter.patch(
  "/:id/answer",
  validate(answerSchema),
  asyncHandler(async (_req, res) => {
    const validated = getValidated<{
      params: { id: string };
      body: { questionId: string; selectedIndex: number };
    }>(res);
    const { id } = validated.params;
    const { questionId, selectedIndex } = validated.body;
    const attempt = await findOwnedAttempt(id, userIdFrom(res));
    if (!attempt) {
      throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Assessment attempt not found.");
    }
    if (attempt.status !== "in_progress") {
      throw new HttpError(
        409,
        "ATTEMPT_SUBMITTED",
        "This assessment has already been submitted."
      );
    }
    if (
      !attempt.questionIds.some((questionIdInAttempt) =>
        questionIdInAttempt.equals(questionId)
      )
    ) {
      throw new HttpError(
        400,
        "QUESTION_NOT_IN_ATTEMPT",
        "Question is not part of this assessment."
      );
    }

    const answerIndex = attempt.answers.findIndex((answer) =>
      answer.questionId.equals(questionId)
    );
    if (answerIndex >= 0) {
      attempt.answers[answerIndex]!.selectedIndex = selectedIndex;
    } else {
      attempt.answers.push({
        questionId: new Types.ObjectId(questionId),
        selectedIndex,
        correct: false,
      });
    }
    await attempt.save();
    res.json({ questionId, selectedIndex });
  })
);

assessmentsRouter.post(
  "/:id/submit",
  validate(idSchema),
  asyncHandler(async (_req, res) => {
    const { id } = getValidated<{ params: { id: string } }>(res).params;
    const userId = userIdFrom(res);
    const attempt = await findOwnedAttempt(id, userId);
    if (!attempt) {
      throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Assessment attempt not found.");
    }
    if (attempt.status !== "in_progress") {
      throw new HttpError(
        409,
        "ATTEMPT_SUBMITTED",
        "This assessment has already been submitted."
      );
    }

    const answersById = new Map(
      attempt.answers.map((answer) => [answer.questionId.toString(), answer])
    );
    const unanswered = attempt.questionIds.filter(
      (questionId) => !answersById.has(questionId.toString())
    );
    if (unanswered.length > 0) {
      throw new HttpError(
        400,
        "UNANSWERED_QUESTIONS",
        "Answer all questions before submitting.",
        unanswered.map((questionId) => ({ questionId: questionId.toString() }))
      );
    }

    const questions = await getAttemptQuestions(attempt.questionIds);
    let score = 0;
    const topicCounts = new Map<QuestionTopic, { correct: number; total: number }>(
      topics.map((topic) => [topic, { correct: 0, total: 0 }])
    );
    const answers = questions.map((question) => {
      const answer = answersById.get(question._id.toString())!;
      const correct = answer.selectedIndex === question.correctIndex;
      if (correct) score += 1;
      const topicCount = topicCounts.get(question.topic)!;
      topicCount.total += 1;
      if (correct) topicCount.correct += 1;
      return {
        questionId: question._id,
        selectedIndex: answer.selectedIndex,
        correct,
      };
    });

    const topicResults = topics.map((topic) => {
      const result = topicCounts.get(topic)!;
      return {
        topic,
        correct: result.correct,
        total: result.total,
        percentage:
          result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0,
      };
    });
    const percentage = Math.round((score / attempt.total) * 100);
    const adaptive = calculateNextDifficulty(score, attempt.total, attempt.difficulty);
    const completedAt = new Date();
    const updated = await Attempt.updateOne(
      { _id: attempt._id, userId, status: "in_progress" },
      {
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
      }
    );
    if (updated.modifiedCount === 0) {
      throw new HttpError(
        409,
        "ATTEMPT_SUBMITTED",
        "This assessment has already been submitted."
      );
    }

    const userUpdate: Record<string, unknown> = { lastActiveAt: completedAt };
    if (attempt.type === "Assessment") userUpdate.currentLevel = adaptive.level;
    await User.updateOne({ _id: userId }, { $set: userUpdate });
    await Notification.create({
      userId,
      title:
        attempt.type === "Assessment" ? "Assessment completed" : "Challenge completed",
      message: `${attempt.type} completed: ${percentage}%`,
    });

    const submittedAttempt = await Attempt.findById(attempt._id);
    res.json({ attempt: await attemptPayload(submittedAttempt!) });
  })
);

assessmentsRouter.get(
  "/history",
  validate(historySchema),
  asyncHandler(async (_req, res) => {
    const userId = userIdFrom(res);
    const { limit, cursor } = getValidated<{
      query: { limit: number; cursor?: string };
    }>(res).query;
    const filter: Record<string, unknown> = { userId };
    if (cursor) filter._id = { $lt: cursor };
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
  })
);

assessmentsRouter.get(
  "/:id",
  validate(idSchema),
  asyncHandler(async (_req, res) => {
    const { id } = getValidated<{ params: { id: string } }>(res).params;
    const attempt = await findOwnedAttempt(id, userIdFrom(res));
    if (!attempt) {
      throw new HttpError(404, "ATTEMPT_NOT_FOUND", "Assessment attempt not found.");
    }
    res.json({ attempt: await attemptPayload(attempt) });
  })
);
