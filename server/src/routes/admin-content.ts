import type { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { Course } from "../models/course.js";
import { Lesson } from "../models/lesson.js";
import { UserProgress } from "../models/user-progress.js";
import {
  documentId,
  getValidated,
  idParams,
  isDuplicateKeyError,
  notFound,
  objectId,
  slugPattern,
} from "./admin-helpers.js";

const uiSchema = z.object({
  color: z.string().trim().min(1).max(100),
  bg: z.string().trim().min(1).max(100),
  icon: z.string().trim().min(1).max(20),
  iconColor: z.string().trim().min(1).max(100),
});

const courseBody = z.object({
  slug: z.string().trim().toLowerCase().regex(slugPattern),
  title: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  order: z.number().int().min(0),
  ui: uiSchema,
});

const createCourseSchema = z.object({ body: courseBody });
const updateCourseSchema = z.object({
  params: z.object({ id: objectId }),
  body: courseBody.partial().refine((body) => Object.keys(body).length > 0, {
    message: "At least one course field must be provided.",
  }),
});

const createLessonSchema = z.object({
  body: z.object({
    courseId: objectId,
    title: z.string().trim().min(1).max(160),
    content: z.string().trim().min(1),
    estimatedMinutes: z.number().int().min(1).max(240),
    order: z.number().int().min(0).optional(),
  }),
});

const updateLessonSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      title: z.string().trim().min(1).max(160).optional(),
      content: z.string().trim().min(1).optional(),
      estimatedMinutes: z.number().int().min(1).max(240).optional(),
      order: z.number().int().min(0).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one lesson field must be provided.",
    }),
});

const reorderSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ lessonIds: z.array(objectId).min(1) }),
});

function serializeCourse(course: {
  id?: string;
  _id?: { toString(): string };
  slug: string;
  title: string;
  category: string;
  order: number;
  ui: { color: string; bg: string; icon: string; iconColor: string };
}) {
  return {
    id: documentId(course),
    slug: course.slug,
    title: course.title,
    category: course.category,
    order: course.order,
    ui: course.ui,
  };
}

function serializeLesson(lesson: {
  id?: string;
  _id?: { toString(): string };
  courseId: { toString(): string };
  title: string;
  order: number;
  content: string;
  estimatedMinutes: number;
}) {
  return {
    id: documentId(lesson),
    courseId: lesson.courseId.toString(),
    title: lesson.title,
    order: lesson.order,
    content: lesson.content,
    estimatedMinutes: lesson.estimatedMinutes,
  };
}

export function registerAdminContentRoutes(router: Router) {
  router.get(
    "/courses",
    asyncHandler(async (_req, res) => {
      const courses = await Course.find().sort({ order: 1 });
      const counts = await Lesson.aggregate<{ _id: unknown; count: number }>([
        { $group: { _id: "$courseId", count: { $sum: 1 } } },
      ]);
      const countByCourse = new Map(
        counts.map((row) => [row._id?.toString(), row.count])
      );
      res.json({
        courses: courses.map((course) => ({
          ...serializeCourse(course),
          lessonCount: countByCourse.get(course.id) ?? 0,
        })),
      });
    })
  );

  router.get(
    "/courses/:id",
    validate(idParams),
    asyncHandler(async (_req, res) => {
      const { id } = getValidated<{ params: { id: string } }>(res).params;
      const course = await Course.findById(id);
      if (!course) notFound("COURSE_NOT_FOUND", "Course not found.");
      const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });
      res.json({
        course: serializeCourse(course),
        lessons: lessons.map(serializeLesson),
      });
    })
  );

  router.post(
    "/courses",
    validate(createCourseSchema),
    asyncHandler(async (_req, res) => {
      const body = getValidated<{ body: z.infer<typeof courseBody> }>(res).body;
      try {
        const course = await Course.create(body);
        res.status(201).json({ course: serializeCourse(course) });
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new HttpError(409, "SLUG_IN_USE", "A course with this slug already exists.");
        }
        throw error;
      }
    })
  );

  router.patch(
    "/courses/:id",
    validate(updateCourseSchema),
    asyncHandler(async (_req, res) => {
      const { params, body } = getValidated<{
        params: { id: string };
        body: Partial<z.infer<typeof courseBody>>;
      }>(res);
      try {
        const course = await Course.findByIdAndUpdate(
          params.id,
          { $set: body },
          { returnDocument: "after", runValidators: true }
        );
        if (!course) notFound("COURSE_NOT_FOUND", "Course not found.");
        res.json({ course: serializeCourse(course) });
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new HttpError(409, "SLUG_IN_USE", "A course with this slug already exists.");
        }
        throw error;
      }
    })
  );

  router.delete(
    "/courses/:id",
    validate(idParams),
    asyncHandler(async (_req, res) => {
      const { id } = getValidated<{ params: { id: string } }>(res).params;
      const course = await Course.findById(id);
      if (!course) notFound("COURSE_NOT_FOUND", "Course not found.");
      await Lesson.deleteMany({ courseId: course._id });
      await UserProgress.deleteMany({ courseId: course._id });
      await course.deleteOne();
      res.status(204).end();
    })
  );

  router.post(
    "/courses/:id/lessons/reorder",
    validate(reorderSchema),
    asyncHandler(async (_req, res) => {
      const { params, body } = getValidated<{
        params: { id: string };
        body: { lessonIds: string[] };
      }>(res);
      const course = await Course.findById(params.id);
      if (!course) notFound("COURSE_NOT_FOUND", "Course not found.");
      const lessons = await Lesson.find({ courseId: course._id });
      if (
        lessons.length !== body.lessonIds.length ||
        new Set(body.lessonIds).size !== body.lessonIds.length ||
        !lessons.every((lesson) => body.lessonIds.includes(lesson.id))
      ) {
        throw new HttpError(
          400,
          "INVALID_LESSON_ORDER",
          "Lesson order must include each lesson in the course exactly once."
        );
      }

      const offset = 10_000;
      for (const [index, lessonId] of body.lessonIds.entries()) {
        await Lesson.updateOne({ _id: lessonId }, { $set: { order: offset + index } });
      }
      for (const [index, lessonId] of body.lessonIds.entries()) {
        await Lesson.updateOne({ _id: lessonId }, { $set: { order: index } });
      }
      const updated = await Lesson.find({ courseId: course._id }).sort({ order: 1 });
      res.json({ lessons: updated.map(serializeLesson) });
    })
  );

  router.post(
    "/lessons",
    validate(createLessonSchema),
    asyncHandler(async (_req, res) => {
      const body = getValidated<{
        body: {
          courseId: string;
          title: string;
          content: string;
          estimatedMinutes: number;
          order?: number;
        };
      }>(res).body;
      const course = await Course.findById(body.courseId);
      if (!course) notFound("COURSE_NOT_FOUND", "Course not found.");
      const last = await Lesson.findOne({ courseId: course._id }).sort({ order: -1 });
      const order = body.order ?? (last ? last.order + 1 : 0);
      try {
        const lesson = await Lesson.create({
          courseId: course._id,
          title: body.title,
          content: body.content,
          estimatedMinutes: body.estimatedMinutes,
          order,
        });
        res.status(201).json({ lesson: serializeLesson(lesson) });
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new HttpError(
            409,
            "LESSON_ORDER_IN_USE",
            "A lesson already exists at this order in the course."
          );
        }
        throw error;
      }
    })
  );

  router.patch(
    "/lessons/:id",
    validate(updateLessonSchema),
    asyncHandler(async (_req, res) => {
      const { params, body } = getValidated<{
        params: { id: string };
        body: {
          title?: string;
          content?: string;
          estimatedMinutes?: number;
          order?: number;
        };
      }>(res);
      try {
        const lesson = await Lesson.findByIdAndUpdate(
          params.id,
          { $set: body },
          { returnDocument: "after", runValidators: true }
        );
        if (!lesson) notFound("LESSON_NOT_FOUND", "Lesson not found.");
        res.json({ lesson: serializeLesson(lesson) });
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new HttpError(
            409,
            "LESSON_ORDER_IN_USE",
            "A lesson already exists at this order in the course."
          );
        }
        throw error;
      }
    })
  );

  router.delete(
    "/lessons/:id",
    validate(idParams),
    asyncHandler(async (_req, res) => {
      const { id } = getValidated<{ params: { id: string } }>(res).params;
      const lesson = await Lesson.findById(id);
      if (!lesson) notFound("LESSON_NOT_FOUND", "Lesson not found.");
      await lesson.deleteOne();
      res.status(204).end();
    })
  );
}
