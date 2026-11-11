import assert from "node:assert/strict";
import cookieParser from "cookie-parser";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";
import { errorHandler } from "../src/middleware/error-handler.js";
import { notFoundHandler } from "../src/middleware/not-found.js";
test("lesson quizzes are generated, resumable, and graded without exposing answers early", async (t) => {
    const mongo = await MongoMemoryServer.create();
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = mongo.getUri();
    process.env.CLIENT_URL = "http://localhost:5173";
    process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
    process.env.JWT_TTL = "7d";
    const [{ authRouter }, { createLessonAssessmentsRouter }, { Lesson }, { connectToDatabase, disconnectFromDatabase }, { seedContent },] = await Promise.all([
        import("../src/routes/auth.js"),
        import("../src/routes/lesson-assessments.js"),
        import("../src/models/lesson.js"),
        import("../src/config/database.js"),
        import("../src/content/seed.js"),
    ]);
    let generationCount = 0;
    const mockGateway = {
        async generate() {
            generationCount += 1;
            return {
                text: JSON.stringify([
                    {
                        text: "Which element represents a paragraph?",
                        options: ["<p>", "<div>", "<span>", "<section>"],
                        correctIndex: 0,
                        explanation: "The p element represents a paragraph.",
                    },
                    {
                        text: "Which attribute provides alternative text for an image?",
                        options: ["src", "alt", "href", "title"],
                        correctIndex: 1,
                        explanation: "The alt attribute provides text alternatives for images.",
                    },
                    {
                        text: "Which element creates a hyperlink?",
                        options: ["<link>", "<a>", "<href>", "<nav>"],
                        correctIndex: 1,
                        explanation: "The a element creates a hyperlink.",
                    },
                ]),
            };
        },
    };
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/auth", authRouter);
    app.use("/api/lesson-assessments", createLessonAssessmentsRouter(mockGateway));
    app.use(notFoundHandler);
    app.use(errorHandler);
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
        name: "Lesson Quiz Student",
        email: "lesson-quiz@example.com",
        password: "correct horse battery staple",
    })
        .expect(201);
    const lesson = await Lesson.findOne({ title: "Introduction to HTML" });
    assert.ok(lesson);
    await request(app)
        .post(`/api/lesson-assessments/${lesson.id}/start`)
        .send({})
        .expect(401);
    const started = await agent
        .post(`/api/lesson-assessments/${lesson.id}/start`)
        .send({ lessonMaterial: "Paragraphs use the p element." })
        .expect(201);
    const attempt = started.body.attempt;
    assert.equal(attempt.questions.length, 3);
    assert.ok(attempt.questions.every((question) => !("correctIndex" in question) && !("explanation" in question)));
    const resumed = await agent
        .post(`/api/lesson-assessments/${lesson.id}/start`)
        .send({})
        .expect(200);
    assert.equal(resumed.body.attempt.id, attempt.id);
    assert.equal(generationCount, 1);
    await agent.post(`/api/lesson-assessments/${attempt.id}/submit`).send({}).expect(400);
    for (const [index, question] of attempt.questions.entries()) {
        await agent
            .patch(`/api/lesson-assessments/${attempt.id}/answer`)
            .send({
            questionId: question.id,
            selectedIndex: index === 1 ? 0 : [0, 1, 1][index],
        })
            .expect(200);
    }
    const submitted = await agent
        .post(`/api/lesson-assessments/${attempt.id}/submit`)
        .send({})
        .expect(200);
    assert.equal(submitted.body.attempt.score, 2);
    assert.equal(submitted.body.attempt.percentage, 67);
    assert.deepEqual(submitted.body.attempt.questions.map((question) => question.correct), [true, false, true]);
    assert.ok(submitted.body.attempt.questions.every((question) => "correctIndex" in question && "explanation" in question));
    await agent.post(`/api/lesson-assessments/${attempt.id}/submit`).send({}).expect(200);
});
