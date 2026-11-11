import { CopilotClient, } from "@github/copilot-sdk";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { AiError } from "./provider.js";
function mapError(error) {
    const message = error instanceof Error ? error.message : "";
    return /rate.?limit|too many requests|\b429\b/i.test(message)
        ? new AiError("AI_RATE_LIMITED", "AI service rate limit reached. Try again later.", 429)
        : new AiError("AI_UNAVAILABLE", "AI service is temporarily unavailable.", 503);
}
function getAssistantText(response) {
    if (!response || typeof response !== "object")
        return undefined;
    const data = response.data;
    if (!data || typeof data !== "object")
        return undefined;
    const content = data.content;
    return typeof content === "string" ? content : undefined;
}
function formatConversation(request) {
    return request.messages
        .map(({ role, content }) => `${role === "assistant" ? "Tutor" : "Learner"}: ${content}`)
        .join("\n\n");
}
export function createCopilotProvider(options = {}) {
    const token = options.token?.trim() ||
        env.COPILOT_GITHUB_TOKEN?.trim() ||
        process.env.GH_TOKEN?.trim() ||
        process.env.GITHUB_TOKEN?.trim();
    const clientOptions = token ? { gitHubToken: token } : {};
    const clientFactory = options.clientFactory ??
        (() => {
            const sdkClient = new CopilotClient(clientOptions);
            return {
                start: () => sdkClient.start(),
                async createSession(config) {
                    const session = await sdkClient.createSession(config);
                    return {
                        sessionId: session.sessionId,
                        sendAndWait: (message, timeout) => session.sendAndWait(message, timeout),
                        on: (eventType, handler) => session.on(eventType, handler),
                        abort: () => session.abort(),
                    };
                },
                deleteSession: (sessionId) => sdkClient.deleteSession(sessionId),
                stop: () => sdkClient.stop(),
            };
        });
    const timeoutMs = options.timeoutMs ?? env.AI_TIMEOUT_MS;
    let clientPromise;
    function getClient() {
        if (clientPromise)
            return clientPromise;
        const client = clientFactory();
        const pending = client
            .start()
            .then(() => client)
            .catch((error) => {
            clientPromise = undefined;
            throw mapError(error);
        });
        clientPromise = pending;
        return pending;
    }
    async function createSession(request, streaming) {
        if (request.signal?.aborted) {
            throw request.signal.reason ?? new Error("AI request was cancelled.");
        }
        const client = await getClient();
        try {
            const session = await client.createSession({
                model: "auto",
                clientName: "learnai-server",
                systemMessage: { mode: "append", content: request.system },
                availableTools: [],
                enableSessionStore: false,
                streaming,
                includeSubAgentStreamingEvents: false,
            });
            return { client, session };
        }
        catch (error) {
            throw mapError(error);
        }
    }
    function attachAbortHandler(request, session) {
        let abortFailure;
        let abortPromise;
        const abort = () => {
            abortPromise = session.abort().catch((error) => {
                abortFailure = error;
            });
        };
        if (request.signal?.aborted)
            abort();
        else
            request.signal?.addEventListener("abort", abort, { once: true });
        return {
            remove() {
                request.signal?.removeEventListener("abort", abort);
            },
            get failure() {
                return abortFailure;
            },
            get promise() {
                return abortPromise;
            },
        };
    }
    async function deleteSession(client, sessionId, operationFailed) {
        try {
            await client.deleteSession(sessionId);
        }
        catch {
            logger.error("Copilot session cleanup failed");
            if (!operationFailed) {
                throw new AiError("AI_UNAVAILABLE", "AI session cleanup failed.", 503);
            }
        }
    }
    return {
        async generate(request) {
            const { client, session } = await createSession(request, false);
            const abort = attachAbortHandler(request, session);
            let operationFailed = false;
            try {
                const response = await session.sendAndWait({ prompt: formatConversation(request) }, timeoutMs);
                if (request.signal?.aborted) {
                    throw (request.signal.reason ??
                        abort.failure ??
                        new Error("AI request was cancelled."));
                }
                const text = getAssistantText(response);
                if (text === undefined) {
                    throw new AiError("AI_UNAVAILABLE", "AI returned an empty response.", 503);
                }
                return { text };
            }
            catch (error) {
                operationFailed = true;
                if (request.signal?.aborted)
                    throw request.signal.reason ?? error;
                if (error instanceof AiError)
                    throw error;
                throw mapError(abort.failure ?? error);
            }
            finally {
                abort.remove();
                await abort.promise;
                await deleteSession(client, session.sessionId, operationFailed);
            }
        },
        async *stream(request) {
            const { client, session } = await createSession(request, true);
            const abort = attachAbortHandler(request, session);
            const chunks = [];
            let wake;
            let finished = false;
            let operationFailed = false;
            let failure;
            let finalText;
            let emittedChunk = false;
            const unsubscribe = session.on("assistant.message_delta", (event) => {
                if (event.data.deltaContent) {
                    chunks.push(event.data.deltaContent);
                    wake?.();
                }
            });
            const completion = session
                .sendAndWait({ prompt: formatConversation(request) }, timeoutMs)
                .then((response) => {
                finalText = getAssistantText(response);
                finished = true;
                wake?.();
            }, (error) => {
                failure = error;
                finished = true;
                wake?.();
            });
            try {
                while (!finished || chunks.length > 0) {
                    if (chunks.length > 0) {
                        emittedChunk = true;
                        yield chunks.shift();
                        continue;
                    }
                    await new Promise((resolve) => {
                        wake = resolve;
                        if (finished || chunks.length > 0) {
                            wake = undefined;
                            resolve();
                        }
                    });
                    wake = undefined;
                }
                await completion;
                if (request.signal?.aborted) {
                    throw (request.signal.reason ??
                        abort.failure ??
                        new Error("AI request was cancelled."));
                }
                if (failure !== undefined)
                    throw mapError(abort.failure ?? failure);
                if (finalText === undefined) {
                    throw new AiError("AI_UNAVAILABLE", "AI returned an empty response.", 503);
                }
                if (!emittedChunk)
                    yield finalText;
            }
            catch (error) {
                operationFailed = true;
                if (request.signal?.aborted)
                    throw request.signal.reason ?? error;
                if (error instanceof AiError)
                    throw error;
                throw mapError(error);
            }
            finally {
                unsubscribe();
                abort.remove();
                if (!finished) {
                    await session.abort().catch(() => {
                        operationFailed = true;
                    });
                    await completion;
                }
                await abort.promise;
                await deleteSession(client, session.sessionId, operationFailed);
            }
        },
        async shutdown() {
            const pendingClient = clientPromise;
            clientPromise = undefined;
            if (!pendingClient)
                return [];
            return (await pendingClient).stop();
        },
    };
}
