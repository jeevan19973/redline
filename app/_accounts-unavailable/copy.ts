// Every string a Signer reads on the notice shown in place of sign-in,
// sign-up and the signed-in app when this copy of Underline has no Supabase.
export const copy = {
  title: "Accounts aren't set up",
  body: "This copy of Underline can't sign anyone in, so the library and Red lines aren't available.",
  analyze: {
    text: "Underline can still analyze a document's text if you paste it in.",
    // Goes to /drafts/new, which offers the analysis without an account.
    link: "Analyze a document",
  },
} as const;
