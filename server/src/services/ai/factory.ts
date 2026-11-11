import { env } from "../../config/env.js";
import { createCopilotProvider } from "./copilot.js";
import { createGeminiProvider } from "./gemini.js";
import type { AiProvider } from "./provider.js";

type CopilotProvider = ReturnType<typeof createCopilotProvider>;
let copilotProvider: CopilotProvider | undefined;

export function createAiProvider(): AiProvider {
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
