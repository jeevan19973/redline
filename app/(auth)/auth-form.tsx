"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "./actions";
import { copy } from "./copy";

type Props = {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  mode: "signIn" | "signUp";
};

export function AuthForm({ action, mode }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const text = copy[mode];
  const other = mode === "signIn" ? "/sign-up" : "/sign-in";
  const hint = mode === "signUp" ? copy.signUp.passwordHint : undefined;

  return (
    <form className="auth-form" action={formAction} noValidate>
      {state.error && (
        <p className="form-message" role="alert">
          {state.error}
        </p>
      )}
      {state.notice && (
        <p className="form-message" role="status">
          {state.notice}
        </p>
      )}

      {mode === "signUp" && (
        <div className="field">
          <label htmlFor="invite-code">{copy.fields.inviteCode}</label>
          <input
            id="invite-code"
            name="inviteCode"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            aria-describedby="invite-code-hint"
            defaultValue={state.inviteCode}
          />
          <p className="field__hint" id="invite-code-hint">
            {copy.signUp.inviteCodeHint}
          </p>
        </div>
      )}

      <div className="field">
        <label htmlFor="email">{copy.fields.email}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
        />
      </div>

      <div className="field">
        <label htmlFor="password">{copy.fields.password}</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          minLength={mode === "signUp" ? 8 : undefined}
          required
          aria-describedby={hint ? "password-hint" : undefined}
        />
        {hint && (
          <p className="field__hint" id="password-hint">
            {hint}
          </p>
        )}
      </div>

      <button className="action" type="submit" disabled={pending}>
        {pending ? text.pending : text.submit}
      </button>

      <p className="auth-form__switch">
        {text.switchPrompt}{" "}
        <Link className="link" href={other}>
          {text.switchLink}
        </Link>
      </p>
    </form>
  );
}
