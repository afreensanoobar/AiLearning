import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireAuth } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Lesson } from "../models/lesson.js";

const lessonIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) }),
});

function getLessonId(res: { locals: Record<string, unknown> }) {
  return (res.locals.validated as { params: { id: string } }).params.id;
}

export const lessonsRouter = Router();

lessonsRouter.use(requireAuth);

lessonsRouter.get(
  "/:id",
  validate(lessonIdSchema),
  asyncHandler(async (_req, res) => {
    const lesson = await Lesson.findById(new Types.ObjectId(getLessonId(res))).lean();
    if (!lesson) {
      throw new HttpError(404, "LESSON_NOT_FOUND", "Lesson not found.");
    }
    res.json({ lesson });
  })
);
