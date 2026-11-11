import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { RequestHandler } from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import { parse } from "node:querystring";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { authRouter } from "./routes/auth.js";
import { coursesRouter } from "./routes/courses.js";
import { lessonsRouter } from "./routes/lessons.js";
import { usersRouter } from "./routes/users.js";

export const app = express();

export function parseSanitizedQuery(queryString: string) {
  return mongoSanitize.sanitize(parse(queryString));
}

const sanitizeRequest: RequestHandler = (req, _res, next) => {
  for (const input of [req.body, req.params]) {
    if (input && typeof input === "object") {
      mongoSanitize.sanitize(input);
    }
  }
  next();
};

app.disable("x-powered-by");
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.set("query parser", parseSanitizedQuery);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(sanitizeRequest);

app.get("/api/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "error",
    db: connected ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/lessons", lessonsRouter);
app.use(notFoundHandler);
app.use(errorHandler);
