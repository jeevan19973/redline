# 0006. The product is called Underline, and red is reserved for Dangerous

Status: Accepted. Date: 2026-09-30.

## Decision

1. The product is named **Underline**. It is no longer called Redline.
2. **Red line** keeps its glossary meaning: a term the Signer has said they will not accept. The name change removes the collision with the product name.
3. The brand is ink on paper. Red is reserved for the **Dangerous** severity and is not used for the logo, navigation, primary buttons or any other chrome.
4. A **Clean verdict** is rendered in a calm neutral, never in a success green or with a checkmark.
5. A quoted **Source sentence** is always ink on paper with an underline, never a coloured fill. Severity colour appears on the flag's severity label beside the quotation, not on the quotation.

## Alternatives

- **Keep Redline.** The legal sense of redlining is exactly what a Counter-offer does. Rejected because redlineapp.net already sells consumer AI contract scanning in the same $10 to $30 band that this product would sit in, and because the word was doing three jobs at once: the product name, the Signer's Red line, and the industry verb for marking up a contract. A product whose claim is precision cannot overload its own most important word.
- **Redflag.** Immediately legible and needs no explanation. Rejected because it is the most generic phrase in the category, it promises alarms rather than evidence, it reads oddly on a Clean verdict, and it pulls the brand toward red, which is the colour that has to stay scarce.
- **A red or oxblood brand with red also meaning Dangerous.** Rejected because a reader who sees red in the logo, the header and the buttons stops reading red as a warning. The severity tier loses the only colour it has.
- **Green for a Clean verdict.** Rejected because green with a checkmark says "approved, safe to sign" more loudly than the wording can take back, and ADR 0004 forbids that claim.

## Why

Underline names what the product proves rather than what it finds. Every competitor claims to spot bad clauses, and a free chatbot does it for nothing. What this product stakes itself on is ADR 0001: every Risk flag shows the exact sentence it rests on, checked against the stored text before it is displayed, so the Signer can judge it without trusting us. Underlining a sentence is what a careful reader does, and it is the one gesture that describes the product's actual claim. It also survives a Clean verdict, where an alarm-shaped name does not: underlining what was checked still makes sense when nothing is wrong.

Reserving red follows from the same place. The severity tiers are the product's main judgment, and the Dangerous tier is where it deliberately accepts false alarms (ADR 0004). That tier only works if red is rare.

## Consequences

- `CLAUDE.md` and `CONTEXT.md` are renamed to Underline. The Counter-offer entry's _Avoid_ list now reads "redline" as the industry verb this project does not use, rather than as the product name.
- `PRD.md`, `research/`, and `.scratch/redline-v1/spec.md` still say Redline. They are dated documents and are left as written. Anything new uses Underline.
- The repository directory and the GitHub remote keep the name `redline`. Renaming them buys nothing and breaks existing clones.
- The open question in PRD section 8 about the name collision is closed by this decision.
- The palette needs a non-red brand accent, and the UI needs a severity label distinct enough to carry meaning on its own, because colour alone cannot be the signal for a reader who does not see it.
- Starting tokens, to be revisited when the UI is built: paper `#FAF9F7` / `#121316`, ink `#14161A` / `#F2F1EE`, Dangerous `#B3261E` on `#FDECEA`, Caution `#8A5A00` on `#FDF3DF`, Clean verdict `#3F4A54` on `#EDF0F2`, Non-negotiable as an ink outline with no fill.
