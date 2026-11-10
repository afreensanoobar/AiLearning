import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger.js";
import { HttpError } from "./http-error.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const errorType =
    error instanceof Error && "type" in error && typeof error.type === "string"
      ? error.type
      : undefined;
  const invalidJson =
    errorType === "entity.parse.failed" ||
    (error instanceof SyntaxError && "body" in error);
  const bodyTooLarge = errorType === "entity.too.large";
  const statusCode =
    error instanceof HttpError
      ? error.statusCode
      : invalidJson
        ? 400
        : bodyTooLarge
          ? 413
          : 500;
  const code =
    error instanceof HttpError
      ? error.code
      : invalidJson
        ? "INVALID_JSON"
        : bodyTooLarge
          ? "PAYLOAD_TOO_LARGE"
          : "INTERNAL_SERVER_ERROR";
  const message =
    error instanceof HttpError
      ? error.message
      : invalidJson
        ? "Request body contains invalid JSON."
        : bodyTooLarge
          ? "Request body exceeds the 100 KB limit."
          : "An unexpected error occurred.";
  const details = error instanceof HttpError ? error.details : [];

  if (statusCode >= 500) {
    logger.error({ err: error }, "Request failed");
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
};
