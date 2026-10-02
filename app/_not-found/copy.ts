// Every string a reader sees on the two not-found pages.
export const copy = {
  title: "Page not found",
  // notFound() inside the signed-in app: a deleted Draft's old link, another
  // Signer's Draft (row-level security makes it read as missing), or a
  // mistyped id. It never says which.
  inApp: {
    body: "Underline can't find anything at this link. If it was a Draft, it may have been deleted.",
    link: "Go to your library",
  },
  // Any address Underline has no page for.
  unknown: {
    body: "There's nothing at this address. The link may be mistyped or out of date.",
    link: "Go to the home page",
  },
} as const;
