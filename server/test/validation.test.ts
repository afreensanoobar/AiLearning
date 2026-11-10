import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import express from "express";
import { test } from "node:test";
import { z } from "zod";
import { errorHandler } from "../src/middleware/error-handler.js";
import { validate } from "../src/middleware/validate.js";

function createTestApp() {
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  app.post(
    "/validated",
    validate(
      z.object({
        body: z.object({ name: z.string().min(1) }),
      })
    ),
    (_req, res) => {
      res.json({ ok: true });
    }
  );
  app.use(errorHandler);
  return app;
}

async function startTestServer(): Promise<{
  server: Server;
  url: string;
}> {
  const server = createTestApp().listen(0);
  await once(server, "listening");
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Test server did not bind to a TCP port.");
  }

  return {
    server,
    url: `http://127.0.0.1:${address.port}`,
  };
}

test("validated requests return the standard 400 error shape", async (t) => {
  const { server, url } = await startTestServer();
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      })
  );

  const response = await fetch(`${url}/validated`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: 7 }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed.",
      details: [
        {
          path: "body.name",
          message: "Invalid input: expected string, received number",
        },
      ],
    },
  });
});

test("valid requests continue to the route handler", async (t) => {
  const { server, url } = await startTestServer();
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      })
  );

  const response = await fetch(`${url}/validated`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Ada" }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("oversized JSON requests return a standardized 413 response", async (t) => {
  const { server, url } = await startTestServer();
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      })
  );

  const response = await fetch(`${url}/validated`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "x".repeat(1024 * 101) }),
  });

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    error: {
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body exceeds the 100 KB limit.",
      details: [],
    },
  });
});
