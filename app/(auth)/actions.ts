"use server";

import type { AuthError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/env";
import { normalizeInviteCode } from "@/lib/invite-code";
import { createClient } from "@/lib/supabase/server";
import { copy } from "./copy";

export type AuthFormState = { error?: string; notice?: string; email?: string; inviteCode?: string };

type InviteCodeStatus = "unknown" | "used" | "available";

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

function messageFor(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return copy.errors.invalidCredentials;
    case "user_already_exists":
    case "email_exists":
      return copy.errors.alreadyRegistered;
    case "weak_password":
      return copy.errors.weakPassword;
    case "email_address_invalid":
      return copy.errors.invalidEmail;
    default:
      console.error("Supabase auth error", error.code, error.message);
      return copy.errors.unexpected;
  }
}

// With no Supabase there are no accounts. The forms are not shown then, but an
// action can still be posted, so each one sends the visitor to the sign-in
// page, which says accounts are not set up.
function redirectIfAccountsUnavailable() {
  if (!supabaseConfig()) redirect("/sign-in");
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  redirectIfAccountsUnavailable();
  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: copy.errors.missingFields, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: messageFor(error), email };

  revalidatePath("/", "layout");
  redirect("/library");
}

// Whether an invite code exists and is unspent, through the database's
// invite_code_status function (the table itself is closed to every client).
// Null when the check itself failed.
async function inviteCodeStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string,
): Promise<InviteCodeStatus | null> {
  const { data, error } = await supabase.rpc("invite_code_status", { code });
  if (error || (data !== "unknown" && data !== "used" && data !== "available")) {
    console.error("Invite code check failed", error?.code, error?.message);
    return null;
  }
  return data;
}

// Sign-up is invite-only (ADR 0007). The code travels as user metadata to a
// trigger on auth.users that spends it in the same transaction that creates
// the account, and refuses the account when the code is unknown or spent.
// That trigger is the guard. The status check before it only lets a wrong
// code and a used one get their own plain messages, which the trigger's
// refusal cannot carry through Supabase Auth.
export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  redirectIfAccountsUnavailable();
  const { email, password } = readCredentials(formData);
  const inviteCode = normalizeInviteCode(String(formData.get("inviteCode") ?? ""));
  if (!email || !password) return { error: copy.errors.missingFields, email, inviteCode };
  if (!inviteCode) return { error: copy.errors.missingInviteCode, email };

  const supabase = await createClient();
  const status = await inviteCodeStatus(supabase, inviteCode);
  if (status === null) return { error: copy.errors.unexpected, email, inviteCode };
  if (status === "unknown") return { error: copy.errors.unknownInviteCode, email };
  if (status === "used") return { error: copy.errors.usedInviteCode, email };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { invite_code: inviteCode } },
  });
  if (error) {
    // A code that was free a moment ago can be spent by a sign-up racing this
    // one. The trigger then refuses this account, and Supabase Auth reports
    // only a generic database error, so look again before saying what went
    // wrong.
    if ((await inviteCodeStatus(supabase, inviteCode)) === "used") {
      return { error: copy.errors.usedInviteCode, email };
    }
    return { error: messageFor(error), email, inviteCode };
  }

  // With email confirmation on (as on a hosted project), there is no session yet.
  if (!data.session) return { notice: copy.signUp.confirmEmail, email };

  revalidatePath("/", "layout");
  redirect("/library");
}

export async function signOut() {
  redirectIfAccountsUnavailable();
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}
