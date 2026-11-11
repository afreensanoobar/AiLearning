import { HttpError } from "../../middleware/http-error.js";
export async function generateValidatedJson(gateway, feature, request, schema) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
        const retryRequest = attempt === 0
            ? request
            : {
                ...request,
                messages: [
                    ...request.messages,
                    {
                        role: "user",
                        content: "The previous response was invalid. Return only valid JSON matching the requested schema.",
                    },
                ],
            };
        const result = await gateway.generate(attempt === 0 ? feature : `${feature}-retry`, retryRequest);
        try {
            const validated = schema.safeParse(JSON.parse(result.text));
            if (validated.success)
                return validated.data;
        }
        catch {
            // Retry malformed JSON once, then return a consistent API error.
        }
    }
    throw new HttpError(502, "AI_INVALID_RESPONSE", "AI returned an invalid response. Please try again.");
}
