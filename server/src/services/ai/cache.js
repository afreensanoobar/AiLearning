import { createHash } from "node:crypto";
import { Schema, model } from "mongoose";
const aiCacheSchema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 86400 },
});
export const AiCache = model("AiCache", aiCacheSchema);
export function createAiCacheKey(feature, value) {
    return createHash("sha256").update(JSON.stringify({ feature, value })).digest("hex");
}
