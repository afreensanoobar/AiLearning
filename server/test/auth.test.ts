import assert from "node:assert/strict";
import type { Server } from "node:http";
import bcrypt from "bcrypt";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { test } from "node:test";

test("authentication, refresh rotation, profile and password flows", async (t) => {
  const mongo = await MongoMemoryServer.create();

  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_ACCESS_SECRET = "test_access_secret_that_is_at_least_32_chars";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret_that_is_at_least_32_chars";
  process.env.ACCESS_TOKEN_TTL = "15m";
  process.env.REFRESH_TOKEN_TTL = "7d";

  const { app } = await import("../src/app.js");
  const { User } = await import("../src/models/user.js");
  const { requireAuth, requireRole } = await import("../src/auth/require-auth.js");
  const { createAccessToken } = await import("../src/auth/tokens.js");
  const { connectToDatabase, disconnectFromDatabase } =
    await import("../src/config/database.js");
  const resources: { server?: Server } = {};

  t.after(async () => {
    if (resources.server) {
      await new Promise<void>((resolve, reject) => {
        resources.server?.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
    await disconnectFromDatabase();
    await mongo.stop();
  });

  await connectToDatabase();
  const agent = request.agent(app);
  const registration = await agent
    .post("/api/auth/register")
    .send({
      name: "Ada Lovelace",
      email: "ADA@example.com",
      password: "correct horse battery staple",
      role: "admin",
    })
    .expect(201);

  assert.equal(registration.body.user.email, "ada@example.com");
  assert.equal(registration.body.user.role, "student");
  assert.equal(registration.body.user.currentLevel, "Beginner");
  assert.equal(registration.body.user.role, "student");
  assert.equal(typeof registration.body.accessToken, "string");
  assert.equal(registration.body.expiresIn, 900);
  const accessToken = registration.body.accessToken as string;
  assert.deepEqual(
    Object.keys(registration.body.user).sort(),
    [
      "createdAt",
      "currentLevel",
      "email",
      "id",
      "lastActiveAt",
      "name",
      "role",
      "timezone",
    ].sort()
  );
  const initialCookie = registration.headers["set-cookie"][0].split(";")[0];
  assert.match(registration.headers["set-cookie"][0], /HttpOnly/i);

  const storedUser = await User.findOne({ email: "ada@example.com" }).select(
    "+passwordHash +refreshTokenHash"
  );
  assert.ok(storedUser);
  assert.notEqual(storedUser.passwordHash, "correct horse battery staple");
  assert.match(storedUser.passwordHash, /^\$2[aby]\$12\$/);
  assert.match(storedUser.refreshTokenHash ?? "", /^[a-f0-9]{64}$/);

  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Duplicate User",
      email: "ada@example.com",
      password: "correct horse battery staple",
    })
    .expect(409);

  const wrongEmail = await request(app)
    .post("/api/auth/login")
    .send({ email: "missing@example.com", password: "wrong password" })
    .expect(401);
  const wrongPassword = await request(app)
    .post("/api/auth/login")
    .send({ email: "ada@example.com", password: "wrong password" })
    .expect(401);
  assert.equal(wrongEmail.body.error.message, wrongPassword.body.error.message);

  await request(app).get("/api/auth/me").expect(401);
  const me = await agent
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);
  assert.equal(me.body.user.email, "ada@example.com");
  assert.equal("passwordHash" in me.body.user, false);

  await User.create({
    name: "Another User",
    email: "taken@example.com",
    passwordHash: await bcrypt.hash("another password", 12),
  });
  const duplicateProfileEmail = await agent
    .patch("/api/users/me")
    .send({ email: "TAKEN@example.com" })
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(409);
  assert.equal(duplicateProfileEmail.body.error.code, "EMAIL_IN_USE");

  const updatedProfile = await agent
    .patch("/api/users/me")
    .send({
      name: "Ada Byron",
      email: "ada.byron@example.com",
      timezone: "Europe/London",
    })
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);
  assert.equal(updatedProfile.body.user.name, "Ada Byron");
  assert.equal(updatedProfile.body.user.email, "ada.byron@example.com");
  assert.equal(updatedProfile.body.user.timezone, "Europe/London");

  const refresh = await agent.post("/api/auth/refresh").expect(200);
  assert.notEqual(refresh.headers["set-cookie"][0].split(";")[0], initialCookie);
  await request(app).post("/api/auth/refresh").set("Cookie", initialCookie).expect(401);

  await agent
    .post("/api/users/me/password")
    .send({
      currentPassword: "wrong current password",
      newPassword: "a different correct password",
    })
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(400);

  await agent
    .post("/api/users/me/password")
    .send({
      currentPassword: "correct horse battery staple",
      newPassword: "a different correct password",
    })
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);
  const changedUser = await User.findOne({
    email: "ada.byron@example.com",
  }).select("+passwordHash +refreshTokenHash");
  assert.ok(changedUser);
  assert.equal(
    await bcrypt.compare("a different correct password", changedUser.passwordHash),
    true
  );
  assert.equal(changedUser.refreshTokenHash, undefined);
  await agent
    .post("/api/auth/login")
    .send({
      email: "ada.byron@example.com",
      password: "a different correct password",
    })
    .expect(200);

  await agent.post("/api/auth/logout").expect(204);
  const loggedOutUser = await User.findOne({
    email: "ada.byron@example.com",
  }).select("+refreshTokenHash");
  assert.ok(loggedOutUser);
  assert.equal(loggedOutUser.refreshTokenHash, undefined);

  const roleApp = express();
  roleApp.get("/admin", requireAuth, requireRole("admin"), (_req, res) => {
    res.sendStatus(204);
  });
  await request(roleApp)
    .get("/admin")
    .set("Authorization", `Bearer ${registration.body.accessToken}`)
    .expect(403);

  const admin = await User.create({
    name: "Admin",
    email: "admin@example.com",
    passwordHash: await bcrypt.hash("admin password", 12),
    role: "admin",
  });
  await request(roleApp)
    .get("/admin")
    .set("Authorization", `Bearer ${createAccessToken(admin)}`)
    .expect(204);
});

test("authentication rate limiter caps requests with a standard error response", async () => {
  const { createAuthRateLimit } = await import("../src/auth/rate-limit.js");
  const limitedApp = express();
  limitedApp.use("/auth", createAuthRateLimit());
  limitedApp.post("/auth/login", (_req, res) => res.sendStatus(204));

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await request(limitedApp).post("/auth/login").expect(204);
  }

  const response = await request(limitedApp).post("/auth/login").expect(429);
  assert.deepEqual(response.body.error, {
    code: "RATE_LIMITED",
    message: "Too many authentication requests. Try again later.",
    details: [],
  });
});
