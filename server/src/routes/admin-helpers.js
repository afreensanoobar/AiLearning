import { z } from "zod";
import { HttpError } from "../middleware/http-error.js";
export const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const idParams = z.object({ params: z.object({ id: objectId }) });
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function getValidated(res) {
    return res.locals.validated;
}
export function isDuplicateKeyError(error) {
    return (typeof error === "object" && error !== null && "code" in error && error.code === 11000);
}
export function documentId(document) {
    return document.id ?? document._id?.toString() ?? "";
}
export function notFound(code, message) {
    throw new HttpError(404, code, message);
}
