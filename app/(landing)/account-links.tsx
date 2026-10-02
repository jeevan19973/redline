"use client";

import { useEffect, useState } from "react";
import { supabaseConfig } from "@/lib/env";
import { copy } from "./copy";

// The landing page's account links. The page is static and the server never
// checks who is asking, so every visitor first gets the signed-out links
// (sign up with an invite code, or sign in). Once the page is in the browser,
// a Signer who is already signed in sees a link to their library in its
// place. Nobody is redirected.
//
// These are plain anchors, not next/link: leaving the landing page is a full
// page load, so its stylesheet never comes along into the app (page.tsx).

// Whether this browser holds a Supabase session. getSession reads the auth
// cookie the app already set; it makes no network call unless that session
// has expired and needs refreshing. With no Supabase configured there are no
// accounts, so the answer is always no. Checked once and shared by every
// link on the page.
let signedInCheck: Promise<boolean> | null = null;

function checkSignedIn(): Promise<boolean> {
  const config = supabaseConfig();
  if (!config) return Promise.resolve(false);
  signedInCheck ??= import("@supabase/ssr")
    .then(({ createBrowserClient }) =>
      createBrowserClient(config.url, config.key, {
        // Only reads the session: no token timers, and no sign-in callback
        // handling, which belongs to the auth pages.
        auth: { autoRefreshToken: false, detectSessionInUrl: false },
        isSingleton: false,
      }).auth.getSession(),
    )
    .then(({ data }) => Boolean(data.session))
    .catch(() => false);
  return signedInCheck;
}

function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let current = true;
    checkSignedIn().then((value) => {
      if (current) setSignedIn(value);
    });
    return () => {
      current = false;
    };
  }, []);
  return signedIn;
}

function Arrow() {
  return (
    <svg className="action__arrow" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}

function Action({ href, label, small = false }: { href: string; label: string; small?: boolean }) {
  return (
    <a className={small ? "action action--small" : "action"} href={href}>
      <span>{label}</span>
      <Arrow />
    </a>
  );
}

export function TopbarAccount() {
  const signedIn = useSignedIn();
  if (signedIn) {
    return (
      <a className="link" href="/library">
        {copy.account.library}
      </a>
    );
  }
  return (
    <>
      <a className="link" href="/sign-in">
        {copy.account.signIn}
      </a>
      <Action href="/sign-up" label={copy.account.signUp} small />
    </>
  );
}

export function HeroAccount() {
  const signedIn = useSignedIn();
  if (signedIn) return <Action href="/library" label={copy.account.openLibrary} />;
  return (
    <>
      <Action href="/sign-up" label={copy.account.signUp} />
      <p className="fine">{copy.hero.invite}</p>
      <p className="fine fine--account">
        {copy.account.hasAccount}{" "}
        <a className="link" href="/sign-in">
          {copy.account.signIn}
        </a>
      </p>
    </>
  );
}

export function CloseAction() {
  const signedIn = useSignedIn();
  if (signedIn) return <Action href="/library" label={copy.account.openLibrary} />;
  return <Action href="/sign-up" label={copy.account.signUp} />;
}

export function FootAccount() {
  const signedIn = useSignedIn();
  return signedIn ? (
    <a className="link" href="/library">
      {copy.account.library}
    </a>
  ) : (
    <a className="link" href="/sign-in">
      {copy.account.signIn}
    </a>
  );
}
