export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiRequest {
  system: string;
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
  signal?: AbortSignal;
}

export interface AiUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface AiResult {
  text: string;
  usage?: AiUsage;
}

export interface AiProvider {
  generate(request: AiRequest): Promise<AiResult>;
  stream(request: AiRequest): AsyncIterable<string>;
}

export class AiError extends Error {
  constructor(
    public readonly code: "AI_UNAVAILABLE" | "AI_RATE_LIMITED" | "INVALID_AI_INPUT",
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AiError";
  }
}
