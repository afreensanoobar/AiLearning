import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { User } from "../models/user.js";
import { authCookieName } from "./cookies.js";
import { verifyAuthToken } from "./tokens.js";
export const requireAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.[authCookieName];
    if (typeof token !== "string") {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
    }
    let payload;
    try {
        payload = verifyAuthToken(token);
    }
    catch {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
    }
    const user = await User.findById(payload.sub).select("role deactivated");
    if (!user || user.deactivated) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
    }
    res.locals.auth = { userId: user.id, role: user.role };
    next();
});
export function requireRole(role) {
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
