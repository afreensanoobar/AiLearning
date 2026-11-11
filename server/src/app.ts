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
import { adminRouter } from "./routes/admin.js";
import { assessmentsRouter } from "./routes/assessments.js";
import { badgesRouter } from "./routes/badges.js";
import { coursesRouter } from "./routes/courses.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { lessonsRouter } from "./routes/lessons.js";
import { lessonAssessmentsRouter } from "./routes/lesson-assessments.js";
import { notificationsRouter } from "./routes/notifications.js";
import { progressRouter } from "./routes/progress.js";
import { tutorRouter } from "./routes/tutor.js";
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
app.use("/api/admin", adminRouter);
app.use("/api/users", usersRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/badges", badgesRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/assessments", assessmentsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/lesson-assessments", lessonAssessmentsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/tutor", tutorRouter);
app.use(notFoundHandler);
app.use(errorHandler);
