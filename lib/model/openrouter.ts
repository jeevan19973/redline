import type { ModelClient, ModelRequest, ModelResponse } from "./port.ts";

// The OpenRouter adapter for the model client port. Server-only: it reads
// OPENROUTER_API_KEY, which must never reach the browser, so nothing marked
// "use client" may import this file. It does not import "server-only"
// because the smoke script runs it under plain Node, which cannot resolve
// that package.
//
// The model id comes from OPENROUTER_MODEL and nowhere else (CLAUDE.md).
// Both variables are read on each call, not at import, so a copy with no key
// still starts and fails only when an analysis is asked for.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

// How long one call may take before it is abandoned as failed.
const TIMEOUT_MS = 120_000;

export class ModelClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelClientError";
  }
}

export function openRouterClient(): ModelClient {
  return { complete };
}

async function complete({ name, system, user, schema }: ModelRequest): Promise<ModelResponse> {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!key) throw new ModelClientError("OPENROUTER_API_KEY is not set. See .env.example.");
  if (!model) throw new ModelClientError("OPENROUTER_MODEL is not set. See .env.example.");

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        // One provider, no fallbacks, and only one that honors every
        // parameter below, so the structured output is never silently dropped.
        provider: { order: ["fireworks"], allow_fallbacks: false, require_parameters: true },
        reasoning: { effort: "low" },
        response_format: {
          type: "json_schema",
          json_schema: { name, strict: true, schema },
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new ModelClientError(`OpenRouter request failed: ${describe(error)}`);
  }

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 500);
    throw new ModelClientError(`OpenRouter returned ${response.status}: ${detail || response.statusText}`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new ModelClientError(`OpenRouter returned a body that is not JSON: ${describe(error)}`);
  }

  // OpenRouter can report a provider error inside a 200 response.
  const error = field(body, "error");
  if (error !== undefined) {
    const message = field(error, "message");
    throw new ModelClientError(
      `OpenRouter reported an error: ${typeof message === "string" ? message : JSON.stringify(error)}`,
    );
  }

  const choices = field(body, "choices");
  const first = Array.isArray(choices) ? choices[0] : undefined;
  const content = field(field(first, "message"), "content");
  if (typeof content !== "string" || !content.trim()) {
    const finish = field(first, "finish_reason");
    throw new ModelClientError(`OpenRouter returned no content (finish reason: ${String(finish)}).`);
  }

  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw new ModelClientError("OpenRouter returned content that is not JSON.");
  }

  const reported = field(body, "model");
  return { data, modelId: typeof reported === "string" && reported ? reported : model };
}

// One property of a value that may not be an object.
function field(value: unknown, key: string): unknown {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>)[key] : undefined;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
