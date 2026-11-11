import assert from "node:assert/strict";
import cookieParser from "cookie-parser";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";
import { errorHandler } from "../src/middleware/error-handler.js";
import { notFoundHandler } from "../src/middleware/not-found.js";
test("AI learning endpoints validate, personalize, cache, and keep generated questions in drafts", async (t) => {
    const mongo = await MongoMemoryServer.create();
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = mongo.getUri();
    process.env.CLIENT_URL = "http://localhost:5173";
    process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
    process.env.JWT_TTL = "7d";
    const [{ authRouter }, { createAdminRouter }, { createAssessmentsRouter }, { createProgressRouter }, { Attempt }, { AiStudyPlanCache }, { Question }, { User }, { connectToDatabase, disconnectFromDatabase }, { seedContent },] = await Promise.all([
        import("../src/routes/auth.js"),
        import("../src/routes/admin.js"),
        import("../src/routes/assessments.js"),
        import("../src/routes/progress.js"),
        import("../src/models/attempt.js"),
        import("../src/models/ai-study-plan.js"),
        import("../src/models/question.js"),
        import("../src/models/user.js"),
        import("../src/config/database.js"),
        import("../src/content/seed.js"),
    ]);
    const plan = {
        summary: "Build confidence with a short daily routine.",
        weeklyPlan: Array.from({ length: 7 }, (_, index) => ({
            day: `Day ${index + 1}`,
            focusTopic: "HTML",
            tasks: ["Review semantic elements."],
            minutes: 30,
        })),
        tips: ["Practice a little each day."],
    };
    const generatedQuestions = [
        {
            text: "Which attribute provides alternate text for an image?",
            options: ["alt", "src", "href", "title"],
            correctIndex: 0,
            explanation: "The alt attribute provides a text alternative.",
        },
    ];
    const calls = [];
    let duplicateQuestionText = "Existing HTML question";
    let planInitiallyMalformed = true;
    let questionsInitiallyMalformed = true;
    let malformedReact = false;
    let generateDuplicate = false;
    const mockGateway = {
        async generate(feature, input, cacheKey) {
            calls.push({ feature, system: input.system, cacheKey });
            if (feature.startsWith("study-plan")) {
                if (planInitiallyMalformed && feature === "study-plan") {
                    planInitiallyMalformed = false;
                    return { text: "{malformed" };
                }
                return { text: JSON.stringify(plan) };
            }
            if (feature.startsWith("question-generation")) {
                if (malformedReact && input.system.includes("about React")) {
                    return { text: "{malformed" };
                }
                if (questionsInitiallyMalformed && feature === "question-generation") {
                    questionsInitiallyMalformed = false;
                    return {
                        text: JSON.stringify([
                            {
                                ...generatedQuestions[0],
                                options: ["alt", "alt", "src", "href"],
                            },
                        ]),
                    };
                }
                const questions = generateDuplicate
                    ? [{ ...generatedQuestions[0], text: duplicateQuestionText }]
                    : generatedQuestions;
                return { text: JSON.stringify(questions) };
            }
            return {
                text: "Your choice is incorrect because the correct concept is different.",
            };
        },
    };
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/auth", authRouter);
    app.use("/api/assessments", createAssessmentsRouter(mockGateway));
    app.use("/api/progress", createProgressRouter(mockGateway));
    app.use("/api/admin", createAdminRouter(mockGateway));
    app.use(notFoundHandler);
    app.use(errorHandler);
    t.after(async () => {
        await disconnectFromDatabase();
        await mongo.stop();
    });
    await connectToDatabase();
    await seedContent();
    duplicateQuestionText = (await Question.findOne({
        topic: "HTML",
        difficulty: "Beginner",
        status: "active",
    })).text;
    const student = request.agent(app);
    await student
        .post("/api/auth/register")
        .send({
        name: "AI Student",
        email: "ai-student@example.com",
        password: "correct horse battery staple",
    })
        .expect(201);
    const inProgress = (await student.post("/api/assessments/start").send({ mode: "assessment" }).expect(201)).body.attempt;
    await student
        .post(`/api/assessments/${inProgress.id}/explain`)
        .send({ questionId: inProgress.questions[0].id })
        .expect(409);
    let wrongQuestionId = "";
    let correctQuestionId = "";
    for (const question of inProgress.questions) {
        const stored = await Question.findById(question.id);
        assert.ok(stored);
        const selectedIndex = question.id === inProgress.questions[0].id
            ? (stored.correctIndex + 1) % 4
            : stored.correctIndex;
        if (selectedIndex === stored.correctIndex)
            correctQuestionId = question.id;
        else
            wrongQuestionId = question.id;
        await student
            .patch(`/api/assessments/${inProgress.id}/answer`)
            .send({ questionId: question.id, selectedIndex })
            .expect(200);
    }
    await student.post(`/api/assessments/${inProgress.id}/submit`).expect(200);
    const explanation = await student
        .post(`/api/assessments/${inProgress.id}/explain`)
        .send({ questionId: wrongQuestionId })
        .expect(200);
    assert.match(explanation.body.explanation, /choice is incorrect/);
    const explanationRequest = calls.find((call) => call.feature === "assessment-explanation");
    assert.ok(explanationRequest?.cacheKey);
    assert.match(explanationRequest.system, /Student chose:/);
    assert.match(explanationRequest.system, /Correct answer:/);
    assert.match(explanationRequest.system, /Level: Intermediate/);
    await student
        .post(`/api/assessments/${inProgress.id}/explain`)
        .send({ questionId: wrongQuestionId })
        .expect(200);
    const repeatedExplanation = calls.filter((call) => call.feature === "assessment-explanation");
    assert.equal(repeatedExplanation[0]?.cacheKey, repeatedExplanation[1]?.cacheKey);
    await student
        .post(`/api/assessments/${inProgress.id}/explain`)
        .send({ questionId: correctQuestionId })
        .expect(400);
    const otherStudent = request.agent(app);
    await otherStudent
        .post("/api/auth/register")
        .send({
        name: "Other Student",
        email: "other-ai-student@example.com",
        password: "correct horse battery staple",
    })
        .expect(201);
    await otherStudent
        .post(`/api/assessments/${inProgress.id}/explain`)
        .send({ questionId: wrongQuestionId })
        .expect(404);
    const firstPlan = await student.post("/api/progress/ai-plan").expect(200);
    assert.equal(firstPlan.body.cached, false);
    assert.equal(firstPlan.body.plan.weeklyPlan.length, 7);
    assert.match(calls.find((call) => call.feature === "study-plan").system, /Intermediate/);
    assert.ok(calls.some((call) => call.feature === "study-plan-retry"));
    const secondPlan = await student.post("/api/progress/ai-plan").expect(200);
    assert.equal(secondPlan.body.cached, true);
    assert.equal(await AiStudyPlanCache.countDocuments(), 1);
    const nextAttempt = (await student.post("/api/assessments/start").send({ mode: "assessment" }).expect(201)).body.attempt;
    for (const question of nextAttempt.questions) {
        const stored = await Question.findById(question.id);
        assert.ok(stored);
        await student
            .patch(`/api/assessments/${nextAttempt.id}/answer`)
            .send({ questionId: question.id, selectedIndex: stored.correctIndex })
            .expect(200);
    }
    await student.post(`/api/assessments/${nextAttempt.id}/submit`).expect(200);
    assert.equal(await AiStudyPlanCache.countDocuments(), 0);
    const studentUser = await User.findOne({ email: "ai-student@example.com" });
    assert.ok(studentUser);
    const admin = request.agent(app);
    await admin
        .post("/api/auth/register")
        .send({
        name: "AI Admin",
        email: "ai-admin@example.com",
        password: "correct horse battery staple",
    })
        .expect(201);
    const adminUser = await User.findOne({ email: "ai-admin@example.com" });
    assert.ok(adminUser);
    await User.updateOne({ _id: adminUser._id }, { $set: { role: "admin" } });
    await admin
        .post("/api/auth/login")
        .send({ email: "ai-admin@example.com", password: "correct horse battery staple" })
        .expect(200);
    await student
        .post("/api/admin/questions/generate")
        .send({ topic: "HTML", difficulty: "Beginner", count: 1 })
        .expect(403);
    const generated = await admin
        .post("/api/admin/questions/generate")
        .send({ topic: "HTML", difficulty: "Beginner", count: 1 })
        .expect(201);
    assert.equal(generated.body.count, 1);
    assert.ok(calls.some((call) => call.feature === "question-generation-retry"));
    const draft = await Question.findById(generated.body.questionIds[0]);
    assert.equal(draft?.status, "draft");
    assert.equal(draft?.source, "ai");
    const assessmentWithDrafts = (await student.post("/api/assessments/start").send({ mode: "assessment" }).expect(201)).body.attempt;
    assert.ok(assessmentWithDrafts.questions.every((question) => question.id !== generated.body.questionIds[0]));
    generateDuplicate = true;
    await admin
        .post("/api/admin/questions/generate")
        .send({ topic: "HTML", difficulty: "Beginner", count: 1 })
        .expect(409);
    generateDuplicate = false;
    malformedReact = true;
    const failedGeneration = await admin
        .post("/api/admin/questions/generate")
        .send({ topic: "React", difficulty: "Beginner", count: 1 })
        .expect(502);
    assert.equal(failedGeneration.body.error.code, "AI_INVALID_RESPONSE");
    assert.equal(await Question.countDocuments({
        topic: "React",
        difficulty: "Beginner",
        status: "draft",
        source: "ai",
    }), 0);
    assert.equal(await Attempt.countDocuments({ status: "submitted" }), 2);
});
