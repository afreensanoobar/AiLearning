import assert from "node:assert/strict";
import type { Server } from "node:http";
import { createServer } from "node:net";
import { MongoMemoryServer } from "mongodb-memory-server";
import { test } from "node:test";

async function getAvailablePort() {
  const probe = createServer();
  await new Promise<void>((resolve) => probe.listen(0, resolve));
  const address = probe.address();

  if (!address || typeof address === "string") {
    throw new Error("Unable to reserve a test port.");
  }

  await new Promise<void>((resolve, reject) => {
    probe.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  return address.port;
}

test("health reports a connected MongoDB database", async (t) => {
  const mongo = await MongoMemoryServer.create();
  const port = await getAvailablePort();

  process.env.NODE_ENV = "test";
  process.env.PORT = String(port);
  process.env.MONGODB_URI = mongo.getUri();
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.JWT_SECRET = "test_jwt_secret_that_is_at_least_32_characters";
  process.env.JWT_TTL = "7d";

  const database = await import("../src/config/database.js");
  const { startServer } = await import("../src/server.js");
  const { parseSanitizedQuery } = await import("../src/app.js");
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
    await database.disconnectFromDatabase();
    await mongo.stop();
  });

  const server = await startServer();
  resources.server = server;
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Test server did not bind to a TCP port.");
  }

  const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    db: "connected",
  });
  assert.deepEqual(
    { ...parseSanitizedQuery("$where=bad&bad.key=blocked&topic=HTML") },
    { topic: "HTML" }
  );
});
