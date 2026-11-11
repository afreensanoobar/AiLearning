import { logger } from "../../lib/logger.js";
import { AiCache, createAiCacheKey } from "./cache.js";
import { createAiProvider } from "./factory.js";
const databaseCache = {
    async get(key) {
        const entry = await AiCache.findOne({ key }).select("value").lean();
        return entry?.value ?? null;
    },
    async set(key, value) {
        await AiCache.updateOne({ key }, { $set: { value, createdAt: new Date() } }, { upsert: true });
    },
};
export function createAiGateway(provider = createAiProvider(), cache = databaseCache) {
    return {
        async generate(feature, request, cacheKey) {
            const startedAt = Date.now();
            const key = cacheKey ?? createAiCacheKey(feature, request);
            let cached = false;
            let usage;
            try {
                const cachedValue = await cache.get(key);
                if (cachedValue !== null) {
                    cached = true;
                    return { text: cachedValue };
                }
                const result = await provider.generate(request);
                await cache.set(key, result.text);
                usage = result.usage;
                return result;
            }
            finally {
                logger.info({
                    feature,
                    cached,
                    inputTokens: usage?.inputTokens,
                    outputTokens: usage?.outputTokens,
                    durationMs: Date.now() - startedAt,
                }, "AI request completed");
            }
        },
        async *stream(feature, request) {
            const startedAt = Date.now();
            try {
                yield* provider.stream(request);
            }
            finally {
                logger.info({ feature, durationMs: Date.now() - startedAt }, "AI stream completed");
            }
        },
    };
}
export const ai = createAiGateway();
