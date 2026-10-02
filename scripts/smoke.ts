// npm run smoke: one real analysis of the adhesion-contract fixture, through
// the real Analysis module and the real OpenRouter adapter, with no Red
// lines. It runs under plain Node 24 (type stripping, no extra packages) and
// reads OPENROUTER_API_KEY and OPENROUTER_MODEL from .env.local when present.
// It makes one paid model call, plus one more for each flag whose Source
// sentences fail verification, whose Non-negotiable basis fails it, or that
// came back negotiable with no Counter-offer.

import { readFileSync } from "node:fs";
import { analyzeDraft, clauseTypeLabel } from "../lib/analysis/index.ts";
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
  console.log(`Risk flags (${report.riskFlags.length}):`);
  report.riskFlags.forEach((flag, index) => {
    const name =
      flag.clauseType === "redLine" ? `Red line ${JSON.stringify(flag.crossesRedLine.text)}` : clauseTypeLabel(flag.clauseType);
    console.log(`\n${index + 1}. ${flag.severity}: ${name} (${flag.clauseType})`);
    for (const reading of flag.readings) console.log(`   Reading: ${reading}`);
    for (const sentence of flag.sourceSentences) {
      console.log(`   Source sentence at offset ${sentence.offset}: ${JSON.stringify(sentence.text)}`);
    }
    if (flag.negotiability === "nonNegotiable") {
      const { offset, text: basis } = flag.nonNegotiableBasis;
      console.log(`   Negotiability: Non-negotiable (take it or leave it), no Counter-offer`);
      console.log(`   Basis at offset ${offset}: ${JSON.stringify(basis)}`);
    } else {
      console.log(`   Negotiability: negotiable`);
      console.log(`   Counter-offer: ${flag.counterOffer ? JSON.stringify(flag.counterOffer) : "none (see Counter-offer gaps)"}`);
    }
  });

  const failures = report.citationFailures;
  const flagFailures = failures.filter((failure) => "flag" in failure);
  console.log(`\nFlags proposed: ${report.riskFlags.length + flagFailures.length}`);
  console.log(`Flags that passed citation verification: ${report.riskFlags.length}`);
  console.log(`Citation failures (withheld, never shown to the Signer): ${failures.length}`);
  for (const failure of failures) {
    const what =
      "flag" in failure
        ? failure.flag.clauseType
        : "nonNegotiableBasis" in failure
          ? `Non-negotiable basis on a ${failure.nonNegotiableBasis.flag.clauseType} flag (shown as negotiable)`
          : "guaranty gap";
    console.log(`\n- ${what}, after ${failure.attempts} attempts`);
    for (const sentence of failure.failedSentences) console.log(`   Not in the text: ${JSON.stringify(sentence)}`);
  }

  console.log(`\nCounter-offer gaps (negotiable flags shown without one): ${report.counterOfferGaps.length}`);
  for (const gap of report.counterOfferGaps) {
    console.log(`- ${gap.flag.clauseType}, after ${gap.attempts} attempts`);
  }

  if (report.guarantyGap) {
    const { statement, sourceSentence } = report.guarantyGap;
    console.log(`\nGuaranty gap:\n${statement}`);
    console.log(`   Source sentence at offset ${sourceSentence.offset}: ${JSON.stringify(sourceSentence.text)}`);
  } else {
    console.log("\nGuaranty gap: none");
  }

  if (report.cleanVerdict) {
    const { title, statement, notes, checked } = report.cleanVerdict;
    console.log(`\nClean verdict: ${title}\n${statement}`);
    for (const note of notes) console.log(note);
    for (const line of checked) {
      console.log(`   ${clauseTypeLabel(line.clauseType)}: ${line.checked ? "checked" : "not checked"}`);
    }
  } else {
    console.log("\nClean verdict: none");
  }

  console.log(`\nScope stamp:\n${report.scopeStamp}`);
} catch (error) {
  console.error(`The smoke run failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
