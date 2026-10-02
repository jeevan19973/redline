// Every string a Signer reads in the signed-in app shell, the library and
// the Draft screens.
export const copy = {
  rail: {
    label: "Main",
    library: "Library",
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
    intro: "Choose a plain-text file or paste the document's text. Underline reads the file in your browser and saves only its text.",
    file: {
      label: "Plain-text file",
      hint: "A .txt file. It stays on your computer.",
      remove: "Remove file",
    },
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
      notText: "Underline reads .txt files here. For another kind of file, copy its text and paste it below.",
      readFailed: "Underline couldn't read that file. Try again, or paste its text below.",
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
} as const;
