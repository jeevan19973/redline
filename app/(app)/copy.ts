// Every string a Signer reads in the signed-in app shell, the library and
// the Draft screens.

// Why a chosen file gave no text (Text extraction's refusals), shared by the
// Add a Draft and Analyze forms.
const fileRefusals = {
  unsupportedType:
    "Underline can't read this kind of file. It reads text-based PDFs, Word files (.docx) and plain text (.txt). Export the document as one of those, or paste its text below.",
  noTextLayer:
    "This PDF has no text Underline can read, which usually means it's a scan. Underline can't read scanned pages. Export a text-based PDF from the original, or paste the text below.",
  unreadable:
    "Underline couldn't read that file. It may be damaged or password-protected. Try again, or paste its text below.",
} as const;

const fileField = {
  label: "Document file",
  hint: "A text-based PDF, a Word file (.docx) or a .txt file. It stays on your computer.",
  reading: "Reading the file.",
  remove: "Remove file",
} as const;

export const copy = {
  rail: {
    label: "Main",
    library: "Library",
    redLines: "Red lines",
    addDraft: "Add a Draft",
    signedInAs: "Signed in as",
    signOut: "Sign out",
  },
  library: {
    title: "Library",
    listLabel: "Your Drafts, newest first",
    emptyTitle: "No Drafts yet",
    emptyBody: "Documents you add are saved here as Drafts, newest first. Open one to see its report.",
    addDraft: "Add a Draft",
  },
  addDraft: {
    title: "Add a Draft",
    intro: "Choose a file or paste the document's text. Underline reads the file in your browser and saves only its text.",
    file: fileField,
    text: {
      label: "Document text",
      pasteHint: "Or paste the text here. Underline saves it exactly as pasted.",
      fromFile: (fileName: string) =>
        `Read from ${fileName}. Check this is the document you meant before you save.`,
    },
    titleField: {
      label: "Title",
      hint: "Shown in your library. Choosing a file fills in its name.",
    },
    save: "Save Draft",
    pending: "Saving",
    errors: {
      ...fileRefusals,
      missingTitle: "Give the Draft a title.",
      emptyText: "There's no text to save. Choose a file or paste the document's text.",
      tooLarge: "This document is over the 2 MB limit for one Draft.",
      unexpected: "Something went wrong on our end. Try again.",
    },
  },
  draft: {
    added: "Added",
    textTitle: "The text Underline saved",
    textIntro: "Underline saved this exact text for this Draft. Check it's the document you meant.",
  },
  // Deleting a Draft from the library or its own page, after a confirmation.
  deleteDraft: {
    trigger: "Delete",
    title: (title: string) => `Delete "${title}"?`,
    body: "Underline will delete this Draft's text and its report. You can't get them back.",
    confirm: "Delete Draft",
    pending: "Deleting",
    cancel: "Cancel",
    deleted: (title: string) => `Deleted "${title}".`,
    // On the library after deleting from the Draft's page, where the title
    // is not carried over.
    deletedOne: "Deleted the Draft.",
    errors: {
      notFound: "That Draft is already gone. Reload the page to see your library.",
      unexpected: "Something went wrong on our end, so the Draft is still here. Try again.",
    },
  },
  report: {
    title: "Report",
    analyzed: "Analyzed",
    summaryTitle: "Summary",
    scopeTitle: "What this report covers",
    flags: {
      title: "Risk flags",
      legend:
        "Dangerous means the clause reaches past the business to you personally, or it's a clause type on your Red lines. Caution means the cost stays with the business.",
      // Only on a Report stored before the Clean verdict existed.
      none: "Underline didn't flag any clause in this text.",
      olderReport: "This report was made before Underline added Risk flags. Run the analysis again to get them.",
      showInText: "Show in text",
      twoReadings: "This can be read two ways:",
      raisedBy: (label: string) => `Raised by your Red line: ${label}. Without it, this flag would be Caution.`,
      // A flag one of the Signer's free-text Red lines added.
      redLineType: "Your Red line",
      crosses: (redLine: string) => `Crosses your Red line: ${redLine}`,
    },
    // The Red lines a stored Report ran against (its snapshot).
    redLines: {
      title: "Red lines this report used",
      none: "You had no Red lines when this report ran.",
      stale: "Changing your Red lines doesn't change this report. Run the analysis again to use your current list.",
    },
    // A negotiable flag's replacement wording, and the Copy button.
    counterOffer: {
      title: "Counter-offer",
      intro: "Wording you can send as written.",
      copy: "Copy the wording",
      copied: "Copied",
      copyFailed: "Underline couldn't copy to your clipboard. The wording is selected, so copy it with your keyboard.",
    },
    // A Non-negotiable flag (ADR 0003): its label and its basis.
    nonNegotiable: {
      label: "Take it or leave it",
      basisTitle: "Why there's no Counter-offer",
      basisNote: "That sentence shows the terms aren't open to change, so you can accept this clause as written or walk away.",
    },
    severity: { Dangerous: "Dangerous", Caution: "Caution" },
    // Shown only when the Confidence display switch is on (ADR 0004).
    confidence: {
      label: { high: "Confidence: high", medium: "Confidence: medium", low: "Confidence: low" },
      legend:
        "Each flag has two labels. Dangerous or Caution says how bad the clause is if Underline has read it right. Confidence says how sure Underline is of that reading, so a Dangerous flag with low confidence is still Dangerous.",
    },
    verdict: {
      listTitle: "Checked for",
      checked: "Checked",
      notChecked: "Not checked",
    },
    guarantyGap: {
      title: "Separate guaranty",
    },
  },
  // The Draft text and its report, side by side or one at a time.
  reading: {
    toggleLabel: "Show",
    report: "Report",
    text: "Draft text",
    textNote: "Underlined sentences are quoted in the report or in an answer to your question. Select one to see where it's quoted.",
  },
  // The question box under the report. The "does not say" reply itself is
  // the Analysis module's fixed template.
  question: {
    title: "Ask about this document",
    intro:
      "Underline answers only from this text and quotes the sentences it relies on. If the text doesn't answer your question, it says so.",
    label: "Your question",
    hint: (max: number) => `Up to ${max} characters. Questions and answers aren't saved.`,
    submit: "Ask",
    pending: "Asking",
    pendingNote: "Looking for the answer in this text.",
    answerTitle: "Answer",
    asked: "You asked",
    sourcesTitle: "Quoted from the document",
    errors: {
      empty: "Write a question first.",
      tooLong: (max: number) => `That question is too long. Keep it to ${max} characters or fewer.`,
      failed: "Underline couldn't finish answering. Try again.",
      signIn: "Sign in to ask about a document.",
    },
  },
  analysis: {
    pending: "Analyzing this Draft. This can take a minute or two.",
    pendingButton: "Analyzing",
    failed: "Underline couldn't finish analyzing this Draft. The text is still saved, so you can try again without adding it again.",
    retry: "Try again",
    rerun: "Run analysis again",
    rerunHint: "Replaces this report with a new one from the same text and your current Red lines.",
    rerunFailed: "Underline couldn't finish the new analysis. This report is unchanged.",
    unreadable: "Underline couldn't read the saved report on this Draft. Run the analysis again to replace it.",
  },
  redLines: {
    title: "Red lines",
    intro: "Red lines are terms you won't accept. Underline checks every document against them.",
    own: {
      title: "Your Red lines",
      intro:
        "Pick a clause type you won't accept. When a document has one, a Caution flag of that type becomes Dangerous and the report gets no Clean verdict.",
      empty: "You haven't set any Red lines yet. Documents are still checked against the default list below.",
      clauseType: "Clause type",
      addLabel: "Clause type you won't accept",
      add: "Add Red line",
      adding: "Adding",
      allUsed: "Every clause type on the default list is already one of your Red lines.",
      edit: "Edit",
      save: "Save",
      saving: "Saving",
      cancel: "Cancel",
      remove: "Remove",
      removing: "Removing",
      added: (label: string) => `Added ${label}.`,
      changed: (label: string) => `Changed to ${label}.`,
      removed: (label: string) => `Removed ${label}.`,
      floor:
        "Removing a Red line never hides a Dangerous flag: a clause that reaches you personally always shows as Dangerous.",
      reports:
        "Changing your Red lines doesn't change reports you already have. To use your current list on a Draft, open it and run the analysis again.",
      errors: {
        duplicate: "That clause type is already one of your Red lines.",
        invalid: "Choose a clause type from the list.",
        notFound: "That Red line isn't on your list anymore. Reload the page to see your current list.",
        unexpected: "Something went wrong on our end. Try again.",
      },
    },
    // The Signer's Red lines in their own words, for terms the default list
    // doesn't cover.
    freeText: {
      title: "In your own words",
      intro:
        "Add a term the default list doesn't cover, such as \"Landlord can enter on short notice\". If a document contains it, the report quotes the sentence in a Risk flag, and there's no Clean verdict.",
      empty: "You haven't written any yet.",
      addLabel: "A term you won't accept",
      editLabel: "Red line",
      hint: (max: number) => `${max} characters at most.`,
      add: "Add Red line",
      adding: "Adding",
      edit: "Edit",
      save: "Save",
      saving: "Saving",
      cancel: "Cancel",
      remove: "Remove",
      removing: "Removing",
      added: (text: string) => `Added "${text}".`,
      changed: (text: string) => `Changed to "${text}".`,
      removed: (text: string) => `Removed "${text}".`,
      errors: {
        empty: "Write the term you won't accept.",
        tooLong: (max: number) => `That's too long. Keep it to ${max} characters or fewer.`,
        duplicate: "That's already one of your Red lines.",
      },
    },
    catalog: {
      title: "Default Red lines",
      intro: "Underline checks every document for these clause types. You can't change this list.",
      severityNote:
        "A Caution clause becomes Dangerous when it reaches you personally or when its type is one of your Red lines.",
      clauseType: "Clause type",
      severity: "Severity",
    },
  },
  // The page at /drafts/new when this copy of Underline has no accounts.
  analyze: {
    title: "Analyze a document",
    intro: "Paste the document's text or choose a file. This copy of Underline has no accounts, so nothing you add here is saved.",
    file: fileField,
    text: {
      label: "Document text",
      pasteHint: "Or paste the text here. Underline analyzes it exactly as pasted.",
      fromFile: (fileName: string) =>
        `Read from ${fileName}. Check this is the document you meant before you analyze it.`,
    },
    submit: "Analyze",
    pending: "Analyzing",
    pendingNote: "Analyzing this document. This can take a minute or two.",
    notSaved: "Nothing here is saved, so the report is gone once you leave this page.",
    textTitle: "The text Underline analyzed",
    textIntro: "Underline analyzed this exact text. Check it's the document you meant.",
    errors: {
      ...fileRefusals,
      emptyText: "There's no text to analyze. Choose a file or paste the document's text.",
      tooLarge: "This document is over the 2 MB limit.",
      failed: "Underline couldn't finish the analysis. Try again.",
      signIn: "Sign in to analyze a document.",
    },
  },
} as const;
