import { env } from "../../config/env.js";
import { createGeminiProvider } from "./gemini.js";
import type { AiProvider } from "./provider.js";

export function createAiProvider(): AiProvider {
  switch (env.AI_PROVIDER) {
    case "gemini":
      return createGeminiProvider();
  }
}
