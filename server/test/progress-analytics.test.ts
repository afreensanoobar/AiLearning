import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";

test("progress analytics summarize attempts, lesson activity, and topic performance", async (t) => {
  const mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
  process.env.JWT_TTL = "7d";

  const [{ app }, { Attempt }, { Lesson }, { User }, { UserActivity }, { seedContent }] =
    await Promise.all([
      import("../src/app.js"),
      import("../src/models/attempt.js"),
      import("../src/models/lesson.js"),
      import("../src/models/user.js"),
      import("../src/models/user-activity.js"),
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
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .send({
      name: "Analytics Student",
      email: "analytics@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);
  await agent
    .patch("/api/users/me")
    .send({ timezone: "America/Los_Angeles" })
    .expect(200);
  await agent
    .patch("/api/users/me")
    .send({ timezone: "Mars/Not_A_Timezone" })
    .expect(400);

  const user = await User.findOne({ email: "analytics@example.com" });
  assert.ok(user);
  const lesson = await Lesson.findOne({ title: "Introduction to HTML" });
  assert.ok(lesson);
  await agent.post(`/api/lessons/${lesson.id}/complete`).expect(200);
  await agent.post(`/api/lessons/${lesson.id}/complete`).expect(200);
  assert.equal(await UserActivity.countDocuments({ userId: user._id }), 1);

  const now = new Date();
  await Attempt.create([
    {
      userId: user._id,
      type: "Assessment",
      difficulty: "Beginner",
      status: "submitted",
      questionIds: [],
      total: 5,
      score: 4,
      percentage: 80,
      completedAt: now,
      topicResults: [
        { topic: "HTML", correct: 3, total: 4, percentage: 75 },
        { topic: "CSS", correct: 1, total: 2, percentage: 50 },
        { topic: "JavaScript", correct: 0, total: 0, percentage: 0 },
        { topic: "React", correct: 0, total: 0, percentage: 0 },
      ],
    },
    {
      userId: user._id,
      type: "Advanced Challenge",
      difficulty: "Advanced",
      challengeStage: 1,
      status: "submitted",
      questionIds: [],
      total: 5,
      score: 3,
      percentage: 60,
      completedAt: new Date(now.getTime() - 60_000),
      topicResults: [
        { topic: "HTML", correct: 2, total: 4, percentage: 50 },
        { topic: "CSS", correct: 1, total: 3, percentage: 33 },
        { topic: "JavaScript", correct: 0, total: 0, percentage: 0 },
        { topic: "React", correct: 0, total: 0, percentage: 0 },
      ],
    },
  ]);

  const summary = await agent.get("/api/progress/summary").expect(200);
  assert.deepEqual(
    {
      enrolledCourses: summary.body.enrolledCourses,
      completedLessons: summary.body.completedLessons,
      averageScore: summary.body.averageScore,
      todayAssessments: summary.body.todayAssessments,
      dailyGoal: summary.body.dailyGoal,
      currentLevel: summary.body.currentLevel,
    },
    {
      enrolledCourses: 4,
      completedLessons: 1,
      averageScore: 70,
      todayAssessments: 1,
      dailyGoal: 3,
      currentLevel: "Beginner",
    }
  );
  assert.ok(summary.body.streak >= 1);

  const topicResponse = await agent.get("/api/progress/topics").expect(200);
  const html = topicResponse.body.topics.find(
    (topic: { topic: string }) => topic.topic === "HTML"
  );
  assert.deepEqual(
    { correct: html.correct, total: html.total, percentage: html.percentage },
    { correct: 5, total: 8, percentage: 63 }
  );
  const recommendations = await agent.get("/api/progress/recommendations").expect(200);
  assert.equal(recommendations.body.recommendations.length, 4);
  const path = await agent.get("/api/progress/path").expect(200);
  assert.deepEqual(
    path.body.path.map((item: { step: number }) => item.step),
    [1, 2]
  );
  const trend = await agent.get("/api/progress/trend").expect(200);
  assert.equal(trend.body.trend.length, 2);
  assert.ok(
    new Date(trend.body.trend[0].completedAt) <= new Date(trend.body.trend[1].completedAt)
  );
});
