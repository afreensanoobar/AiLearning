import { env } from "../../config/env.js";
import { createCopilotProvider } from "./copilot.js";
import { createGeminiProvider } from "./gemini.js";
let copilotProvider;
export function createAiProvider() {
    switch (env.AI_PROVIDER) {
        case "copilot":
            copilotProvider ??= createCopilotProvider();
            return copilotProvider;
        case "gemini":
            return createGeminiProvider();
    }
}
export async function shutdownAiProvider() {
    const provider = copilotProvider;
    copilotProvider = undefined;
    return provider?.shutdown() ?? [];
}
