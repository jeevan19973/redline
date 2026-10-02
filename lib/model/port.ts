// The model client port: the one way the Analysis module talks to a model.
// It asks for structured JSON that matches a JSON schema and gets back the
// parsed value, untrusted, plus the id of the model that produced it. The
// Analysis module validates `data` itself; nothing here vouches for its shape.
//
// Two implementations: the OpenRouter adapter (openrouter.ts) for the app and
// the smoke run, and a scripted fake in tests/support for the test suite.
//
// Everything under lib/model/ and lib/analysis/ runs under plain Node as well
// as Next, so it uses relative imports with explicit .ts extensions and only
// erasable TypeScript syntax.

// A JSON schema object, passed through to the model provider as is.
export type JsonSchema = { readonly [key: string]: unknown };

export type ModelRequest = {
  // Names the structured output, as the provider's json_schema `name`.
  // Letters, digits, underscores and hyphens only.
  name: string;
  system: string;
  user: string;
  schema: JsonSchema;
};

export type ModelResponse = {
  // The parsed JSON the model returned. Not yet checked against the schema.
  data: unknown;
  // The model that answered, as the provider reported it.
  modelId: string;
};

export interface ModelClient {
  complete(request: ModelRequest): Promise<ModelResponse>;
}
