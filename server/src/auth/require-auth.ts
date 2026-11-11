import type { RequestHandler } from "express";
import { HttpError } from "../middleware/http-error.js";
import type { UserRole } from "../models/user.js";
import { verifyAccessToken } from "./tokens.js";

export interface AuthContext {
  userId: string;
  role: UserRole;
}

declare module "express-serve-static-core" {
  interface Locals {
    auth?: AuthContext;
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return next(new HttpError(401, "UNAUTHORIZED", "Authentication is required."));
  }

  try {
    const payload = verifyAccessToken(match[1]);
    res.locals.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, "UNAUTHORIZED", "Authentication is required."));
  }
};

export function requireRole(role: UserRole): RequestHandler {
  return (_req, res, next) => {
    if (!res.locals.auth) {
      return next(new HttpError(401, "UNAUTHORIZED", "Authentication is required."));
    }
    if (res.locals.auth.role !== role) {
      return next(new HttpError(403, "FORBIDDEN", "Access is forbidden."));
    }
    next();
  };
}
