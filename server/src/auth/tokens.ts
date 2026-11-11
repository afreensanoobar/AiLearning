import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../models/user.js";

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

function durationInSeconds(duration: string) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) {
    throw new Error("Invalid token duration configuration.");
  }
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 } as const;
  const unit = match[2] as keyof typeof multipliers;
  const value = Number(match[1]) * multipliers[unit];
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("Invalid token duration configuration.");
  }
  return value;
}

export const accessTokenLifetime = durationInSeconds(env.ACCESS_TOKEN_TTL);
export const refreshTokenLifetime = durationInSeconds(env.REFRESH_TOKEN_TTL);

export function createAccessToken(user: { id: string; role: UserRole }) {
  return jwt.sign({ role: user.role, type: "access" }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: accessTokenLifetime,
  });
}

export function createRefreshToken(userId: string) {
  return jwt.sign({ type: "refresh" }, env.JWT_REFRESH_SECRET, {
    subject: userId,
    expiresIn: refreshTokenLifetime,
    jwtid: randomBytes(16).toString("hex"),
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (
    typeof payload === "string" ||
    payload.type !== "access" ||
    typeof payload.sub !== "string" ||
    (payload.role !== "student" && payload.role !== "admin")
  ) {
    throw new Error("Invalid access token.");
  }
  return {
    sub: payload.sub,
    role: payload.role,
    type: "access",
  };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (
    typeof payload === "string" ||
    payload.type !== "refresh" ||
    typeof payload.sub !== "string"
  ) {
    throw new Error("Invalid refresh token.");
  }
  return {
    sub: payload.sub,
    type: "refresh",
  };
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
