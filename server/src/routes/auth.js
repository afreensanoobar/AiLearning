import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { clearAuthCookie, setAuthCookie } from "../auth/cookies.js";
import { createAuthToken } from "../auth/tokens.js";
import { User } from "../models/user.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../auth/require-auth.js";
import { createAuthRateLimit } from "../auth/rate-limit.js";
const passwordSchema = z
    .string()
    .min(8)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
    message: "Password must be at most 72 bytes.",
});
const dummyPasswordHash = "$2b$12$nINRApNQcOMrD85JxcCL3O63V3ibcQ8Ha1Se.NvL2BKAjPm.q8Njm";
const registerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1).max(100),
        email: z
            .string()
            .trim()
            .email()
            .max(254)
            .transform((email) => email.toLowerCase()),
        password: passwordSchema,
    }),
});
const loginSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .email()
            .max(254)
            .transform((email) => email.toLowerCase()),
        password: z
            .string()
            .min(1)
            .max(72)
            .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
    }),
});
function getBody(res) {
    return res.locals.validated.body;
}
function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentLevel: user.currentLevel,
        timezone: user.timezone,
        showOnLeaderboard: user.showOnLeaderboard,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
    };
}
function isDuplicateEmailError(error) {
    return (typeof error === "object" && error !== null && "code" in error && error.code === 11000);
}
function sendSession(res, user) {
    setAuthCookie(res, createAuthToken({ id: user.id, role: user.role }));
    res.json({ user: publicUser(user) });
}
export const authRouter = Router();
authRouter.post("/register", createAuthRateLimit(), validate(registerSchema), asyncHandler(async (_req, res) => {
    const body = getBody(res);
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = new User({
        name: body.name,
        email: body.email,
        passwordHash,
    });
    user.lastActiveAt = new Date();
    try {
        await user.save();
    }
    catch (error) {
        if (isDuplicateEmailError(error)) {
            throw new HttpError(409, "EMAIL_IN_USE", "An account with this email already exists.");
        }
        throw error;
    }
    res.status(201);
    sendSession(res, user);
}));
authRouter.post("/login", createAuthRateLimit(), validate(loginSchema), asyncHandler(async (_req, res) => {
    const body = getBody(res);
    const user = await User.findOne({ email: body.email }).select("+passwordHash");
    const passwordMatches = await bcrypt.compare(body.password, user?.passwordHash ?? dummyPasswordHash);
    if (!user || !passwordMatches) {
        throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }
    if (user.deactivated) {
        throw new HttpError(403, "ACCOUNT_DEACTIVATED", "This account has been deactivated.");
    }
    user.lastActiveAt = new Date();
    await user.save();
    sendSession(res, user);
}));
authRouter.post("/logout", (_req, res) => {
    clearAuthCookie(res);
    res.status(204).end();
});
authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
    const user = await User.findById(res.locals.auth?.userId);
    if (!user) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
    }
    res.json({ user: publicUser(user) });
}));
