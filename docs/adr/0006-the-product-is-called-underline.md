# 0006. The product is called Underline, reading happens on paper, and red is reserved for Dangerous

Status: Accepted. Date: 2026-09-30. Revised 2026-10-01 so the brand rule covers the Depth of Reach visual world chosen for the landing page and the app (see DESIGN.md).

## Decision

1. The product is named **Underline**. It is no longer called Redline.
2. **Red line** keeps its glossary meaning: a term the Signer has said they will not accept. The name change removes the collision with the product name.
3. **Everything the Signer reads is ink on paper.** The landing page opens and closes on paper, and every document, Draft text, Risk flag, quotation, Counter-offer and verdict sits on a paper surface. Behind those surfaces the ground may be stepped ink-blue water, where depth stands for how far a clause reaches past the business (ADR 0003). The water is ground and chrome only; text is never set for reading on it at length without its own paper surface, apart from headings, short notes and labels.
4. **Red is reserved for the Dangerous severity.** It is not used for the logo, navigation, primary buttons, the water or any other chrome. The one brand accent is the thermocline cyan, which marks where the business ends and carries the primary action.
5. A **Clean verdict** is rendered in a calm neutral, never in a success green or with a checkmark.
6. A quoted **Source sentence** is always ink on paper with an underline, never a colored fill. Severity color appears on the flag's severity label beside the quotation, not on the quotation.

## Alternatives

- **Keep Redline.** The legal sense of redlining is exactly what a Counter-offer does. Rejected because redlineapp.net already sells consumer AI contract scanning in the same $10 to $30 band that this product would sit in, and because the word was doing three jobs at once: the product name, the Signer's Red line, and the industry verb for marking up a contract. A product whose claim is precision cannot overload its own most important word.
- **Redflag.** Immediately legible and needs no explanation. Rejected because it is the most generic phrase in the category, it promises alarms rather than evidence, it reads oddly on a Clean verdict, and it pulls the brand toward red, which is the color that has to stay scarce.
- **A red or oxblood brand with red also meaning Dangerous.** Rejected because a reader who sees red in the logo, the header and the buttons stops reading red as a warning. The severity tier loses the only color it has.
- **Green for a Clean verdict.** Rejected because green with a checkmark says "approved, safe to sign" more loudly than the wording can take back, and ADR 0004 forbids that claim.
- **Ink on paper everywhere, with no ground behind it.** The first version of this decision. Replaced because the direction round chose a world where depth shows severity, and a plain paper page has nowhere to put the line between what costs the business and what reaches the Signer.
- **A fully dark product, text set straight on the water.** Rejected because a quotation is only checkable when it reads like the document it came from, and long reading on a dark ground is harder at a desk under office light.

## Why

Underline names what the product proves rather than what it finds. Every competitor claims to spot bad clauses, and a free chatbot does it for nothing. What this product stakes itself on is ADR 0001: every Risk flag shows the exact sentence it rests on, checked against the stored text before it is displayed, so the Signer can judge it without trusting us. Underlining a sentence is what a careful reader does, and it is the one gesture that describes the product's actual claim. It also survives a Clean verdict, where an alarm-shaped name does not: underlining what was checked still makes sense when nothing is wrong.

Keeping every reading surface on paper follows from the same claim. The Signer checks a flag by comparing it with their own copy, so the quotation should look like a document, ink with an underline. The water around it carries ADR 0003's test as a picture: Caution above the thermocline, Dangerous below.

Reserving red follows from the same place. The severity tiers are the product's main judgment, and the Dangerous tier is where it deliberately accepts false alarms (ADR 0004). That tier only works if red is rare.

## Consequences

- `CLAUDE.md` and `CONTEXT.md` are renamed to Underline. The Counter-offer entry's _Avoid_ list now reads "redline" as the industry verb this project does not use, rather than as the product name.
- `PRD.md`, `research/` and the original text of `.scratch/redline-v1/spec.md` still say Redline. They are dated documents and are left as written. Anything new uses Underline.
- The repository directory and the GitHub remote keep the name `redline`. Renaming them buys nothing and breaks existing clones.
- The open question in PRD section 8 about the name collision is closed by this decision.
- The non-red brand accent is the thermocline cyan. The severity label carries its meaning in text, because color alone cannot be the signal for a reader who does not see it.
- In the app, the Draft text and every flag sit on paper panes; the ink-blue water is the frame around them. On-screen order stays Dangerous first; depth is shown beside each flag, never used to push Dangerous down a report.
- DESIGN.md holds the tokens, recorded from the built landing page. The severity and paper values this decision started with are unchanged there: paper `#FAF9F7`, ink `#14161A`, Dangerous `#B3261E` on `#FDECEA`, Caution `#8A5A00` on `#FDF3DF`, Clean verdict `#3F4A54` on `#EDF0F2`, Non-negotiable as an ink outline with no fill.
