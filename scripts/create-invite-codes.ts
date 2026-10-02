// npm run invite:create -- 5: creates that many single-use invite codes
// (ADR 0007), stores them in invite_codes and prints them, one per line, to
// hand out. With no count it creates one.
//
// Runs under plain Node 24 (type stripping, no extra packages) and reads
// NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local when
// present. The secret key bypasses row-level security, which is the only way
// to write invite_codes. Only owner scripts like this one and the app server
// read it, and it never gets a NEXT_PUBLIC_ prefix.

import { generateInviteCode } from "../lib/invite-code.ts";

const MAX_COUNT = 100;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const countArg = process.argv[2] ?? "1";
const count = Number(countArg);
if (!/^\d+$/.test(countArg) || count < 1 || count > MAX_COUNT) {
  fail(`Give the number of codes to create, from 1 to ${MAX_COUNT}: npm run invite:create -- 5`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url) {
  fail("NEXT_PUBLIC_SUPABASE_URL is not set, so there is no database to add codes to. Add it to .env.local.");
}
if (!secretKey) {
  fail(
    "SUPABASE_SECRET_KEY is not set. Add it to .env.local: locally, `npx supabase status -o env` prints it as SECRET_KEY. No codes were created.",
  );
}

const codes = new Set<string>();
while (codes.size < count) codes.add(generateInviteCode());

// A new-style secret key (sb_secret_...) goes in the apikey header alone and
// the gateway turns it into the service role. A legacy service_role key is a
// JWT and is also sent as the bearer token.
const headers: Record<string, string> = {
  apikey: secretKey,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};
if (!secretKey.startsWith("sb_")) headers.Authorization = `Bearer ${secretKey}`;

let response: Response;
try {
  response = await fetch(new URL("/rest/v1/invite_codes", url), {
    method: "POST",
    headers,
    body: JSON.stringify([...codes].map((code) => ({ code }))),
  });
} catch (error) {
  fail(
    `Could not reach Supabase at ${url}: ${error instanceof Error ? error.message : String(error)}. Is it running? No codes were created.`,
  );
}

if (!response.ok) {
  const body = await response.text();
  if (response.status === 401 || response.status === 403) {
    fail(
      `Supabase refused SUPABASE_SECRET_KEY (${response.status}). Check that it is the secret key, not the anon or publishable key. No codes were created.\n${body}`,
    );
  }
  fail(`Supabase could not store the codes (${response.status}). No codes were created.\n${body}`);
}

console.error(`Created ${codes.size} single-use invite code${codes.size === 1 ? "" : "s"}:`);
for (const code of codes) console.log(code);
