import rateLimit from "express-rate-limit";

export function createAiRateLimit(limit: number) {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    limit,
    keyGenerator: (_req, res) => res.locals.auth!.userId,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Too many AI requests. Try again later.",
          details: [],
        },
      });
    },
  });
}
