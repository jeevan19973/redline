import type { ModelClient, ModelRequest } from "../model/port.ts";
import { MalformedModelOutput } from "./parse.ts";

// Sends a main request (the analysis or a question) and parses the reply.
// A reply the parser rejects as malformed is discarded whole and the same
// request is sent once more; a second malformed reply rejects. Errors from
// the model client itself (timeouts, provider errors, content that is not
// JSON) are not retried, so a slow provider never doubles the wait
// (.scratch/malformed-model-output/spec.md, FINDINGS.md finding 6). This is
// separate from the regeneration calls in citations.ts, which ask again for
// a quotation that did not match the text.
export async function completeAndParse<T>(
  modelClient: ModelClient,
  request: ModelRequest,
  parse: (data: unknown) => T,
): Promise<{ parsed: T; modelId: string }> {
  try {
    return await attempt(modelClient, request, parse);
  } catch (error) {
    if (!(error instanceof MalformedModelOutput)) throw error;
    return attempt(modelClient, request, parse);
  }
}

async function attempt<T>(
  modelClient: ModelClient,
  request: ModelRequest,
  parse: (data: unknown) => T,
): Promise<{ parsed: T; modelId: string }> {
  const { data, modelId } = await modelClient.complete(request);
  return { parsed: parse(data), modelId };
}
