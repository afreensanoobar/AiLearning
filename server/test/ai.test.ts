import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { test } from "node:test";
import { createAiRateLimit } from "../src/services/ai/rate-limit.js";
import { AiError } from "../src/services/ai/provider.js";
import type { AiProvider, AiRequest } from "../src/services/ai/provider.js";
import { guardHistory, guardInput } from "../src/services/ai/guard.js";
import { errorHandler } from "../src/middleware/error-handler.js";

function setTestEnvironment() {
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://localhost:27017/learnai-test";
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
}

const requestInput: AiRequest = {
  system: "Tutor system instructions",
  messages: [{ role: "user", content: "Explain CSS Grid." }],
};

function geminiResponse(text: string, usage = true) {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text }] } }],
      ...(usage
        ? { usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 8 } }
        : {}),
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}

test("AI guard strips control characters, limits input, and keeps only recent history", () => {
  assert.equal(guardInput("  hello\u0000 world  "), "hello world");
  assert.equal(guardInput("x".repeat(1100)).length, 1000);
  assert.throws(() => guardInput("\u0000 \t"), AiError);

  const history = Array.from({ length: 12 }, (_, index) => ({
    role: "user" as const,
    content: ` message ${index} `,
  }));
  const guarded = guardHistory(history);
  assert.equal(guarded.length, 10);
  assert.equal(guarded[0]?.content, "message 2");
  assert.equal(guarded[9]?.content, "message 11");
  assert.throws(() => guardHistory([]), AiError);
});

test("Gemini provider reports missing configuration without failing server startup", async () => {
  setTestEnvironment();
  const { createGeminiProvider } = await import("../src/services/ai/gemini.js");
  const provider = createGeminiProvider({ apiKey: "" });
  await assert.rejects(provider.generate(requestInput), {
    code: "AI_UNAVAILABLE",
    statusCode: 503,
  });
});

test("Gemini provider retries one server error and maps rate limits", async () => {
  setTestEnvironment();
  const { createGeminiProvider } = await import("../src/services/ai/gemini.js");
  let calls = 0;
  const provider = createGeminiProvider({
    apiKey: "test-key",
    model: "test-model",
    fetcher: async () => {
      calls += 1;
      return calls === 1
        ? new Response("", { status: 503 })
        : geminiResponse("Grid arranges content in rows and columns.");
    },
  });
  const result = await provider.generate(requestInput);
  assert.equal(calls, 2);
  assert.match(result.text, /rows and columns/);
  assert.deepEqual(result.usage, { inputTokens: 12, outputTokens: 8 });

  const limited = createGeminiProvider({
    apiKey: "test-key",
    fetcher: async () => new Response("", { status: 429 }),
  });
  await assert.rejects(limited.generate(requestInput), {
    code: "AI_RATE_LIMITED",
    statusCode: 429,
  });
});

test("Gemini provider maps timeout and streams text chunks", async () => {
  setTestEnvironment();
  const { createGeminiProvider } = await import("../src/services/ai/gemini.js");
  const timedOut = createGeminiProvider({
    apiKey: "test-key",
    timeoutMs: 1000,
    fetcher: (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), {
          once: true,
        });
      }),
  });
  await assert.rejects(timedOut.generate(requestInput), {
    code: "AI_UNAVAILABLE",
    statusCode: 503,
  });

  const streamBody = [
    `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: "Hello " }] } }] })}\n\n`,
    `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: "world" }] } }] })}\n\n`,
  ].join("");
  const streaming = createGeminiProvider({
    apiKey: "test-key",
    fetcher: async (url) => {
      assert.match(String(url), /streamGenerateContent\?alt=sse/);
      return new Response(streamBody, { status: 200 });
    },
  });
  const chunks: string[] = [];
  for await (const chunk of streaming.stream(requestInput)) chunks.push(chunk);
  assert.deepEqual(chunks, ["Hello ", "world"]);
});

test("AI gateway returns cached output without calling the provider again", async () => {
  setTestEnvironment();
  const { createAiGateway } = await import("../src/services/ai/gateway.js");
  const values = new Map<string, string>();
  const cache = {
    async get(key: string) {
      return values.get(key) ?? null;
    },
    async set(key: string, value: string) {
      values.set(key, value);
    },
  };
  let calls = 0;
  const provider: AiProvider = {
    async generate() {
      calls += 1;
      return { text: "cached response", usage: { inputTokens: 1, outputTokens: 2 } };
    },
    async *stream() {
      yield "stream";
    },
  };
  const gateway = createAiGateway(provider, cache);
  assert.equal((await gateway.generate("tutor", requestInput)).text, "cached response");
  assert.equal((await gateway.generate("tutor", requestInput)).text, "cached response");
  assert.equal(calls, 1);
});

test("AI rate limit is per authenticated user with a clear 429 response", async () => {
  const app = express();
  app.use((req, res, next) => {
    res.locals.auth = {
      userId: req.get("x-user") ?? "student-1",
      role: "student",
    };
    next();
  });
  app.post("/tutor", createAiRateLimit(2), (_req, res) => res.sendStatus(204));

  await request(app).post("/tutor").set("x-user", "student-1").expect(204);
  await request(app).post("/tutor").set("x-user", "student-1").expect(204);
  const limited = await request(app)
    .post("/tutor")
    .set("x-user", "student-1")
    .expect(429);
  assert.equal(limited.body.error.code, "RATE_LIMITED");
  assert.match(limited.body.error.message, /AI requests/);
  await request(app).post("/tutor").set("x-user", "student-2").expect(204);
});

test("AI errors use the standard API error response", async () => {
  const app = express();
  app.get("/ai", (_req, _res, next) => {
    next(new AiError("AI_UNAVAILABLE", "AI is not configured.", 503));
  });
  app.use(errorHandler);

  const unavailable = await request(app).get("/ai").expect(503);
  assert.deepEqual(unavailable.body.error, {
    code: "AI_UNAVAILABLE",
    message: "AI is not configured.",
    details: [],
  });
});
