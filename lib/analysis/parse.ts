// Checks the model's structured output. The model client vouches for
// nothing, so anything that does not match what the prompt asked for fails
// the whole analysis: a partial Report is never returned.

export type ModelAnalysis = { summary: string };

export class MalformedModelOutput extends Error {
  constructor(problem: string) {
    super(`The model's output was malformed: ${problem}`);
    this.name = "MalformedModelOutput";
  }
}

export function parseAnalysis(data: unknown): ModelAnalysis {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new MalformedModelOutput("expected an object");
  }
  const { summary } = data as Record<string, unknown>;
  if (typeof summary !== "string") throw new MalformedModelOutput("summary is missing or not text");
  if (!summary.trim()) throw new MalformedModelOutput("summary is empty");
  return { summary };
}
