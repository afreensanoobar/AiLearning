import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
config({
    path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env"),
    quiet: true,
});
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    MONGODB_URI: z
        .string()
        .trim()
        .regex(/^mongodb(?:\+srv)?:\/\//, "Must be a MongoDB connection URI."),
    CLIENT_URL: z
        .string()
        .url()
        .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Must use HTTP or HTTPS."),
    JWT_SECRET: z.string().min(32),
    JWT_TTL: z
        .string()
        .regex(/^\d+[smhd]$/)
        .default("7d"),
    AI_PROVIDER: z.enum(["copilot", "gemini"]).default("copilot"),
    COPILOT_GITHUB_TOKEN: z.string().optional(),
    AI_API_KEY: z.string().optional(),
    AI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(120000),
});
const result = envSchema.safeParse(process.env);
if (!result.success) {
    const issues = result.error.issues
        .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
        .join("; ");
    throw new Error(`Invalid server environment: ${issues}`);
}
export const env = result.data;
