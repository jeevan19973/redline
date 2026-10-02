// Every string a reader sees on the landing page, as the built page in
// landing/ wrote it, apart from the changes ticket 16 asked for. The page
// renders only from here, and tests/banned-claims.test.ts reads all of it, so
// nothing on the page can say a document is safe to sign or compare
// Underline to a lawyer unchecked.

export type ExampleSeverity = "dangerous" | "caution";

// One clause of the example lease and the Risk flag it raises. Written for
// the page: not a real person's document or words. The list is in document
// order; the page ranks it Dangerous first, then by that order, as a report does.
export type ExampleFlag = {
  key: string;
  clause: string;
  severity: ExampleSeverity;
  // Lease text before the Source sentence in the same clause, if any.
  before?: string;
  sentence: string;
  name: string;
  // The name in the ranked list, where it can say a little more.
  rankedName: string;
  reading: string;
  // The accessible name of the link from the flag to its sentence in the lease.
  findLabel: string;
};

const examples: readonly ExampleFlag[] = [
  {
    key: "c31",
    clause: "3.1",
    severity: "caution",
    before: "The Term begins on the Commencement Date and runs for five years.",
    sentence:
      "This Lease shall automatically renew for successive five-year terms unless Tenant delivers written notice of non-renewal at least 180 days before the end of the then-current term.",
    name: "Auto-renewal",
    rankedName: "Auto-renewal",
    reading: "The lease renews for another five years unless you give written notice six months before the term ends.",
    findLabel: "Find § 3.1 in the example lease",
  },
  {
    key: "c54",
    clause: "5.4",
    severity: "caution",
    before: "Rent is due on the first day of each month.",
    sentence:
      "Any installment of Rent not received within three days after its due date shall bear a late charge equal to ten percent of the amount due.",
    name: "Late fee",
    rankedName: "Late fee",
    reading: "Rent that's three days late costs an extra 10 percent.",
    findLabel: "Find § 5.4 in the example lease",
  },
  {
    key: "c142",
    clause: "14.2",
    severity: "dangerous",
    sentence:
      "Payment of Rent and performance of Tenant's obligations are personally and unconditionally guaranteed by the undersigned Guarantor, individually, and Landlord need not first proceed against Tenant.",
    name: "Personal guarantee",
    rankedName: "Personal guarantee",
    reading: "If the business can't pay, the landlord can come to you for the rent, without trying the business first.",
    findLabel: "Find § 14.2 in the example lease",
  },
  {
    key: "c186",
    clause: "18.6",
    severity: "dangerous",
    sentence:
      "Tenant and Guarantor, jointly and severally, shall indemnify and hold Landlord harmless from all claims, losses and expenses arising from Tenant's use of the Premises, without limit as to amount.",
    name: "Uncapped indemnity",
    rankedName: "Uncapped indemnity, signed personally",
    reading: "You, not only the business, cover the landlord's losses from anything that happens at the premises, with no cap.",
    findLabel: "Find § 18.6 in the example lease",
  },
];

export const copy = {
  meta: {
    title: "Underline: see how far each clause reaches",
    description:
      "Upload a commercial lease, vendor contract, freelance agreement or vendor terms before you sign. Underline ranks what each clause costs you and quotes the exact sentence it came from.",
  },
  skip: "Skip to content",
  wordmark: "Underline",
  homeLabel: "Underline, home",
  account: {
    navLabel: "Account",
    signIn: "Sign in",
    // The one action. It leads to sign-up, which asks for an invite code.
    signUp: "Try it on your document",
    hasAccount: "Already have an account?",
    // A signed-in Signer sees these in place of the sign-up and sign-in links.
    library: "Your library",
    openLibrary: "Open your library",
  },
  severity: { dangerous: "Dangerous", caution: "Caution" },
  hero: {
    title: "See how far each clause reaches",
    lede: "If you run a small business or work for yourself in the US, upload a commercial lease, vendor contract, freelance agreement or vendor terms before you sign. Underline ranks what each clause costs you and quotes the exact sentence it came from, so you can check every flag against your own copy.",
    invite: "Invite-only beta. You'll need the invite code you were given.",
  },
  lease: {
    caption: "Example lease, written for this page. Not a real agreement.",
    title: "Commercial Lease",
  },
  examples,
  reach: {
    label: "The example lease, ranked by how far each clause reaches",
    railUp: "The business",
    railDown: "You",
    above: {
      title: "Above the line",
      body: "Clauses that cost the business, such as fees and notice deadlines.",
    },
    thermocline: {
      above: "Costs the business",
      label: "Where your business ends",
      below: "Reaches you personally",
    },
    ranked: {
      title: "Ranked by how far they reach",
      note: "Dangerous first, then Caution. Within each, in the order they appear.",
    },
  },
  anatomy: {
    title: "Every flag shows the sentence it came from",
    body: [
      "Underline quotes the sentence word for word and names its clause, so you can find it in your own copy and judge the flag yourself.",
      "Before a flag is shown, Underline checks that its sentence appears in your document exactly as quoted. If it doesn't, you don't see the flag.",
    ],
    sheet: {
      title: "Example flag, part by part",
      severity: "Severity",
      clause: "Clause",
      sentence: "Sentence",
      reading: "Reading",
      counterOffer: "Counter-offer",
      counterOfferText:
        "Guarantor's liability is limited to six months of Base Rent and ends once Tenant has paid Rent on time for the first 24 months of the Term.",
      copy: "Copy the wording",
      copied: "Copied",
    },
    fixed: {
      name: "Changes the vendor can make alone",
      tag: "Take it or leave it",
      sentence: "Provider may modify these Terms at any time by posting the revised Terms on its website.",
      reading:
        "The vendor can change the terms after you agree, and posting them online counts as telling you. These are standard terms the vendor won't change, so there's no counter-offer: you accept them or walk away.",
    },
    note: "Example flags, written for this page.",
  },
  floor: {
    title: "The line is where your business ends",
    body: [
      "A clause is Dangerous when it reaches past the business to you: your home, your savings, or work you owned before the deal. Everything else Underline flags is Caution. A clause isn't Dangerous just because it's unusual.",
      "Add your own red lines and a clause you won't accept drops below the line. Nothing you change can lift a Dangerous clause back above it.",
    ],
    chartLabel: "What Underline checks for, by how far each kind of clause reaches",
    business: {
      head: "Costs the business",
      items: [
        "Auto-renewal",
        "Payment terms that work against you",
        "Late fees and penalties",
        "Mandatory arbitration and class-action waivers",
        "Liability caps that protect the other side",
        "Terms the other side can change on its own",
        "Security deposits and repair duties",
      ],
    },
    line: "Where your business ends",
    personal: {
      head: "Reaches you personally",
      items: [
        "Personal guarantees",
        "Handing over work you owned before the deal",
        "Uncapped indemnity you sign personally",
        "Non-competes that bind you, not just the business",
      ],
    },
  },
  clean: {
    title: "When nothing reaches you, it says so",
    body: [
      "Underline doesn't invent small problems to look useful. When no clause reaches past the business and none crosses your red lines, the report says that plainly and lists everything it checked.",
      // Names the banned claim only to deny it: see DENIALS in
      // tests/banned-claims.test.ts, which pins this sentence word for word.
      "It describes what the text says. It never tells you a document is safe to sign.",
    ],
    verdict: {
      title: "Nothing here reaches past the business",
      tag: "Example report",
      text: "No clause in this document reaches past the business to you, and none crosses your red lines.",
      checkedFor: "Checked for",
      items: [
        "Personal guarantees",
        "Work you owned before the deal",
        "Uncapped indemnity signed personally",
        "Non-competes that bind you",
        "Auto-renewal",
        "Payment terms against you",
        "Late fees and penalties",
        "Arbitration and class waivers",
        "Liability caps for the other side",
        "Changes the other side can make alone",
        "Security deposits and repairs",
      ],
      stamp:
        "This report covers only the exact text you uploaded. If the other side sends a revision, upload it again. Documents you didn't upload, like a separate guaranty, weren't checked.",
    },
  },
  reads: {
    title: "What it reads, and what it doesn't",
    does: {
      head: "It reads",
      items: [
        "Commercial leases",
        "Vendor and service contracts",
        "Freelance agreements you sign as the contractor",
        "A vendor's terms of service",
      ],
      formats: "From a text-based PDF, a Word document or a plain-text file, or text you paste in.",
    },
    doesNot: {
      head: "It doesn't read",
      items: [
        "Scanned or photographed pages",
        "Residential leases",
        "Documents you didn't upload, such as a separate guaranty",
        "Contracts you're already in a dispute over",
      ],
    },
  },
  data: {
    title: "What happens to your document",
    body: [
      "Your file is opened in your browser, and only its text leaves your computer. Underline stores that text with your account and sends it through OpenRouter to a third-party AI model provider for analysis. Underline can't promise what that model provider keeps.",
      "You can delete a document, and its report, whenever you like.",
    ],
    routeLabel: "Where your document goes",
    route: [
      { where: "Your browser", what: "The file is opened here and never leaves." },
      { where: "Underline", what: "The text is stored with your account." },
      { where: "Model provider", what: "The text is sent through OpenRouter to be analyzed." },
    ],
  },
  close: {
    title: "Try it on your document",
    body: "Underline is in an invite-only beta. Bring the invite code you were given, and a lease or contract you haven't signed yet.",
    legal: "Underline is not legal advice. It tells you what your document says. Whether to sign is your call.",
    blankCaption: "Your lease or contract",
  },
} as const;

// Every string above, keyed by its path (for example "hero.title" or
// "examples.2.reading"), for tests/banned-claims.test.ts.
export function landingCopyStrings(): Record<string, string> {
  const strings: Record<string, string> = {};
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") strings[path] = value;
    else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) walk(child, path ? `${path}.${key}` : key);
    }
  };
  walk(copy, "");
  return strings;
}
