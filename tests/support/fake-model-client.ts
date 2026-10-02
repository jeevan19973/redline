import type { ModelClient, ModelRequest, ModelResponse } from "../../lib/model/port.ts";

// The model id the fake reports. Deliberately not a real model's id.
export const FAKE_MODEL_ID = "fake/scripted-model";

// One scripted reply: structured output (with the model id to report), an
// error to throw, or a function of the request for a reply that depends on it.
export type ScriptedReply =
  | { data: unknown; modelId?: string }
  | { error: Error }
  | ((request: ModelRequest) => ModelResponse | Promise<ModelResponse>);

export type FakeModelClient = ModelClient & {
  // How many calls the Analysis module has made so far.
  readonly calls: number;
};

// A model client that answers each call with the next scripted reply, in
// order, and fails any call beyond the script so an unexpected extra model
// call cannot pass unnoticed. This is the spec's one allowed fake.
export function fakeModelClient(...replies: ScriptedReply[]): FakeModelClient {
  const script = [...replies];
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    async complete(request) {
      calls += 1;
      const reply = script.shift();
      if (reply === undefined) throw new Error(`Unscripted model call ${calls} (${request.name}).`);
      if (typeof reply === "function") return reply(request);
      if ("error" in reply) throw reply.error;
      return { data: reply.data, modelId: reply.modelId ?? FAKE_MODEL_ID };
    },
  };
}
