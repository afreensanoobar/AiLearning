import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import {
  clearRefreshCookie,
  refreshCookieName,
  setRefreshCookie,
} from "../auth/cookies.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  accessTokenLifetime,
  verifyRefreshToken,
} from "../auth/tokens.js";
import { User } from "../models/user.js";
import type { LearningLevel, UserRole } from "../models/user.js";
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

type RegisterInput = z.infer<typeof registerSchema>["body"];
type LoginInput = z.infer<typeof loginSchema>["body"];

function getBody<T>(res: { locals: Record<string, unknown> }) {
  return (res.locals.validated as { body: T }).body;
}

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  currentLevel: LearningLevel;
  timezone: string;
  createdAt: Date;
  lastActiveAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    currentLevel: user.currentLevel,
    timezone: user.timezone,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
  };
}

function isDuplicateEmailError(error: unknown) {
  return (
    typeof error === "object" && error !== null && "code" in error && error.code === 11000
  );
}

function sendSession(
  res: Parameters<typeof setRefreshCookie>[0],
  user: Parameters<typeof publicUser>[0],
  refreshToken: string
) {
  setRefreshCookie(res, refreshToken);
  res.json({
    accessToken: createAccessToken({ id: user.id, role: user.role }),
    expiresIn: accessTokenLifetime,
    user: publicUser(user),
  });
}

export const authRouter = Router();

authRouter.use(createAuthRateLimit());

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (_req, res) => {
    const body = getBody<RegisterInput>(res);
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = new User({
      name: body.name,
      email: body.email,
      passwordHash,
    });
    user.lastActiveAt = new Date();
    const refreshToken = createRefreshToken(user.id);
    user.refreshTokenHash = hashRefreshToken(refreshToken);

    try {
      await user.save();
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        throw new HttpError(
          409,
          "EMAIL_IN_USE",
          "An account with this email already exists."
        );
      }
      throw error;
    }

    res.status(201);
    sendSession(res, user, refreshToken);
  })
);

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (_req, res) => {
    const body = getBody<LoginInput>(res);
    const user = await User.findOne({ email: body.email }).select("+passwordHash");
    const passwordMatches = await bcrypt.compare(
      body.password,
      user?.passwordHash ?? dummyPasswordHash
    );

    if (!user || !passwordMatches) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }

    user.lastActiveAt = new Date();
    const refreshToken = createRefreshToken(user.id);
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();
    sendSession(res, user, refreshToken);
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies[refreshCookieName];
    if (typeof token !== "string") {
      clearRefreshCookie(res);
      throw new HttpError(
        401,
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid or expired."
      );
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      clearRefreshCookie(res);
      throw new HttpError(
        401,
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid or expired."
      );
    }

    const nextRefreshToken = createRefreshToken(payload.sub);
    const user = await User.findOneAndUpdate(
      {
        _id: payload.sub,
        refreshTokenHash: hashRefreshToken(token),
      },
      {
        $set: {
          refreshTokenHash: hashRefreshToken(nextRefreshToken),
          lastActiveAt: new Date(),
        },
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!user) {
      clearRefreshCookie(res);
      throw new HttpError(
        401,
        "INVALID_REFRESH_TOKEN",
        "Refresh token is invalid or expired."
      );
    }

    sendSession(res, user, nextRefreshToken);
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies[refreshCookieName];
    if (typeof token === "string") {
      let payload;
      try {
        payload = verifyRefreshToken(token);
      } catch {
        payload = undefined;
      }

      if (payload) {
        await User.updateOne(
          {
            _id: payload.sub,
            refreshTokenHash: hashRefreshToken(token),
          },
          { $unset: { refreshTokenHash: 1 } }
        );
      }
    }

    clearRefreshCookie(res);
    res.status(204).end();
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(res.locals.auth?.userId);
    if (!user) {
      throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
    }
    res.json({ user: publicUser(user) });
  })
);
