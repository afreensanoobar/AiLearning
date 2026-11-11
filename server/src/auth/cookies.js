import { env } from "../config/env.js";
import { authTokenLifetime } from "./tokens.js";
export const authCookieName = "learnai_auth";
function authCookieOptions() {
    return {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api",
        maxAge: authTokenLifetime * 1000,
    };
}
export function setAuthCookie(res, token) {
    res.cookie(authCookieName, token, authCookieOptions());
}
export function clearAuthCookie(res) {
    const options = authCookieOptions();
    delete options.maxAge;
    res.clearCookie(authCookieName, options);
}
