import type { Metadata } from "next";
import { signUp } from "../actions";
import { AuthForm } from "../auth-form";
import { copy } from "../copy";

export const metadata: Metadata = { title: copy.signUp.title };

export default function SignUpPage() {
  return (
    <div className="auth__panel">
      <h1 className="auth__title">{copy.signUp.title}</h1>
      <AuthForm action={signUp} mode="signUp" />
    </div>
  );
}
