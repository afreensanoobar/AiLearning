import { z } from "zod";
import { HttpError } from "../middleware/http-error.js";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const idParams = z.object({ params: z.object({ id: objectId }) });
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function getValidated<T>(res: { locals: Record<string, unknown> }) {
  return res.locals.validated as T;
}

export function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" && error !== null && "code" in error && error.code === 11000
  );
}

export function documentId(document: { id?: string; _id?: { toString(): string } }) {
  return document.id ?? document._id?.toString() ?? "";
}

export function notFound(code: string, message: string): never {
  throw new HttpError(404, code, message);
}
