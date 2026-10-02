import { randomInt } from "node:crypto";

// Invite codes (ADR 0007): what one looks like, how the owner script makes
// one, and how the sign-up form reads one a Signer typed. The invite_codes
// migration checks the same canonical form.

// Uppercase letters and digits a person cannot misread for another: no 0 or
// O, no 1, I or L. 31 characters.
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// 16 characters from 31 is about 79 bits, too many to guess through the
// sign-up form's status check.
export const INVITE_CODE_LENGTH = 16;

// A new random code, from the platform's cryptographic generator.
export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

// The canonical form of a code as typed or pasted: uppercase, with spaces and
// hyphens removed, so "abcd-efgh jkmn" reads as "ABCDEFGHJKMN". Anything else
// is left in place for the database to reject as unknown.
export function normalizeInviteCode(typed: string): string {
  return typed.replace(/[\s-]+/g, "").toUpperCase();
}
