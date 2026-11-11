import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";

test("assessments persist answers, hide answer keys until submit, and gate challenge stages", async (t) => {
  const mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
  process.env.JWT_TTL = "7d";

  const [
    { app },
    { Attempt },
    { Notification },
    { Question },
    { User },
    { seedContent },
  ] = await Promise.all([
    import("../src/app.js"),
    import("../src/models/attempt.js"),
    import("../src/models/notification.js"),
    import("../src/models/question.js"),
    import("../src/models/user.js"),
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
      name: "Assessment Student",
      email: "assessment@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);
  await agent.post("/api/assessments/start").send({ mode: "challenge" }).expect(403);

  const started = await agent
    .post("/api/assessments/start")
    .send({ mode: "assessment" })
    .expect(201);
  const attempt = started.body.attempt;
  assert.equal(attempt.status, "in_progress");
  assert.equal(attempt.questions.length, 8);
  assert.ok(
    attempt.questions.every(
      (question: Record<string, unknown>) =>
        !("correctIndex" in question) && !("explanation" in question)
    )
  );
  const resumed = await agent
    .post("/api/assessments/start")
    .send({ mode: "assessment" })
    .expect(200);
  assert.equal(resumed.body.attempt.id, attempt.id);

  const incomplete = await agent
    .post(`/api/assessments/${attempt.id}/submit`)
    .expect(400);
  assert.equal(incomplete.body.error.code, "UNANSWERED_QUESTIONS");
  assert.equal(incomplete.body.error.details.length, attempt.questions.length);

  for (const question of attempt.questions) {
    const storedQuestion = await Question.findById(question.id);
    assert.ok(storedQuestion);
    await agent
      .patch(`/api/assessments/${attempt.id}/answer`)
      .send({ questionId: question.id, selectedIndex: storedQuestion.correctIndex })
      .expect(200);
  }
  const saved = await agent.get(`/api/assessments/${attempt.id}`).expect(200);
  assert.equal(saved.body.attempt.answers.length, attempt.questions.length);
  assert.ok(
    saved.body.attempt.answers.every(
      (answer: { selectedIndex: number }) => answer.selectedIndex >= 0
    )
  );
  assert.ok(
    saved.body.attempt.questions.every(
      (question: Record<string, unknown>) =>
        !("correctIndex" in question) && !("explanation" in question)
    )
  );

  const submitted = await agent.post(`/api/assessments/${attempt.id}/submit`).expect(200);
  assert.equal(submitted.body.attempt.score, attempt.questions.length);
  assert.equal(submitted.body.attempt.percentage, 100);
  assert.equal(submitted.body.attempt.nextLevel, "Intermediate");
  assert.ok(
    submitted.body.attempt.questions.every(
      (question: Record<string, unknown>) => "correctIndex" in question
    )
  );
  assert.ok(
    submitted.body.attempt.questions.every(
      (question: Record<string, unknown>) =>
        "correctAnswer" in question && "explanation" in question
    )
  );
  assert.equal(await Notification.countDocuments(), 1);
  await agent.post(`/api/assessments/${attempt.id}/submit`).expect(409);

  const user = await User.findOne({ email: "assessment@example.com" });
  assert.ok(user);
  await User.updateOne({ _id: user._id }, { $set: { currentLevel: "Advanced" } });
  const advancedQuestions = await Question.find({
    difficulty: "Advanced",
    status: "active",
    challengeStage: null,
  });
  await Attempt.create({
    userId: user._id,
    type: "Assessment",
    difficulty: "Advanced",
    questionIds: advancedQuestions.map((question) => question._id),
    total: advancedQuestions.length,
    score: advancedQuestions.length,
    percentage: 100,
    status: "submitted",
    completedAt: new Date(),
  });

  const challenge = await agent
    .post("/api/assessments/start")
    .send({ mode: "challenge" })
    .expect(201);
  assert.equal(challenge.body.attempt.challengeStage, 1);
  assert.ok(
    challenge.body.attempt.questions.every(
      (question: Record<string, unknown>) =>
        !("correctIndex" in question) && !("explanation" in question)
    )
  );
  for (const question of challenge.body.attempt.questions) {
    const storedQuestion = await Question.findById(question.id);
    assert.ok(storedQuestion);
    await agent
      .patch(`/api/assessments/${challenge.body.attempt.id}/answer`)
      .send({
        questionId: question.id,
        selectedIndex: (storedQuestion.correctIndex + 1) % 4,
      })
      .expect(200);
  }
  const failedChallenge = await agent
    .post(`/api/assessments/${challenge.body.attempt.id}/submit`)
    .expect(200);
  assert.equal(failedChallenge.body.attempt.challengePassed, false);

  const retry = await agent
    .post("/api/assessments/start")
    .send({ mode: "challenge" })
    .expect(201);
  assert.equal(retry.body.attempt.challengeStage, 1);
  for (const question of retry.body.attempt.questions) {
    const storedQuestion = await Question.findById(question.id);
    assert.ok(storedQuestion);
    await agent
      .patch(`/api/assessments/${retry.body.attempt.id}/answer`)
      .send({ questionId: question.id, selectedIndex: storedQuestion.correctIndex })
      .expect(200);
  }
  const passedChallenge = await agent
    .post(`/api/assessments/${retry.body.attempt.id}/submit`)
    .expect(200);
  assert.equal(passedChallenge.body.attempt.challengePassed, true);
  assert.equal(passedChallenge.body.attempt.nextStage, 2);

  const stageTwo = await agent
    .post("/api/assessments/start")
    .send({ mode: "challenge" })
    .expect(201);
  assert.equal(stageTwo.body.attempt.challengeStage, 2);

  const history = await agent.get("/api/assessments/history?limit=2").expect(200);
  assert.equal(history.body.attempts.length, 2);
  assert.ok(history.body.nextCursor);
  const secondAgent = request.agent(app);
  await secondAgent
    .post("/api/auth/register")
    .send({
      name: "Other Student",
      email: "other@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);
  await secondAgent.get(`/api/assessments/${attempt.id}`).expect(404);
  await request(app)
    .post("/api/assessments/start")
    .send({ mode: "assessment" })
    .expect(401);
});
