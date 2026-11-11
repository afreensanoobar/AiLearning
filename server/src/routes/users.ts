import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import { clearAuthCookie } from "../auth/cookies.js";
import { requireAuth } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validate } from "../middleware/validate.js";
import { User } from "../models/user.js";
import type { UserRole, LearningLevel } from "../models/user.js";

const profileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(100).optional(),
      email: z
        .string()
        .trim()
        .email()
        .max(254)
        .transform((email) => email.toLowerCase())
        .optional(),
      timezone: z.string().trim().min(1).max(100).optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one profile field must be provided.",
    }),
});

const passwordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1)
      .max(72)
      .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
    newPassword: z
      .string()
      .min(8)
      .max(72)
      .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
        message: "Password must be at most 72 bytes.",
      }),
  }),
});

type ProfileInput = z.infer<typeof profileSchema>["body"];
type PasswordInput = z.infer<typeof passwordSchema>["body"];

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

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.patch(
  "/me",
  validate(profileSchema),
  asyncHandler(async (_req, res) => {
    const body = getBody<ProfileInput>(res);
    try {
      const user = await User.findByIdAndUpdate(
        res.locals.auth?.userId,
        { $set: body },
        { returnDocument: "after", runValidators: true }
      );
      if (!user) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
      }
      res.json({ user: publicUser(user) });
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
  })
);

usersRouter.post(
  "/me/password",
  validate(passwordSchema),
  asyncHandler(async (_req, res) => {
    const body = getBody<PasswordInput>(res);
    const user = await User.findById(res.locals.auth?.userId).select("+passwordHash");
    if (!user) {
      throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
    }

    if (!(await bcrypt.compare(body.currentPassword, user.passwordHash))) {
      throw new HttpError(
        400,
        "INVALID_CURRENT_PASSWORD",
        "Current password is incorrect."
      );
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await User.updateOne({ _id: user.id }, { $set: { passwordHash } });
    clearAuthCookie(res);
    res.json({
      message: "Password updated successfully.",
    });
  })
);
