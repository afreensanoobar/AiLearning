import { createHash } from "node:crypto";
import { Schema, model } from "mongoose";

interface AiCacheFields {
  key: string;
  value: string;
  createdAt: Date;
}

const aiCacheSchema = new Schema<AiCacheFields>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 86400 },
});

export const AiCache = model<AiCacheFields>("AiCache", aiCacheSchema);

export function createAiCacheKey(feature: string, value: unknown) {
  return createHash("sha256").update(JSON.stringify({ feature, value })).digest("hex");
}
