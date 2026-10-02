// npm run smoke: one real analysis of the adhesion-contract fixture, through
// the real Analysis module and the real OpenRouter adapter, with no Red
// lines. It runs under plain Node 24 (type stripping, no extra packages) and
// reads OPENROUTER_API_KEY and OPENROUTER_MODEL from .env.local when present.
// It makes one paid model call.

import { readFileSync } from "node:fs";
import { analyzeDraft } from "../lib/analysis/index.ts";
import { openRouterClient } from "../lib/model/openrouter.ts";

if (!process.env.OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY is not set, so the smoke run cannot call the model. Add it to .env.local.");
  process.exit(1);
}

const text = readFileSync(new URL("../tests/fixtures/adhesion-contract.txt", import.meta.url), "utf8");

try {
  const report = await analyzeDraft(text, [], openRouterClient());
  console.log(`Model: ${report.modelId}\n`);
  console.log(`Summary:\n${report.summary}\n`);
  console.log(`Scope stamp:\n${report.scopeStamp}`);
} catch (error) {
  console.error(`The smoke run failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
