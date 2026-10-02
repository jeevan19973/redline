// Claims no fixed copy may make: that a document is safe to sign (or an
// equivalent), or any comparison to a lawyer. Used by the banned-claims test
// and by the Clean verdict tests.

const BANNED: readonly RegExp[] = [
  // "Safe to sign" and its equivalents.
  /\b(safe|safer|okay|ok|fine|good|ready|clear|cleared|alright|all right)\s+(to|for)\s+(sign|signing|signature)\b/i,
  /\bsafe(ly)?\b/i,
  /\bapprov(e|ed|es|al|ing)\b/i,
  /\ball[\s-]clear\b/i,
  /\bno (issues|problems|risks?)\b/i,
  /\bnothing to worry\b/i,
  /\bgo ahead and sign\b/i,
  // Any comparison to a lawyer.
  /\blawyers?\b/i,
  /\battorneys?\b/i,
  /\bcounsel(or|ors|s)?\b/i,
  /\blaw firms?\b/i,
  /\bparalegals?\b/i,
  /\blegal (review|opinion)\b/i,
];

export function bannedClaimsIn(text: string): string[] {
  return BANNED.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}
