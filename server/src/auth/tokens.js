import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
function durationInSeconds(duration) {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) {
        throw new Error("Invalid JWT duration configuration.");
    }
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    const value = Number(match[1]) * multipliers[match[2]];
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error("Invalid JWT duration configuration.");
    }
    return value;
}
export const authTokenLifetime = durationInSeconds(env.JWT_TTL);
export function createAuthToken(user) {
    return jwt.sign({ role: user.role }, env.JWT_SECRET, {
        subject: user.id,
        expiresIn: authTokenLifetime,
    });
}
export function verifyAuthToken(token) {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string" ||
        typeof payload.sub !== "string" ||
        (payload.role !== "student" && payload.role !== "admin")) {
        throw new Error("Invalid authentication token.");
    }
    return {
        sub: payload.sub,
        role: payload.role,
    };
}
