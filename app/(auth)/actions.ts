"use server";

import type { AuthError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { copy } from "./copy";

export type AuthFormState = { error?: string; notice?: string; email?: string };

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

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  redirectIfAccountsUnavailable();
  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: copy.errors.missingFields, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: messageFor(error), email };

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
