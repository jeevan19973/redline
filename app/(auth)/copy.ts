// Every string a Signer reads on the sign-in and sign-up pages.
export const copy = {
  signIn: {
    title: "Sign in",
    submit: "Sign in",
    pending: "Signing in",
    switchPrompt: "New to Underline?",
    switchLink: "Create an account",
  },
  signUp: {
    title: "Create your account",
    submit: "Create account",
    pending: "Creating account",
    passwordHint: "At least 8 characters.",
    switchPrompt: "Already have an account?",
    switchLink: "Sign in",
    confirmEmail: "Check your email for a confirmation link, then sign in.",
  },
  fields: {
    email: "Email",
    password: "Password",
  },
  errors: {
    missingFields: "Enter your email and password.",
    invalidCredentials: "That email and password don't match an account.",
    alreadyRegistered: "An account with that email already exists. Sign in instead.",
    weakPassword: "Your password needs at least 8 characters.",
    invalidEmail: "That email address doesn't look right.",
    unexpected: "Something went wrong on our end. Try again.",
  },
} as const;
