import type { Metadata } from "next";
import Link from "next/link";
import { supabaseConfig } from "@/lib/env";
import { copy } from "../../copy";
import { AddDraftForm } from "./add-draft-form";
import { AnalyzeForm } from "./analyze-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: supabaseConfig() ? copy.addDraft.title : copy.analyze.title };
}

// With accounts, this page saves a Draft and its page runs the analysis.
// With no Supabase there are no accounts, so it analyzes pasted text on the
// spot and saves nothing. Nothing here queries Supabase.
export default function AddDraftPage() {
  if (!supabaseConfig()) return <AnalyzeWithoutAccount />;

  return (
    <section className="pane" aria-labelledby="add-draft-title">
      <header className="pane__head">
        <h1 className="pane__title" id="add-draft-title">
          {copy.addDraft.title}
        </h1>
        <p className="pane__intro">{copy.addDraft.intro}</p>
      </header>
      <AddDraftForm />
    </section>
  );
}

// The whole page when no account exists: the signed-out top bar over the
// water, with the form on paper.
function AnalyzeWithoutAccount() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <Link className="wordmark" href="/" aria-label="Underline, home">
            Underline
          </Link>
        </div>
      </header>
      <main id="main" className="solo">
        <section className="pane" aria-labelledby="analyze-title">
          <header className="pane__head">
            <h1 className="pane__title" id="analyze-title">
              {copy.analyze.title}
            </h1>
            <p className="pane__intro">{copy.analyze.intro}</p>
          </header>
          <AnalyzeForm />
        </section>
      </main>
    </>
  );
}
