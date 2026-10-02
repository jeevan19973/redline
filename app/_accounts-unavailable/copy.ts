// Every string a Signer reads on the notice shown in place of sign-in,
// sign-up and the signed-in app when this copy of Underline has no Supabase.
export const copy = {
  title: "Accounts aren't set up",
  body: "This copy of Underline can't sign anyone in, so the library and Red lines aren't available.",
  analyze: {
    text: "Underline can still analyze a document's text if you paste it in.",
    // Ticket 03 adds the link to the analyze page here, as `link`, and the
    // notice renders it after `text`.
  },
} as const;
