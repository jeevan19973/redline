"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isClauseType, type ClauseType } from "@/lib/analysis/index.ts";
import { supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { copy } from "../copy";
import { checkFreeText } from "./free-text";

// List, add, edit and remove the Signer's own Red lines (spec, "Server
// operations"), of both kinds. A catalog value is checked against the
// catalog, which lives in the Analysis module, before it reaches the
// database; a free-text value is trimmed and held to the length limit. Changing a Red line never touches a stored
// Report: each Report keeps the snapshot it ran against.

export type RedLineResult = { ok: true } | { ok: false; error: string };

const errors = copy.redLines.own.errors;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A signed-in Signer's Supabase client, or a redirect.
async function signedIn() {
  // With no Supabase there are no accounts; the page says so.
  if (!supabaseConfig()) redirect("/red-lines");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/sign-in");
  return supabase;
}

function failure(
  what: string,
  error: { code?: string; message?: string },
  duplicate: string = errors.duplicate,
): RedLineResult {
  // 23505: unique (owner, kind, value), so the Red line is already on the list.
  if (error.code === "23505") return { ok: false, error: duplicate };
  console.error(`Could not ${what} a Red line`, error.code, error.message);
  return { ok: false, error: errors.unexpected };
}

function done(): RedLineResult {
  revalidatePath("/red-lines");
  return { ok: true };
}

// Marks a catalog clause type as one the Signer will not accept.
export async function addRedLine(clauseType: unknown): Promise<RedLineResult> {
  if (!isClauseType(clauseType)) return { ok: false, error: errors.invalid };
  const supabase = await signedIn();
  // The owner defaults to auth.uid(), and row-level security refuses any other.
  const value: ClauseType = clauseType;
  const { error } = await supabase.from("red_lines").insert({ kind: "catalog", value });
  return error ? failure("add", error) : done();
}

// Changes which clause type one of the Signer's catalog Red lines is on.
export async function editRedLine(id: unknown, clauseType: unknown): Promise<RedLineResult> {
  if (typeof id !== "string" || !UUID.test(id)) return { ok: false, error: errors.notFound };
  if (!isClauseType(clauseType)) return { ok: false, error: errors.invalid };
  const supabase = await signedIn();
  const value: ClauseType = clauseType;
  // Row-level security matches nothing for another Signer's row.
  const { data, error } = await supabase
    .from("red_lines")
    .update({ value })
    .eq("id", id)
    .eq("kind", "catalog")
    .select("id");
  if (error) return failure("edit", error);
  if (!data || data.length === 0) return { ok: false, error: errors.notFound };
  return done();
}

const freeTextDuplicate = copy.redLines.freeText.errors.duplicate;

// Adds a Red line in the Signer's own words.
export async function addFreeTextRedLine(text: unknown): Promise<RedLineResult> {
  const checked = checkFreeText(text);
  if (!checked.ok) return checked;
  const supabase = await signedIn();
  const { error } = await supabase.from("red_lines").insert({ kind: "freeText", value: checked.text });
  return error ? failure("add", error, freeTextDuplicate) : done();
}

// Rewords one of the Signer's free-text Red lines.
export async function editFreeTextRedLine(id: unknown, text: unknown): Promise<RedLineResult> {
  if (typeof id !== "string" || !UUID.test(id)) return { ok: false, error: errors.notFound };
  const checked = checkFreeText(text);
  if (!checked.ok) return checked;
  const supabase = await signedIn();
  const { data, error } = await supabase
    .from("red_lines")
    .update({ value: checked.text })
    .eq("id", id)
    .eq("kind", "freeText")
    .select("id");
  if (error) return failure("edit", error, freeTextDuplicate);
  if (!data || data.length === 0) return { ok: false, error: errors.notFound };
  return done();
}

// Removes one of the Signer's Red lines, of either kind. Dangerous flags still show on
// every later report (the Severity floor); past reports are unchanged.
export async function removeRedLine(id: unknown): Promise<RedLineResult> {
  if (typeof id !== "string" || !UUID.test(id)) return { ok: false, error: errors.notFound };
  const supabase = await signedIn();
  const { data, error } = await supabase.from("red_lines").delete().eq("id", id).select("id");
  if (error) return failure("remove", error);
  if (!data || data.length === 0) return { ok: false, error: errors.notFound };
  return done();
}
