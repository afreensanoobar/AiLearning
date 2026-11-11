import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";
import { Types } from "mongoose";

test("user profile and clear progress endpoints use authenticated user data", async (t) => {
  const mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
  process.env.JWT_TTL = "7d";

  const [
    { app },
    { AiStudyPlanCache },
    { Attempt },
    { ChatSession },
    { Lesson },
    { Notification },
    { User },
    { UserActivity },
    { UserBadge },
    { UserProgress },
    { Course },
    { seedContent },
    { connectToDatabase, disconnectFromDatabase },
  ] = await Promise.all([
    import("../src/app.js"),
    import("../src/models/ai-study-plan.js"),
    import("../src/models/attempt.js"),
    import("../src/models/chat-session.js"),
    import("../src/models/lesson.js"),
    import("../src/models/notification.js"),
    import("../src/models/user.js"),
    import("../src/models/user-activity.js"),
    import("../src/models/user-badge.js"),
    import("../src/models/user-progress.js"),
    import("../src/models/course.js"),
    import("../src/content/seed.js"),
    import("../src/config/database.js"),
  ]);

  t.after(async () => {
    await disconnectFromDatabase();
    await mongo.stop();
  });

  await connectToDatabase();
  await seedContent();
  const agent = request.agent(app);
  const registration = await agent
    .post("/api/auth/register")
    .send({
      name: "Progress Student",
      email: "progress@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);
  const user = await User.findById(registration.body.user.id);
  const course = await Course.findOne({ slug: "html-fundamentals" });
  const lesson = await Lesson.findOne({ courseId: course?._id });
  assert.ok(user && course && lesson);

  const profile = await agent.get("/api/users/me").expect(200);
  assert.equal(profile.body.user.id, user.id);
  assert.equal("passwordHash" in profile.body.user, false);

  await Promise.all([
    Attempt.create({
      userId: user._id,
      type: "Assessment",
      difficulty: "Beginner",
      status: "in_progress",
      questionIds: [new Types.ObjectId()],
      total: 1,
    }),
    UserProgress.create({
      userId: user._id,
      courseId: course._id,
      completedLessonIds: [lesson._id],
    }),
    ChatSession.create({
      userId: user._id,
      title: "Test chat",
      levelAtCreation: "Beginner",
      messages: [],
    }),
    UserActivity.create({ userId: user._id, lessonId: lesson._id }),
    Notification.create({
      userId: user._id,
      title: "Test",
      message: "Test notification",
    }),
    UserBadge.create({ userId: user._id, badgeKey: "first-lesson" }),
    AiStudyPlanCache.create({
      userId: user._id,
      plan: {
        summary: "A plan",
        weeklyPlan: [
          {
            day: "Monday",
            focusTopic: "HTML",
            tasks: ["Review"],
            minutes: 10,
          },
        ],
        tips: ["Keep practicing"],
      },
    }),
  ]);

  await agent.delete("/api/users/me/progress").expect(200);
  assert.equal(await Attempt.countDocuments({ userId: user._id }), 0);
  assert.equal(await UserProgress.countDocuments({ userId: user._id }), 0);
  assert.equal(await ChatSession.countDocuments({ userId: user._id }), 0);
  assert.equal(await UserActivity.countDocuments({ userId: user._id }), 0);
  assert.equal(await AiStudyPlanCache.countDocuments({ userId: user._id }), 0);
  assert.equal(await Notification.countDocuments({ userId: user._id }), 0);
  assert.equal(await UserBadge.countDocuments({ userId: user._id }), 0);
});
