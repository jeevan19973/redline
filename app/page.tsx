import { redirect } from "next/navigation";

// Ticket 16 puts the public landing page here. Until then the site root sends
// Signers to their library, and the proxy sends signed-out visitors to sign in.
export default function Home() {
  redirect("/library");
}
