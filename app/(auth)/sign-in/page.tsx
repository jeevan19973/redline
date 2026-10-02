import type { Metadata } from "next";
import { signIn } from "../actions";
import { AuthForm } from "../auth-form";
import { copy } from "../copy";

export const metadata: Metadata = { title: copy.signIn.title };

export default function SignInPage() {
  return (
    <div className="auth__panel">
      <h1 className="auth__title">{copy.signIn.title}</h1>
      <AuthForm action={signIn} mode="signIn" />
    </div>
  );
}
