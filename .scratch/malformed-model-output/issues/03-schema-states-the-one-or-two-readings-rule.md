# 03: The model's schema states the one-or-two Readings rule

**What to build:** The structured-output schema sent with every analysis says a Risk flag has at least one Reading and at most two, the same rule the parser already enforces, so a model that honors the schema can no longer produce the malformed flag behind finding 6. The request goes to one provider in strict mode with `require_parameters`, so a live smoke run must confirm the provider accepts the limit before this merges. See the spec: `.scratch/malformed-model-output/spec.md`.

**Blocked by:** 01 (An analysis recovers from one malformed reply), so the retry is in place if the provider turns out to reject the limit

**Status:** ready-for-agent

- [x] The Risk flag's Readings in the analysis request's schema are limited to one or two items; the description text stays
- [x] A test asserts the analysis request's schema carries the limit
- [x] A live smoke run against the configured model confirms the provider accepts the request and returns a report
- [ ] If the provider rejects the limit, the keywords are removed, the retry from 01 is left to handle it, and the reason is recorded in this ticket's Comments
- [x] `npm run typecheck`, `npm test` and `npm run build` pass

## Comments

2026-10-06: `npm run smoke` accepted the schema with `minItems: 1` and `maxItems: 2` on `readings`. The provider returned a report from `z-ai/glm-5.3-flash` with 8 Risk flags, all passing citation verification, each with one Reading except one with two. The rejection fallback was not needed, so the keywords stay. The test is `tests/analysis-schema.test.ts`, covering the schema with and without a free-text Red line.
