import assert from "node:assert/strict";
import cookieParser from "cookie-parser";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";
import { errorHandler } from "../src/middleware/error-handler.js";
import { notFoundHandler } from "../src/middleware/not-found.js";

test("tutor streams, personalizes, falls back by level, and enforces session ownership", async (t) => {
  const mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
  process.env.JWT_TTL = "7d";
  process.env.AI_PROVIDER = "gemini";
  process.env.AI_API_KEY = "";

  const [
    { authRouter },
    { createTutorRouter },
    { Attempt },
    { ChatSession },
    { Lesson },
    { Question },
    { connectToDatabase, disconnectFromDatabase },
    { generateTutorResponse },
    { seedContent },
  ] = await Promise.all([
    import("../src/routes/auth.js"),
    import("../src/routes/tutor.js"),
    import("../src/models/attempt.js"),
    import("../src/models/chat-session.js"),
    import("../src/models/lesson.js"),
    import("../src/models/question.js"),
    import("../src/config/database.js"),
    import("../src/services/ruleTutor.js"),
    import("../src/content/seed.js"),
  ]);
  const aiRequests: Array<{ system: string; messages: Array<{ content: string }> }> = [];
  let cancelledStream: Promise<void> | undefined;
  const mockGateway = {
    async generate(
      _feature: string,
      input: {
        system: string;
        messages: Array<{ content: string }>;
      }
    ) {
      aiRequests.push(input);
      return { text: "Lesson-specific tutor reply." };
    },
    async *stream(
      _feature: string,
      input: {
        system: string;
        messages: Array<{ content: string }>;
        signal?: AbortSignal;
      }
    ) {
      aiRequests.push(input);
      if (input.messages.at(-1)?.content === "Cancel me") {
        cancelledStream = new Promise((resolve) => {
          if (input.signal?.aborted) {
            resolve();
          } else {
            input.signal?.addEventListener("abort", () => resolve(), { once: true });
          }
        });
        yield "Partial answer";
        await cancelledStream;
        return;
      }
      yield "Personalized tutor reply.";
    },
  };

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRouter);
  app.use("/api/tutor", createTutorRouter(mockGateway));
  app.use("/api/tutor-fallback", createTutorRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  t.after(async () => {
    await disconnectFromDatabase();
    await mongo.stop();
  });

  await connectToDatabase();
  await seedContent();

  await request(app)
    .post("/api/tutor")
    .send({ lessonId: "000000000000000000000000", question: "Explain HTML" })
    .expect(401);

  const student = request.agent(app);
  await student
    .post("/api/auth/register")
    .send({
      name: "Tutor Student",
      email: "tutor@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);
  const lessonQuestion = await Question.findOne({
    topic: "HTML",
    difficulty: "Beginner",
    challengeStage: null,
  });
  assert.ok(lessonQuestion);
  const studentId = (await student.get("/api/auth/me").expect(200)).body.user.id;
  const lesson = await Lesson.findOne({ title: "Introduction to HTML" });
  assert.ok(lesson);

  const lessonReply = await student
    .post("/api/tutor")
    .send({
      lessonId: lesson.id,
      question: "Explain this lesson",
      notes: "CLIENT_NOTES_MUST_BE_IGNORED",
    })
    .expect(200);
  assert.deepEqual(lessonReply.body, {
    answer: "Lesson-specific tutor reply.",
    fallback: false,
  });
  assert.match(aiRequests[0]!.system, /Student level: Beginner/);
  assert.match(aiRequests[0]!.system, /Lesson: Introduction to HTML/);
  assert.ok(aiRequests[0]!.system.includes(lesson.content.slice(0, 100)));
  assert.doesNotMatch(aiRequests[0]!.system, /CLIENT_NOTES_MUST_BE_IGNORED/);
  assert.ok(
    lesson.keyPoints.every((point: string) => aiRequests[0]!.system.includes(point))
  );
  assert.equal(aiRequests[0]!.messages.at(-1)?.content, "Explain this lesson");

  await student
    .post("/api/tutor")
    .send({ lessonId: lesson.id, question: "x".repeat(1001) })
    .expect(400);
  await student
    .post("/api/tutor")
    .send({ lessonId: "not-an-object-id", question: "Explain HTML" })
    .expect(400);

  await Attempt.create({
    userId: studentId,
    type: "Assessment",
    difficulty: "Beginner",
    status: "submitted",
    questionIds: [lessonQuestion._id],
    answers: [{ questionId: lessonQuestion._id, selectedIndex: 2, correct: false }],
    total: 1,
    score: 0,
    percentage: 0,
    completedAt: new Date(),
    topicResults: [
      { topic: "HTML", correct: 0, total: 1, percentage: 0 },
      { topic: "CSS", correct: 0, total: 2, percentage: 0 },
      { topic: "JavaScript", correct: 0, total: 0, percentage: 0 },
      { topic: "React", correct: 0, total: 0, percentage: 0 },
    ],
  });

  const sessionResponse = await student.post("/api/tutor/sessions").expect(201);
  const sessionId = sessionResponse.body.session._id as string;
  assert.equal(sessionResponse.body.session.title, "New chat");

  const streamed = await student
    .post(`/api/tutor/sessions/${sessionId}/messages`)
    .send({ content: "Explain closures", level: "Advanced" })
    .expect(200)
    .expect("Content-Type", /text\/event-stream/);
  assert.match(streamed.text, /event: chunk/);
  assert.match(streamed.text, /Personalized tutor reply/);
  assert.ok(streamed.text.includes('event: done\ndata: {"fallback":false}'));
  assert.match(aiRequests[1]!.system, /Student level: Advanced/);
  assert.match(aiRequests[1]!.system, /weakest topics right now: HTML, CSS/);
  assert.match(aiRequests[1]!.system, /recent missed questions: HTML/);
  assert.equal(aiRequests[1]!.messages.at(-1)?.content, "Explain closures");

  const session = await student.get(`/api/tutor/sessions/${sessionId}`).expect(200);
  assert.equal(session.body.session.title, "Explain closures");
  assert.equal(session.body.session.messages.length, 2);
  assert.equal(session.body.session.messages[0].role, "user");
  assert.equal(session.body.session.messages[1].fallback, false);

  await assert.rejects(
    student
      .post(`/api/tutor/sessions/${sessionId}/messages`)
      .send({ content: "Cancel me" })
      .timeout({ deadline: 1000 })
  );
  await cancelledStream;
  assert.equal((await ChatSession.findById(sessionId))?.messages.length, 2);

  const fallbackSession = (await student.post("/api/tutor-fallback/sessions").expect(201))
    .body.session;
  const lessonFallback = await student
    .post("/api/tutor-fallback")
    .send({
      lessonId: lesson.id,
      question: "Explain JavaScript closures",
      notes: "CLIENT_NOTES_MUST_BE_IGNORED",
    })
    .expect(200);
  assert.equal(lessonFallback.body.fallback, true);
  assert.match(lessonFallback.body.answer, /inner function remembers variables/);
  assert.ok(lessonFallback.body.answer.includes(lesson.content.slice(0, 100)));
  assert.doesNotMatch(lessonFallback.body.answer, /CLIENT_NOTES_MUST_BE_IGNORED/);

  const beginner = await student
    .post(`/api/tutor-fallback/sessions/${fallbackSession._id}/messages`)
    .send({ content: "Explain JavaScript closures", level: "Beginner" })
    .expect(200);
  assert.ok(beginner.text.includes('event: done\ndata: {"fallback":true}'));
  assert.match(beginner.text, /inner function remembers variables/);

  const advanced = await student
    .post(`/api/tutor-fallback/sessions/${fallbackSession._id}/messages`)
    .send({ content: "Explain JavaScript closures", level: "Advanced" })
    .expect(200);
  assert.match(advanced.text, /Closures — Advanced/);
  assert.match(advanced.text, /Learning Level: Advanced/);
  assert.match(
    generateTutorResponse("Explain JavaScript closures", "Beginner"),
    /Learning Level: Beginner/
  );

  await student
    .post(`/api/tutor-fallback/sessions/${fallbackSession._id}/messages`)
    .send({ content: " \u0000 " })
    .expect(400);

  const list = await student.get("/api/tutor/sessions").expect(200);
  assert.equal(list.body.sessions.length, 2);
  const secondStudent = request.agent(app);
  await secondStudent
    .post("/api/auth/register")
    .send({
      name: "Another Student",
      email: "another-tutor@example.com",
      password: "correct horse battery staple",
    })
    .expect(201);
  await secondStudent.get(`/api/tutor/sessions/${sessionId}`).expect(404);
  await secondStudent.delete(`/api/tutor/sessions/${sessionId}`).expect(404);
  await secondStudent
    .post(`/api/tutor/sessions/${sessionId}/messages`)
    .send({ content: "Read this chat" })
    .expect(404);

  await student.delete(`/api/tutor/sessions/${sessionId}`).expect(204);
  assert.equal(await ChatSession.countDocuments(), 1);
});
