import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <Link className="wordmark" href="/" aria-label="Underline, home">
            Underline
          </Link>
        </div>
      </header>
      <main id="main" className="auth">
        {children}
      </main>
    </>
  );
}
