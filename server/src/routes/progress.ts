import { Router } from "express";
import { requireAuth } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { Course } from "../models/course.js";
import { Lesson } from "../models/lesson.js";
import { UserProgress } from "../models/user-progress.js";

export const progressRouter = Router();

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
          completed,
          total,
          percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
      }),
    });
  })
);
