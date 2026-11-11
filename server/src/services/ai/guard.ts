import { AiError } from "./provider.js";
import type { AiMessage } from "./provider.js";

const maxInputLength = 1000;

function stripControlCharacters(value: string) {
  return Array.from(value)
    .filter((character) => {
      const code = character.codePointAt(0)!;
      return !(
        code <= 8 ||
        code === 11 ||
        code === 12 ||
        (code >= 14 && code <= 31) ||
        code === 127
      );
    })
    .join("");
}

export function guardInput(value: string) {
  const cleaned = stripControlCharacters(value).trim();
  if (!cleaned) {
    throw new AiError("INVALID_AI_INPUT", "Message cannot be empty.", 400);
  }
  return cleaned.slice(0, maxInputLength);
}

export function guardHistory(messages: AiMessage[]) {
  const guarded = messages
    .slice(-10)
    .map((message) => ({ ...message, content: guardInput(message.content) }));
  if (guarded.length === 0) {
    throw new AiError("AI_UNAVAILABLE", "Message history cannot be empty.", 400);
  }
  return guarded;
}
