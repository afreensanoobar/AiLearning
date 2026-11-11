import { HttpError } from "./http-error.js";
export const notFoundHandler = (req, _res, next) => {
    next(new HttpError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.path}`));
};
