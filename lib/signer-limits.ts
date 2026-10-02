// The one-time limit per Signer (ADR 0007): what is left of it, read from
// the Signer's signer_limits row. The defaults (5 analyses, 25 questions)
// live in the migration, since the owner raises one Signer's limit by
// editing that row.

// A signer_limits row as the database returns it.
export type SignerLimitRow = {
  analyses_used: number;
  questions_used: number;
  analysis_limit: number;
  question_limit: number;
};

export type Allowance = {
  readonly analysesLeft: number;
  readonly analysisLimit: number;
  readonly questionsLeft: number;
  readonly questionLimit: number;
};

// What a Signer has left. Never below zero: if the owner lowers a limit
// under what the Signer has already used, they simply have none left.
export function allowanceFrom(row: SignerLimitRow): Allowance {
  return {
    analysesLeft: Math.max(0, row.analysis_limit - row.analyses_used),
    analysisLimit: row.analysis_limit,
    questionsLeft: Math.max(0, row.question_limit - row.questions_used),
    questionLimit: row.question_limit,
  };
}

// Whether a row read from the database has the shape allowanceFrom needs.
export function isSignerLimitRow(value: unknown): value is SignerLimitRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return ["analyses_used", "questions_used", "analysis_limit", "question_limit"].every(
    (key) => Number.isInteger(row[key]),
  );
}
