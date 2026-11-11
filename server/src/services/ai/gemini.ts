import { env } from "../../config/env.js";
import { AiError } from "./provider.js";
import type { AiProvider, AiRequest, AiResult } from "./provider.js";

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
}

interface GeminiOptions {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

function mapHttpError(status: number) {
  return status === 429
    ? new AiError(
        "AI_RATE_LIMITED",
        "AI service rate limit reached. Try again later.",
        429
      )
    : new AiError("AI_UNAVAILABLE", "AI service is temporarily unavailable.", 503);
}

function getText(payload: GeminiResponse) {
  return payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
}

function requestBody(request: AiRequest) {
  return {
    systemInstruction: { parts: [{ text: request.system }] },
    contents: request.messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
    generationConfig: {
      ...(request.maxTokens === undefined ? {} : { maxOutputTokens: request.maxTokens }),
      ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
      ...(request.json ? { responseMimeType: "application/json" } : {}),
    },
  };
}

export function createGeminiProvider(options: GeminiOptions = {}): AiProvider {
  const apiKey = options.apiKey ?? env.AI_API_KEY;
  const model = options.model ?? "gemini-flash-latest";
  const timeoutMs = options.timeoutMs ?? env.AI_TIMEOUT_MS;
  const fetcher = options.fetcher ?? fetch;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`;

  async function fetchResponse(
    action: "generateContent" | "streamGenerateContent",
    request: AiRequest
  ) {
    if (!apiKey) {
      throw new AiError("AI_UNAVAILABLE", "AI is not configured.", 503);
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const abortFromCaller = () => controller.abort(request.signal?.reason);
      if (request.signal?.aborted) {
        abortFromCaller();
      } else {
        request.signal?.addEventListener("abort", abortFromCaller, { once: true });
      }

      try {
        const url =
          action === "streamGenerateContent"
            ? `${endpoint}:${action}?alt=sse`
            : `${endpoint}:${action}`;
        const response = await fetcher(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(requestBody(request)),
          signal: controller.signal,
        });
        if (response.status >= 500 && attempt === 0) {
          await response.body?.cancel();
          clearTimeout(timeout);
          request.signal?.removeEventListener("abort", abortFromCaller);
          continue;
        }
        if (!response.ok) throw mapHttpError(response.status);
        return {
          response,
          timeout,
          cleanup: () => {
            clearTimeout(timeout);
            request.signal?.removeEventListener("abort", abortFromCaller);
          },
        };
      } catch (error) {
        clearTimeout(timeout);
        request.signal?.removeEventListener("abort", abortFromCaller);
        if (error instanceof AiError) throw error;
        if (request.signal?.aborted) throw error;
        throw new AiError(
          "AI_UNAVAILABLE",
          "AI service is temporarily unavailable.",
          503
        );
      }
    }
    throw new AiError("AI_UNAVAILABLE", "AI service is temporarily unavailable.", 503);
  }

  return {
    async generate(request): Promise<AiResult> {
      const result = await fetchResponse("generateContent", request);
      try {
        const payload = (await result.response.json()) as GeminiResponse;
        const text = getText(payload);
        if (text === undefined) {
          throw new AiError("AI_UNAVAILABLE", "AI returned an empty response.", 503);
        }
        return {
          text,
          usage: {
            inputTokens: payload.usageMetadata?.promptTokenCount,
            outputTokens: payload.usageMetadata?.candidatesTokenCount,
          },
        };
      } catch (error) {
        if (error instanceof AiError) throw error;
        throw new AiError("AI_UNAVAILABLE", "AI returned an invalid response.", 503);
      } finally {
        result.cleanup();
      }
    },

    async *stream(request) {
      const result = await fetchResponse("streamGenerateContent", request);
      try {
        if (!result.response.body) {
          throw new AiError("AI_UNAVAILABLE", "AI returned an empty response.", 503);
        }
        const reader = result.response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            const text = getText(JSON.parse(data) as GeminiResponse);
            if (text) yield text;
          }
          if (done) break;
        }
      } catch (error) {
        if (error instanceof AiError) throw error;
        if (request.signal?.aborted) throw error;
        throw new AiError("AI_UNAVAILABLE", "AI stream was interrupted.", 503);
      } finally {
        result.cleanup();
      }
    },
  };
}
