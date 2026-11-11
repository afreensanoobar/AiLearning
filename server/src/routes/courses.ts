import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Course } from "../models/course.js";
import { Lesson } from "../models/lesson.js";
import { requireAuth } from "../auth/require-auth.js";

const slugSchema = z.object({
  params: z.object({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) }),
});

function getSlug(res: { locals: Record<string, unknown> }) {
  return (res.locals.validated as { params: { slug: string } }).params.slug;
}

export const coursesRouter = Router();

coursesRouter.use(requireAuth);

coursesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const results = await Course.find().sort({ order: 1 }).lean();
    res.json({ courses: results });
  })
);

coursesRouter.get(
  "/:slug",
  validate(slugSchema),
  asyncHandler(async (_req, res) => {
    const course = await Course.findOne({ slug: getSlug(res) }).lean();
    if (!course) {
      throw new HttpError(404, "COURSE_NOT_FOUND", "Course not found.");
    }
    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 }).lean();
    res.json({ course, lessons });
  })
);
