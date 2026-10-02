// The fixed clause catalog (spec, "Fixed clause catalog"), as data. The
// analysis prompt is built from it, severity is decided from it, and the
// Clean verdict (ticket 07) reports it as the list of what was checked, so
// "checked for personal guarantees" is a real statement rather than a
// paraphrase (ADR 0004).

export type Severity = "Dangerous" | "Caution";

type CatalogEntryShape = {
  // The stable id, used on Risk flags, in Red lines and in stored Reports.
  readonly clauseType: string;
  // What the Signer reads as the flag's name. Run through the humanizer skill.
  readonly label: string;
  // The severity before the personal-reach test (ADR 0003): Dangerous types
  // are always Dangerous; a Caution type becomes Dangerous when the model
  // reports that its exposure reaches the Signer personally.
  readonly defaultSeverity: Severity;
  // What the clause type covers, for the model. Prompt text, not copy.
  readonly covers: string;
};

export const CATALOG = [
  {
    clauseType: "personalGuarantee",
    label: "Personal guarantee",
    defaultSeverity: "Dangerous",
    covers:
      "An individual (the Signer, an owner, principal or officer) personally guarantees the business's payment or performance, so their own assets back the business's obligations.",
  },
  {
    clauseType: "preExistingIpAssignment",
    label: "Assignment of work you owned before",
    defaultSeverity: "Dangerous",
    covers:
      "The Signer assigns, transfers or licenses to the Counterparty intellectual property, tools, code, materials or work they owned or created before the deal, or created outside it.",
  },
  {
    clauseType: "uncappedIndemnity",
    label: "Uncapped indemnity",
    defaultSeverity: "Caution",
    covers:
      "The Signer's side must indemnify, defend or hold the Counterparty harmless with no cap on the amount. It is Dangerous only when an individual indemnifies in their own capacity, or when the document also has an individual guarantee the business; report that through reachesSignerPersonally.",
  },
  {
    clauseType: "individualNonCompete",
    label: "Non-compete that binds you",
    defaultSeverity: "Dangerous",
    covers:
      "A non-compete, non-solicit or exclusivity restriction that binds an individual person (the Signer, an owner or principal), not only the business entity.",
  },
  {
    clauseType: "autoRenewal",
    label: "Automatic renewal",
    defaultSeverity: "Caution",
    covers: "The agreement renews or extends on its own unless someone gives notice, especially within a set window.",
  },
  {
    clauseType: "paymentTerms",
    label: "Payment terms against you",
    defaultSeverity: "Caution",
    covers:
      "Payment terms that work against the Signer: long payment delays to the Signer, payment only on the Counterparty's acceptance, set-off or withholding rights, or prepayment and non-refundable fees the Signer pays.",
  },
  {
    clauseType: "lateFees",
    label: "Late fees and penalties",
    defaultSeverity: "Caution",
    covers: "Late charges, interest, penalties or liquidated damages charged to the Signer's side.",
  },
  {
    clauseType: "arbitrationClassWaiver",
    label: "Arbitration and class-action waiver",
    defaultSeverity: "Caution",
    covers:
      "Disputes must go to binding arbitration, or the Signer's side waives class or collective actions, jury trial or the right to go to court.",
  },
  {
    clauseType: "liabilityCap",
    label: "Cap on what they owe you",
    defaultSeverity: "Caution",
    covers:
      "A limitation of liability that caps or excludes what the Counterparty owes the Signer's side, such as a cap at fees paid or an exclusion of consequential damages.",
  },
  {
    clauseType: "unilateralAmendment",
    label: "Changes they can make alone",
    defaultSeverity: "Caution",
    covers:
      "The Counterparty can change the terms, rules, prices or services on its own, by notice or by posting, without the Signer's agreement.",
  },
  {
    clauseType: "depositAndRepairs",
    label: "Security deposit and repairs",
    defaultSeverity: "Caution",
    covers:
      "Security deposit terms (how it can be kept, applied or must be topped up) and repair, maintenance or restoration obligations put on the Signer's side.",
  },
] as const satisfies readonly CatalogEntryShape[];

export type CatalogEntry = (typeof CATALOG)[number];

export type ClauseType = CatalogEntry["clauseType"];

// The clause type ids, in catalog order.
export const CLAUSE_TYPES: readonly ClauseType[] = CATALOG.map((entry) => entry.clauseType);

export function isClauseType(value: unknown): value is ClauseType {
  return (CLAUSE_TYPES as readonly unknown[]).includes(value);
}

export function catalogEntry(clauseType: ClauseType): CatalogEntry {
  const entry = CATALOG.find((candidate) => candidate.clauseType === clauseType);
  // Unreachable while ClauseType is derived from CATALOG.
  if (!entry) throw new Error(`Unknown clause type: ${clauseType}`);
  return entry;
}

// The Signer-facing name of a clause type.
export function clauseTypeLabel(clauseType: ClauseType): string {
  return catalogEntry(clauseType).label;
}

// Severity, decided in code (ADR 0003): Dangerous when the catalog says so,
// or when the exposure reaches past the business to the Signer personally.
// Everything else is Caution. How unusual a clause is never counts.
export function severityFor(clauseType: ClauseType, reachesSignerPersonally: boolean): Severity {
  if (catalogEntry(clauseType).defaultSeverity === "Dangerous") return "Dangerous";
  return reachesSignerPersonally ? "Dangerous" : "Caution";
}
