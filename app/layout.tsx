import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Underline", template: "%s · Underline" },
};

export const viewport: Viewport = {
  themeColor: "#FAF9F7",
};

// The bare document every page shares. Styles live one level down: the app
// and auth layouts load globals.css, and the landing page loads its own
// stylesheet, so neither changes the other (ticket 16).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}
