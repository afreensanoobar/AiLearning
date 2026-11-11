import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";

test("lesson completion is idempotent and course progress updates", async (t) => {
  const mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
  process.env.JWT_TTL = "7d";

  const [{ app }, { Lesson }, { User }, { UserProgress }, { seedContent }] =
    await Promise.all([
      import("../src/app.js"),
      import("../src/models/lesson.js"),
      import("../src/models/user.js"),
      import("../src/models/user-progress.js"),
      import("../src/content/seed.js"),
    ]);
  const { connectToDatabase, disconnectFromDatabase } =
    await import("../src/config/database.js");

  t.after(async () => {
    await disconnectFromDatabase();
    await mongo.stop();
  });

  await connectToDatabase();
  await seedContent();

  await request(app).get("/api/progress/courses").expect(401);

  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({
      name: "Progress Reader",
      email: "progress@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);

  const user = await User.findOne({ email: "progress@example.com" });
  assert.ok(user);
  await User.updateOne({ _id: user._id }, { $set: { lastActiveAt: new Date(0) } });

  const initialProgress = await agent.get("/api/progress/courses").expect(200);
  assert.equal(initialProgress.body.courses.length, 12);
  assert.ok(
    initialProgress.body.courses.every(
      (course: { completed: number; percentage: number }) =>
        course.completed === 0 && course.percentage === 0
    )
  );

  const lesson = await Lesson.findOne({ title: "Introduction to HTML" });
  assert.ok(lesson);
  const lessonId = lesson.id;

  await agent.post(`/api/lessons/${lessonId}/complete`).expect(200, {
    completed: true,
  });
  await agent.post(`/api/lessons/${lessonId}/complete`).expect(200, {
    completed: true,
  });

  const progress = await UserProgress.findOne({
    userId: user._id,
    courseId: lesson.courseId,
  });
  assert.ok(progress);
  assert.equal(progress.completedLessonIds.length, 1);
  const updatedUser = await User.findById(user._id);
  assert.ok(updatedUser);
  assert.ok(updatedUser.lastActiveAt.getTime() > 0);

  const updatedProgress = await agent.get("/api/progress/courses").expect(200);
  const htmlProgress = updatedProgress.body.courses.find(
    (course: { slug: string }) => course.slug === "html-fundamentals"
  );
  assert.equal(typeof htmlProgress.title, "string");
  assert.equal(typeof htmlProgress.category, "string");
  assert.deepEqual(
    {
      completed: htmlProgress.completed,
      total: htmlProgress.total,
      percentage: htmlProgress.percentage,
    },
    { completed: 1, total: 5, percentage: 20 }
  );
  await UserProgress.updateOne(
    { userId: user._id, courseId: lesson.courseId },
    { $addToSet: { completedLessonIds: "000000000000000000000001" } }
  );
  const progressWithStaleLesson = await agent.get("/api/progress/courses").expect(200);
  const htmlProgressWithStaleLesson = progressWithStaleLesson.body.courses.find(
    (course: { slug: string }) => course.slug === "html-fundamentals"
  );
  assert.deepEqual(htmlProgressWithStaleLesson.completedLessonIds, [lessonId]);
  assert.equal(htmlProgressWithStaleLesson.completed, 1);

  await agent.delete(`/api/lessons/${lessonId}/complete`).expect(200, {
    completed: false,
  });
  await agent.delete(`/api/lessons/${lessonId}/complete`).expect(200, {
    completed: false,
  });
  const clearedProgress = await agent.get("/api/progress/courses").expect(200);
  assert.equal(
    clearedProgress.body.courses.find(
      (course: { slug: string }) => course.slug === "html-fundamentals"
    ).percentage,
    0
  );

  await agent.post("/api/lessons/000000000000000000000000/complete").expect(404);
});
