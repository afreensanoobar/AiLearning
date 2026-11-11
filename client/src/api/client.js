const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
let unauthorizedHandler = () => {};

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) unauthorizedHandler();
  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || "The request failed.");
    error.status = response.status;
    error.code = payload?.error?.code;
    error.details = payload?.error?.details ?? [];
    throw error;
  }
  return payload;
}

export function apiPost(path, body) {
  return apiRequest(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiStream(path, body, { signal, onChunk, onDone }) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    credentials: "include",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 401) unauthorizedHandler();
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const error = new Error(payload?.error?.message || "The request failed.");
    error.status = response.status;
    error.code = payload?.error?.code;
    error.details = payload?.error?.details ?? [];
    throw error;
  }
  if (!response.body) throw new Error("Streaming is not supported by this browser.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "";
  let dataLines = [];
  const dispatch = () => {
    if (dataLines.length === 0) return;
    const payload = JSON.parse(dataLines.join("\n"));
    if (eventName === "chunk") onChunk?.(payload.text);
    if (eventName === "done") onDone?.(payload);
    eventName = "";
    dataLines = [];
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line) {
        dispatch();
      } else if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    if (done) break;
  }
  if (buffer) {
    if (buffer.startsWith("data:")) dataLines.push(buffer.slice(5).trimStart());
    dispatch();
  }
}
