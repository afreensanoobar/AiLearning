import assert from "node:assert/strict";
import cookieParser from "cookie-parser";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";
import { errorHandler } from "../src/middleware/error-handler.js";
import { notFoundHandler } from "../src/middleware/not-found.js";
test("admins can manage content, questions, users and stats", async (t) => {
    const mongo = await MongoMemoryServer.create();
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = mongo.getUri();
    process.env.CLIENT_URL = "http://localhost:5173";
    process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
    process.env.JWT_TTL = "7d";
    const [{ authRouter }, { createAdminRouter }, { createAssessmentsRouter }, { coursesRouter }, { Lesson }, { Question }, { User }, { connectToDatabase, disconnectFromDatabase }, { seedContent },] = await Promise.all([
        import("../src/routes/auth.js"),
        import("../src/routes/admin.js"),
        import("../src/routes/assessments.js"),
        import("../src/routes/courses.js"),
        import("../src/models/lesson.js"),
        import("../src/models/question.js"),
        import("../src/models/user.js"),
        import("../src/config/database.js"),
        import("../src/content/seed.js"),
    ]);
    const mockGateway = {
        async generate() {
            return {
                text: JSON.stringify([
                    {
                        text: "Which HTML tag creates a paragraph?",
                        options: ["<p>", "<para>", "<text>", "<div>"],
                        correctIndex: 0,
                        explanation: "The p element represents a paragraph.",
                    },
                ]),
            };
        },
    };
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/auth", authRouter);
    app.use("/api/courses", coursesRouter);
    app.use("/api/assessments", createAssessmentsRouter(mockGateway));
    app.use("/api/admin", createAdminRouter(mockGateway));
    app.use(notFoundHandler);
    app.use(errorHandler);
    t.after(async () => {
        await disconnectFromDatabase();
        await mongo.stop();
    });
    await connectToDatabase();
    await seedContent();
    const seededLessonCount = await Lesson.countDocuments();
    await seedContent();
    assert.equal(await Lesson.countDocuments(), seededLessonCount);
    const student = request.agent(app);
    const admin = request.agent(app);
    await student
        .post("/api/auth/register")
        .send({
        name: "Student",
        email: "student@example.com",
        password: "correct horse battery staple",
    })
        .expect(201);
    await admin
        .post("/api/auth/register")
        .send({
        name: "Admin",
        email: "admin@example.com",
        password: "correct horse battery staple",
    })
        .expect(201);
    await User.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
    await admin
        .post("/api/auth/login")
        .send({ email: "admin@example.com", password: "correct horse battery staple" })
        .expect(200);
    await student.get("/api/admin/stats").expect(403);
    await student.get("/api/admin/courses").expect(403);
    const stats = await admin.get("/api/admin/stats").expect(200);
    assert.equal(typeof stats.body.totalUsers, "number");
    assert.ok(stats.body.totalUsers >= 2);
    const createdCourse = await admin
        .post("/api/admin/courses")
        .send({
        slug: "git-basics",
        title: "Git Basics",
        category: "Tools",
        description: "Learn version control and collaborate on software projects.",
        level: "Beginner",
        skills: ["Git", "Branching", "GitHub"],
        order: 10,
        ui: {
            color: "#8b5cf6",
            bg: "#ede9fe",
            icon: "Git",
            iconColor: "#6d28d9",
        },
    })
        .expect(201);
    assert.equal(createdCourse.body.course.description, "Learn version control and collaborate on software projects.");
    assert.equal(createdCourse.body.course.level, "Beginner");
    assert.deepEqual(createdCourse.body.course.skills, ["Git", "Branching", "GitHub"]);
    const courseId = createdCourse.body.course.id;
    await admin
        .post("/api/admin/lessons")
        .send({
        courseId,
        title: "Invalid video",
        content: "This lesson has an invalid video identifier.",
        videoId: "not-an-id",
        estimatedMinutes: 8,
    })
        .expect(400);
    const invalidModelLesson = new Lesson({
        courseId,
        title: "Invalid model video",
        content: "This lesson also has an invalid video identifier.",
        videoId: "not-an-id",
        estimatedMinutes: 8,
        order: 20,
    });
    await assert.rejects(invalidModelLesson.validate());
    const firstLesson = await admin
        .post("/api/admin/lessons")
        .send({
        courseId,
        title: "What is Git?",
        content: "Git is a version control system.",
        videoId: "Abcdef_1234",
        channel: "LearnAI",
        keyPoints: ["Commits preserve history."],
        estimatedMinutes: 8,
    })
        .expect(201);
    assert.equal(firstLesson.body.lesson.videoId, "Abcdef_1234");
    assert.equal(firstLesson.body.lesson.channel, "LearnAI");
    assert.deepEqual(firstLesson.body.lesson.keyPoints, ["Commits preserve history."]);
    await admin
        .patch(`/api/admin/lessons/${firstLesson.body.lesson.id}`)
        .send({ videoId: "invalid" })
        .expect(400);
    const secondLesson = await admin
        .post("/api/admin/lessons")
        .send({
        courseId,
        title: "Commits",
        content: "A commit snapshots your work.",
        estimatedMinutes: 10,
    })
        .expect(201);
    const reordered = await admin
        .post(`/api/admin/courses/${courseId}/lessons/reorder`)
        .send({
        lessonIds: [secondLesson.body.lesson.id, firstLesson.body.lesson.id],
    })
        .expect(200);
    const courseDetails = await admin.get("/api/courses/html-fundamentals").expect(200);
    const seededHtmlLesson = courseDetails.body.lessons.find((lesson) => lesson.title === "Introduction to HTML");
    assert.ok(seededHtmlLesson);
    assert.equal(seededHtmlLesson.videoId, "kUMe1FH4CHE");
    assert.equal(seededHtmlLesson.channel, "freeCodeCamp.org");
    assert.ok(seededHtmlLesson.content);
    assert.equal(seededHtmlLesson.keyPoints.length, 4);
    assert.deepEqual(reordered.body.lessons.map((lesson) => lesson.title), ["Commits", "What is Git?"]);
    await admin
        .patch(`/api/admin/lessons/${firstLesson.body.lesson.id}`)
        .send({ content: "Git tracks changes to files." })
        .expect(200);
    const questions = await admin.get("/api/admin/questions?status=active").expect(200);
    assert.ok(questions.body.questions.length > 0);
    const existingId = questions.body.questions[0].id;
    const createdQuestion = await admin
        .post("/api/admin/questions")
        .send({
        topic: "HTML",
        difficulty: "Beginner",
        text: "What does HTML stand for?",
        options: [
            "HyperText Markup Language",
            "HighText Machine Language",
            "Hyperlinks and Text Markup Language",
            "Home Tool Markup Language",
        ],
        correctIndex: 0,
        explanation: "HTML is HyperText Markup Language.",
    })
        .expect(201);
    assert.equal(createdQuestion.body.question.status, "active");
    assert.equal(createdQuestion.body.question.source, "manual");
    await admin.delete(`/api/admin/questions/${existingId}`).expect(200);
    const archived = await Question.findById(existingId);
    assert.equal(archived?.status, "archived");
    const generated = await admin
        .post("/api/admin/questions/generate")
        .send({ topic: "HTML", difficulty: "Beginner", count: 1 })
        .expect(201);
    const draftId = generated.body.questionIds[0];
    await admin.post(`/api/admin/questions/${draftId}/approve`).expect(200);
    const approved = await Question.findById(draftId);
    assert.equal(approved?.status, "active");
    const rejectedDraft = await Question.create({
        topic: "CSS",
        difficulty: "Beginner",
        text: "Draft only question for rejection.",
        options: ["A", "B", "C", "D"],
        correctIndex: 1,
        explanation: "Used in the reject path.",
        status: "draft",
        source: "ai",
    });
    await admin.post(`/api/admin/questions/${rejectedDraft.id}/reject`).expect(200);
    const rejected = await Question.findById(rejectedDraft.id);
    assert.equal(rejected?.status, "rejected");
    const assessment = await student
        .post("/api/assessments/start")
        .send({ mode: "assessment" })
        .expect(201);
    const servedIds = assessment.body.attempt.questions.map((question) => question.id);
    assert.equal(servedIds.includes(existingId), false);
    assert.equal(servedIds.includes(rejectedDraft.id), false);
    assert.equal(servedIds.includes(draftId), true);
    const users = await admin.get("/api/admin/users").expect(200);
    const studentUser = users.body.users.find((user) => user.email === "student@example.com");
    const adminUser = users.body.users.find((user) => user.email === "admin@example.com");
    assert.ok(studentUser);
    await admin
        .patch(`/api/admin/users/${adminUser.id}`)
        .send({ role: "student" })
        .expect(400);
    await admin
        .patch(`/api/admin/users/${studentUser.id}`)
        .send({ deactivated: true })
        .expect(200);
    const deactivatedLogin = await request(app)
        .post("/api/auth/login")
        .send({
        email: "student@example.com",
        password: "correct horse battery staple",
    })
        .expect(403);
    assert.equal(deactivatedLogin.body.error.code, "ACCOUNT_DEACTIVATED");
    await student.get("/api/assessments/history").expect(401);
    await admin.delete(`/api/admin/lessons/${secondLesson.body.lesson.id}`).expect(204);
    await admin.delete(`/api/admin/courses/${courseId}`).expect(204);
    await admin.get(`/api/admin/courses/${courseId}`).expect(404);
});
