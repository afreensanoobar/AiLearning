import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/require-auth.js";
import { generateRecommendations } from "../assessments/engines.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { AiStudyPlanCache } from "../models/ai-study-plan.js";
import type { StudyPlan } from "../models/ai-study-plan.js";
import { Attempt } from "../models/attempt.js";
import { Course } from "../models/course.js";
import { Lesson } from "../models/lesson.js";
import { User } from "../models/user.js";
import type { QuestionTopic } from "../models/question.js";
import { UserActivity } from "../models/user-activity.js";
import { UserProgress } from "../models/user-progress.js";
import { generateLearningPath } from "../progress/engines.js";
import { calculateStreak, getLocalDateKey } from "../progress/streak.js";
import { ai } from "../services/ai/gateway.js";
import type { AiRequest } from "../services/ai/provider.js";
import { studyPlanPrompt } from "../services/ai/prompts.js";
import { createAiRateLimit } from "../services/ai/rate-limit.js";
import { generateValidatedJson } from "../services/ai/validated-json.js";

const topics: QuestionTopic[] = ["HTML", "CSS", "JavaScript", "React"];
const studyPlanSchema = z.object({
  summary: z.string().trim().min(1),
  weeklyPlan: z
    .array(
      z.object({
        day: z.string().trim().min(1),
        focusTopic: z.enum(["HTML", "CSS", "JavaScript", "React"]),
        tasks: z.array(z.string().trim().min(1)).min(1),
        minutes: z.number().int().min(1).max(60),
      })
    )
    .length(7),
  tips: z.array(z.string().trim().min(1)).min(1),
});

function getRecentTopicResults(
  attempts: Array<{
    topicResults: Array<{ topic: QuestionTopic; correct: number; total: number }>;
  }>
) {
  const totals = new Map(topics.map((topic) => [topic, { correct: 0, total: 0 }]));
  for (const attempt of attempts) {
    for (const result of attempt.topicResults) {
      const current = totals.get(result.topic);
      if (current) {
        current.correct += result.correct;
        current.total += result.total;
      }
    }
  }
  return topics.map((topic) => {
    const result = totals.get(topic)!;
    return {
      topic,
      correct: result.correct,
      total: result.total,
      percentage:
        result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0,
    };
  });
}

async function getTopicResults(userId: string) {
  const attempts = await Attempt.find({ userId, status: "submitted" })
    .select("topicResults")
    .lean();
  const totals = new Map(topics.map((topic) => [topic, { correct: 0, total: 0 }]));
  for (const attempt of attempts) {
    for (const result of attempt.topicResults) {
      const current = totals.get(result.topic);
      if (current) {
        current.correct += result.correct;
        current.total += result.total;
      }
    }
  }
  return topics.map((topic) => {
    const result = totals.get(topic)!;
    return {
      topic,
      correct: result.correct,
      total: result.total,
      percentage:
        result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0,
    };
  });
}

export function createProgressRouter(
  gateway: {
    generate(feature: string, request: AiRequest): Promise<{ text: string }>;
  } = ai
) {
  const progressRouter = Router();
  progressRouter.use(requireAuth);

  progressRouter.get(
    "/courses",
    asyncHandler(async (_req, res) => {
      const userId = res.locals.auth?.userId;
      const [courses, lessons, progress] = await Promise.all([
        Course.find().sort({ order: 1 }).lean(),
        Lesson.find().select("courseId").lean(),
        UserProgress.find({ userId }).lean(),
      ]);

      const totals = new Map<string, number>();
      for (const lesson of lessons) {
        const courseId = lesson.courseId.toString();
        totals.set(courseId, (totals.get(courseId) ?? 0) + 1);
      }

      const completedByCourse = new Map(
        progress.map((item) => [item.courseId.toString(), item.completedLessonIds.length])
      );

      res.json({
        courses: courses.map((course) => {
          const total = totals.get(course._id.toString()) ?? 0;
          const completed = completedByCourse.get(course._id.toString()) ?? 0;
          return {
            courseId: course._id,
            slug: course.slug,
            completedLessonIds:
              progress
                .find((item) => item.courseId.toString() === course._id.toString())
                ?.completedLessonIds.map((id) => id.toString()) ?? [],
            completed,
            total,
            percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
          };
        }),
      });
    })
  );

  progressRouter.get(
    "/summary",
    asyncHandler(async (_req, res) => {
      const userId = res.locals.auth!.userId;
      const [user, courseCount, progress, attempts, activities] = await Promise.all([
        User.findById(userId).select("currentLevel timezone"),
        Course.countDocuments(),
        UserProgress.find({ userId }).select("completedLessonIds").lean(),
        Attempt.find({ userId, status: "submitted" })
          .select("type percentage completedAt")
          .lean(),
        UserActivity.find({ userId }).select("occurredAt").lean(),
      ]);
      if (!user) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
      }

      const completedAt = attempts.flatMap((attempt) =>
        attempt.completedAt ? [attempt.completedAt] : []
      );
      const activityDates = [
        ...completedAt,
        ...activities.map((activity) => activity.occurredAt),
      ];
      const today = getLocalDateKey(new Date(), user.timezone);
      const todayAssessments = attempts.filter(
        (attempt) =>
          attempt.type === "Assessment" &&
          attempt.completedAt &&
          getLocalDateKey(attempt.completedAt, user.timezone) === today
      ).length;
      const averageScore =
        attempts.length > 0
          ? Math.round(
              attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
                attempts.length
            )
          : 0;

      res.json({
        enrolledCourses: courseCount,
        completedLessons: progress.reduce(
          (sum, item) => sum + item.completedLessonIds.length,
          0
        ),
        averageScore,
        streak: calculateStreak(activityDates, user.timezone),
        todayAssessments,
        dailyGoal: 3,
        currentLevel: user.currentLevel,
      });
    })
  );

  progressRouter.get(
    "/topics",
    asyncHandler(async (_req, res) => {
      res.json({ topics: await getTopicResults(res.locals.auth!.userId) });
    })
  );

  progressRouter.get(
    "/recommendations",
    asyncHandler(async (_req, res) => {
      const topicResults = await getTopicResults(res.locals.auth!.userId);
      res.json({ recommendations: generateRecommendations(topicResults) });
    })
  );

  progressRouter.get(
    "/path",
    asyncHandler(async (_req, res) => {
      const topicResults = await getTopicResults(res.locals.auth!.userId);
      res.json({ path: generateLearningPath(topicResults) });
    })
  );

  progressRouter.get(
    "/trend",
    asyncHandler(async (_req, res) => {
      const attempts = await Attempt.find({
        userId: res.locals.auth!.userId,
        status: "submitted",
      })
        .select("type score total percentage completedAt")
        .sort({ completedAt: 1 })
        .lean();
      res.json({
        trend: attempts.map((attempt) => ({
          type: attempt.type,
          score: attempt.score,
          total: attempt.total,
          percentage: attempt.percentage,
          completedAt: attempt.completedAt,
        })),
      });
    })
  );

  progressRouter.post(
    "/ai-plan",
    createAiRateLimit(5),
    asyncHandler(async (_req, res) => {
      const userId = res.locals.auth!.userId;
      const cached = await AiStudyPlanCache.findOne({ userId }).lean();
      if (cached) {
        return res.json({ plan: cached.plan, cached: true });
      }

      const [user, attempts] = await Promise.all([
        User.findById(userId).select("currentLevel"),
        Attempt.find({ userId, status: "submitted" })
          .select("type difficulty percentage completedAt topicResults")
          .sort({ completedAt: -1 })
          .limit(5)
          .lean(),
      ]);
      if (!user) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
      }

      const recentTopics = getRecentTopicResults(attempts);
      const plan = await generateValidatedJson<StudyPlan>(
        gateway,
        "study-plan",
        {
          system: studyPlanPrompt({
            level: user.currentLevel,
            topicStats: JSON.stringify(recentTopics),
            recentAttempts: JSON.stringify(
              attempts.map(({ type, difficulty, percentage, completedAt }) => ({
                type,
                difficulty,
                percentage,
                completedAt,
              }))
            ),
          }),
          messages: [{ role: "user", content: "Create my personalized study plan." }],
          maxTokens: 1600,
          temperature: 0.3,
          json: true,
        },
        studyPlanSchema
      );
      await AiStudyPlanCache.findOneAndUpdate(
        { userId },
        { $set: { plan } },
        { upsert: true, returnDocument: "after" }
      );
      res.json({ plan, cached: false });
    })
  );

  return progressRouter;
}

export const progressRouter = createProgressRouter();
