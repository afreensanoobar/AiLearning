import { z } from "zod";
import { HttpError } from "../../middleware/http-error.js";
import type { AiRequest } from "./provider.js";

interface AiGenerator {
  generate(
    feature: string,
    request: AiRequest,
    cacheKey?: string
  ): Promise<{ text: string }>;
}

export async function generateValidatedJson<T>(
  gateway: AiGenerator,
  feature: string,
  request: AiRequest,
  schema: z.ZodType<T>
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const retryRequest =
      attempt === 0
        ? request
        : {
            ...request,
            messages: [
              ...request.messages,
              {
                role: "user" as const,
                content:
                  "The previous response was invalid. Return only valid JSON matching the requested schema.",
              },
            ],
          };
    const result = await gateway.generate(
      attempt === 0 ? feature : `${feature}-retry`,
      retryRequest
    );

    try {
      const validated = schema.safeParse(JSON.parse(result.text));
      if (validated.success) return validated.data;
    } catch {
      // Retry malformed JSON once, then return a consistent API error.
    }
  }

  throw new HttpError(
    502,
    "AI_INVALID_RESPONSE",
    "AI returned an invalid response. Please try again."
  );
}
