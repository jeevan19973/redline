---
version: 1
slug: "landing-index-html"
primary_target: "landing/index.html"
related_targets: ["app/shell"]
---

# Surface brief: public landing page

Scope: the one public page at the site root (CLAUDE.md scope item 8, ADR 0007, ticket 16). Built today as a standalone static page under `landing/`, no dependencies, to be moved into the Next.js app by ticket 16.

Mode: Persuade.

Audience: the PRD's Signer, a US small business owner or independent operator at a desk, about to sign a commercial lease, a vendor or service contract, a freelance agreement they sign as the contractor, or a vendor's terms of service. Most arrive holding an invite code after a conversation with the owner.

Job: understand in seconds what Underline does, believe that every flag can be checked against their own copy, and try it on their own document.

One action: Try it on your document. It leads to sign-up with an invite code; the page says plainly that v1 is an invite-only beta.

Proof: a demonstration only. An example commercial lease written for the page, labeled as an example, turning into ranked flags that each quote the exact sentence they came from. No customers, quotes, prices, accuracy figures or comparisons exist, and none are invented.

Constraints: no verdict on whether to sign, never "safe to sign", no comparison to a lawyer, a "not legal advice" line, no scanned or photographed documents, no residential leases, no document types beyond the four. A plain data note: the file is read in the browser, the text is stored and sent through OpenRouter to a third-party model provider, with no promise about what that provider keeps. No analytics, no third-party scripts. WCAG 2.2 AA. US English, copy through the humanizer skill before commit. Red only on Dangerous; Clean verdict neutral, never green.

Chosen direction: Depth of Reach, from the bolder hand. Memorable moment: the lease floats at the waterline and its flagged sentences drop plumb lines to slates hanging at their depth, Caution above the thermocline and Dangerous below it.

ADR 0006 (revised 2026-10-01): everything the Signer reads is ink on paper. The page opens on paper and closes on paper; only the water between is ink-blue. Every quoted Source sentence sits on a paper slate, ink with an underline. The thermocline cyan is the one non-red brand accent.

Unresolved: final domain; where the sign-up route lives until tickets 01 and 17 exist (the action links to /sign-up as a placeholder).

## Direction contract

THESIS: Severity is depth. The page shows how far each clause reaches: Caution clauses cost the business and hang above the thermocline, Dangerous clauses reach past it to the Signer personally. It refuses the category default of a headline beside a framed screenshot and three feature cards.

OWN-WORLD: paper surface over stepped ink-blue water (shallow, cold, abyss), one thermocline cyan band as accent and action color, chalk marine-snow particles. Condensed technical caps for display, a monospace instrument face for clause cites and readouts, a plain grotesk for prose. Flags are paper slates: square corners, severity in words, sentence underlined, hung on a hairline plumb line.

STORY: the Signer sees a lease become ranked flags, learns that Dangerous means reaching past the business to them, sees every flag name its clause so they can find it in their own copy, reads what the product does not do and what happens to their document, and tries it with their invite code.

FIRST VIEWPORT: top band on paper: wordmark left, Sign in and the cyan action right. Surface zone: headline and subhead with the action on the left five columns; an example lease page on the right seven columns sitting on the waterline, four sentences underlined. Below the waterline the water fills the rest: a depth rail on the left labeled the business and you, a ranked readout (Dangerous first) under the headline, two Caution slates in the shallow band, the cyan thermocline labeled where the business ends, and two Dangerous slates beginning below it, each joined to its sentence by a plumb line.

FORM: Depth of Reach, a dealt challenger (catalog: rivers-tides-ocean-depths-mesophotic-deep-dive), competitive verdict, chosen by the user from the bolder re-roll round 2 over the dealt leader; seed key c45cc5e1. Signature interaction: the descent. On load each flagged sentence underlines in turn and its slate sinks along its plumb line to its depth; hovering or focusing a slate, a readout row or a sentence lights the other two. Motion grammar: slow, damped vertical settling only, marine snow drifting, all of it stilled under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
