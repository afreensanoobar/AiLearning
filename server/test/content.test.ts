import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";

test("content seed is idempotent and authenticated read endpoints return content only", async (t) => {
  const mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
  process.env.JWT_TTL = "7d";

  const [{ app }, { Course }, { Lesson }, { Question }, { seedContent }] =
    await Promise.all([
      import("../src/app.js"),
      import("../src/models/course.js"),
      import("../src/models/lesson.js"),
      import("../src/models/question.js"),
      import("../src/content/seed.js"),
    ]);
  const { connectToDatabase, disconnectFromDatabase } =
    await import("../src/config/database.js");

  t.after(async () => {
    await disconnectFromDatabase();
    await mongo.stop();
  });

  await connectToDatabase();
  assert.deepEqual(await seedContent(), { courses: 12, lessons: 60, questions: 28 });
  assert.deepEqual(await seedContent(), { courses: 12, lessons: 60, questions: 28 });
  assert.equal(await Course.countDocuments(), 12);
  assert.equal(await Lesson.countDocuments(), 60);
  assert.equal(await Question.countDocuments(), 28);
  assert.equal(await Question.countDocuments({ challengeStage: null }), 16);
  assert.equal(await Question.countDocuments({ challengeStage: { $ne: null } }), 12);

  const seededQuestions = await Question.find().lean();
  assert.ok(
    seededQuestions.every(
      (question) =>
        question.options.length === 4 &&
        new Set(question.options).size === 4 &&
        question.explanation.length > 0 &&
        question.correctIndex >= 0 &&
        question.correctIndex <= 3
    )
  );

  await request(app).get("/api/courses").expect(401);
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({
      name: "Content Reader",
      email: "reader@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);

  const courseList = await agent.get("/api/courses").expect(200);
  assert.equal(courseList.body.courses.length, 12);
  assert.deepEqual(
    courseList.body.courses.map((course: { title: string }) => course.title),
    [
      "HTML Fundamentals",
      "CSS Fundamentals",
      "JavaScript",
      "React Development",
      "TypeScript Essentials",
      "Node.js & Express APIs",
      "Python Programming",
      "SQL & Databases",
      "Data Analytics with Python",
      "Generative AI Foundations",
      "Git & GitHub",
      "UI/UX Design Foundations",
    ]
  );
  assert.equal(courseList.body.courses[0].level, "Beginner");
  assert.equal(courseList.body.courses[0].lessonCount, 5);
  assert.ok(courseList.body.courses.some(
    (course: { category: string }) => course.category === "AI & Machine Learning"
  ));
  assert.equal("correctIndex" in courseList.body, false);

  const courseDetail = await agent.get("/api/courses/html-fundamentals").expect(200);
  assert.equal(courseDetail.body.lessons.length, 5);
  assert.match(courseDetail.body.lessons[0].content, /```html/);
  assert.equal("correctIndex" in courseDetail.body, false);

  const lessonId = courseDetail.body.lessons[0]._id as string;
  const lesson = await agent.get(`/api/lessons/${lessonId}`).expect(200);
  assert.equal(lesson.body.lesson.title, "Introduction to HTML");
  assert.equal(lesson.body.lesson.estimatedMinutes, 10);
  assert.equal("correctIndex" in lesson.body, false);

  await agent.get("/api/courses/Not_a_course").expect(400);
  await agent.get("/api/courses/not-a-course").expect(404);
  await agent.get("/api/courses/unknown-course").expect(404);
  await agent.get("/api/lessons/not-an-object-id").expect(400);
  await agent.get("/api/lessons/000000000000000000000000").expect(404);
  await request(app).get(`/api/lessons/${lessonId}`).expect(401);
});
