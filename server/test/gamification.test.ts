import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";

test("notifications, badges, streaks, and leaderboard respect ownership and privacy", async (t) => {
  const mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
  process.env.JWT_TTL = "7d";

  const [
    { app },
    { Attempt },
    { Course },
    { Lesson },
    { Notification },
    { User },
    { UserActivity },
    { UserBadge },
    { connectToDatabase, disconnectFromDatabase },
    { recordStreakMilestones },
    { seedContent },
  ] = await Promise.all([
    import("../src/app.js"),
    import("../src/models/attempt.js"),
    import("../src/models/course.js"),
    import("../src/models/lesson.js"),
    import("../src/models/notification.js"),
    import("../src/models/user.js"),
    import("../src/models/user-activity.js"),
    import("../src/models/user-badge.js"),
    import("../src/config/database.js"),
    import("../src/services/gamification.js"),
    import("../src/content/seed.js"),
  ]);

  t.after(async () => {
    await disconnectFromDatabase();
    await mongo.stop();
  });

  await connectToDatabase();
  await seedContent();
  const student = request.agent(app);
  const privateStudent = request.agent(app);
  const registration = await student
    .post("/api/auth/register")
    .send({
      name: "Visible Learner",
      email: "visible@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);
  const privateRegistration = await privateStudent
    .post("/api/auth/register")
    .send({
      name: "Hidden Learner",
      email: "hidden@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);
  const user = await User.findById(registration.body.user.id);
  const hiddenUser = await User.findById(privateRegistration.body.user.id);
  const course = await Course.findOne({ slug: "html-fundamentals" });
  const lesson = await Lesson.findOne({ courseId: course?._id });
  assert.ok(user && hiddenUser && course && lesson);

  await privateStudent
    .patch("/api/users/me")
    .send({ showOnLeaderboard: false })
    .expect(200);
  const profile = await student.get("/api/users/me").expect(200);
  assert.equal(profile.body.user.showOnLeaderboard, true);

  await student.post(`/api/lessons/${lesson.id}/complete`).expect(200);
  await student.post(`/api/lessons/${lesson.id}/complete`).expect(200);
  assert.equal(
    await UserBadge.countDocuments({ userId: user._id, badgeKey: "first-lesson" }),
    1
  );
  await Attempt.create({
    userId: user._id,
    type: "Assessment",
    difficulty: "Beginner",
    status: "submitted",
    questionIds: [],
    score: 8,
    total: 10,
    percentage: 80,
    completedAt: new Date(),
  });
  await Attempt.create({
    userId: hiddenUser._id,
    type: "Assessment",
    difficulty: "Beginner",
    status: "submitted",
    questionIds: [],
    score: 10,
    total: 10,
    percentage: 100,
    completedAt: new Date(),
  });

  const leaderboard = await student.get("/api/leaderboard").expect(200);
  assert.deepEqual(leaderboard.body.leaderboard, [
    { rank: 1, displayName: "Visible Learner", points: 90 },
  ]);
  assert.deepEqual(Object.keys(leaderboard.body.leaderboard[0]).sort(), [
    "displayName",
    "points",
    "rank",
  ]);
  assert.equal(
    JSON.stringify(leaderboard.body.leaderboard).includes("visible@example.com"),
    false
  );

  const first = await Notification.create({
    userId: user._id,
    title: "First",
    message: "First notification",
  });
  await Notification.create({
    userId: user._id,
    title: "Second",
    message: "Second notification",
  });
  const inbox = await student.get("/api/notifications").expect(200);
  assert.equal(inbox.body.unreadCount, 2);
  assert.equal(inbox.body.notifications.length, 2);
  await student.patch(`/api/notifications/${first.id}/read`).expect(200);
  const forbiddenRead = await privateStudent
    .patch(`/api/notifications/${first.id}/read`)
    .expect(404);
  assert.equal(forbiddenRead.body.error.code, "NOTIFICATION_NOT_FOUND");
  await student.post("/api/notifications/read-all").expect(200);
  const clearedInbox = await student.get("/api/notifications").expect(200);
  assert.equal(clearedInbox.body.unreadCount, 0);
  assert.ok(
    clearedInbox.body.notifications.every((item: { read: boolean }) => item.read)
  );
  await request(app).get("/api/notifications").expect(401);

  const now = new Date();
  const streakActivities = Array.from({ length: 3 }, (_, index) => ({
    userId: user._id,
    lessonId: lesson._id,
    occurredAt: new Date(now.getTime() - index * 86_400_000),
  }));
  await UserActivity.insertMany(streakActivities);
  await recordStreakMilestones(user.id, now);
  await recordStreakMilestones(user.id, now);
  assert.equal(
    await Notification.countDocuments({
      userId: user._id,
      eventKey: "streak-3",
    }),
    1
  );
  await UserActivity.insertMany(
    Array.from({ length: 4 }, (_, index) => ({
      userId: user._id,
      lessonId: lesson._id,
      occurredAt: new Date(now.getTime() - (index + 3) * 86_400_000),
    }))
  );
  await recordStreakMilestones(user.id, now);
  assert.equal(
    await Notification.countDocuments({
      userId: user._id,
      eventKey: "streak-7",
    }),
    1
  );
  await UserActivity.insertMany(
    Array.from({ length: 23 }, (_, index) => ({
      userId: user._id,
      lessonId: lesson._id,
      occurredAt: new Date(now.getTime() - (index + 7) * 86_400_000),
    }))
  );
  await recordStreakMilestones(user.id, now);
  assert.equal(
    await Notification.countDocuments({
      userId: user._id,
      eventKey: "streak-30",
    }),
    1
  );
  assert.equal(
    await UserBadge.countDocuments({
      userId: user._id,
      badgeKey: "seven-day-streak",
    }),
    1
  );
  const badges = await student.get("/api/badges").expect(200);
  assert.equal(
    badges.body.badges.find((badge: { key: string }) => badge.key === "first-lesson")
      .name,
    "First Lesson"
  );
  assert.ok(
    badges.body.badges.find((badge: { key: string }) => badge.key === "first-lesson")
      .awardedAt
  );
});
