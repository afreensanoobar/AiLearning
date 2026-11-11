import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";
import { refreshTokenLifetime } from "./tokens.js";

export const refreshCookieName = "learnai_refresh";

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: refreshTokenLifetime * 1000,
  };
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(refreshCookieName, token, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(refreshCookieName, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
}
