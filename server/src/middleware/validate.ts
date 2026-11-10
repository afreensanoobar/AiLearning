import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { HttpError } from "./http-error.js";

export function validate(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(
        new HttpError(400, "VALIDATION_ERROR", "Request validation failed.", details)
      );
    }

    res.locals.validated = result.data;
    next();
  };
}
