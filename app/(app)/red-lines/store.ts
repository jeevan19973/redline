import { FREE_TEXT_MAX_LENGTH, isClauseType, type RedLine } from "@/lib/analysis/index.ts";
import type { createClient } from "@/lib/supabase/server";
import { freeTextLength } from "./free-text";

type Supabase = Awaited<ReturnType<typeof createClient>>;

type RedLineRow = { id: string; kind: string; value: string };

// The signed-in Signer's current Red lines, oldest first, in the shape the
// Analysis module takes. Row-level security limits the rows to their own.
// Returns null when they cannot be read, so an analysis never runs as if
// the Signer had none.
//
// The server checks a catalog value against the catalog, and a free-text
// value against the length limit, before writing it. A Signer can write
// their own rows directly, though, so a row that fails those checks is
// skipped here rather than trusted.
export async function listRedLines(supabase: Supabase): Promise<RedLine[] | null> {
  const { data, error } = await supabase
    .from("red_lines")
    .select("id, kind, value")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .returns<RedLineRow[]>();
  if (error || !data) {
    console.error("Could not list Red lines", error?.code, error?.message);
    return null;
  }
  return data.flatMap((row): RedLine[] => {
    if (row.kind === "catalog" && isClauseType(row.value)) {
      return [{ id: row.id, kind: "catalog", clauseType: row.value }];
    }
    if (row.kind === "freeText" && freeTextLength(row.value.trim()) <= FREE_TEXT_MAX_LENGTH) {
      return [{ id: row.id, kind: "freeText", text: row.value }];
    }
    console.error("Skipped a Red line that is not well formed", row.id);
    return [];
  });
}
