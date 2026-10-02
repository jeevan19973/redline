import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/env";
import { AccountsUnavailable } from "./_accounts-unavailable/notice";

// Ticket 16 puts the public landing page here. Until then the site root sends
// Signers to their library, and the proxy sends signed-out visitors to sign in.
// With no Supabase there is no library to send anyone to, so the root says
// accounts are not set up.
export default function Home() {
  if (!supabaseConfig()) return <AccountsUnavailable />;
  redirect("/library");
}
