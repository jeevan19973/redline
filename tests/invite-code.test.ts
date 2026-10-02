import { describe, expect, it } from "vitest";
import {
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
  generateInviteCode,
  normalizeInviteCode,
} from "../lib/invite-code.ts";

// The invite_codes migration accepts only this canonical form.
const CANONICAL = /^[A-Z0-9]{12,}$/;

describe("invite codes", () => {
  it("makes codes the database accepts, from characters nobody misreads", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode();
      expect(code).toHaveLength(INVITE_CODE_LENGTH);
      expect(code).toMatch(CANONICAL);
      expect(code).not.toMatch(/[01ILO]/);
      for (const character of code) expect(INVITE_CODE_ALPHABET).toContain(character);
    }
  });

  it("makes a different code each time", () => {
    const codes = new Set(Array.from({ length: 1000 }, generateInviteCode));
    expect(codes.size).toBe(1000);
  });

  it("reads a code typed in lowercase, with spaces or hyphens, as the code itself", () => {
    const code = generateInviteCode();
    const typed = ` ${code.slice(0, 4).toLowerCase()}-${code.slice(4, 8)} ${code.slice(8)}\n`;
    expect(normalizeInviteCode(typed)).toBe(code);
    expect(normalizeInviteCode(code)).toBe(code);
  });

  it("reads a blank entry as no code", () => {
    expect(normalizeInviteCode("  - ")).toBe("");
  });
});
