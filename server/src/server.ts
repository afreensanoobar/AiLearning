import type { Server } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { app } from "./app.js";
import { connectToDatabase, disconnectFromDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

async function listen() {
  const server = app.listen(env.PORT);
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  return server;
}

function registerShutdownHandlers(server: Server) {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Shutting down server");

    const timeout = setTimeout(() => {
      logger.error("Graceful shutdown timed out");
      process.exit(1);
    }, 10000);
    timeout.unref();

    server.close(async (error) => {
      if (error) {
        logger.error({ err: error }, "HTTP server shutdown failed");
        process.exitCode = 1;
      }

      try {
        await disconnectFromDatabase();
      } catch (disconnectError) {
        logger.error({ err: disconnectError }, "MongoDB shutdown failed");
        process.exitCode = 1;
      } finally {
        clearTimeout(timeout);
      }
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

export async function startServer() {
  await connectToDatabase();
  try {
    const server = await listen();
    logger.info({ port: env.PORT }, "LearnAI API listening");
    return server;
  } catch (error) {
    await disconnectFromDatabase();
    throw error;
  }
}

async function main() {
  const server = await startServer();
  registerShutdownHandlers(server);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main().catch((error: unknown) => {
    logger.fatal({ err: error }, "Unable to start LearnAI API");
    process.exitCode = 1;
  });
}
