import rateLimit from "express-rate-limit";
export function createAuthRateLimit() {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler: (_req, res) => {
            res.status(429).json({
                error: {
                    code: "RATE_LIMITED",
                    message: "Too many authentication requests. Try again later.",
                    details: [],
                },
            });
        },
    });
}
