import type { Metadata } from "next";
import { copy } from "../../copy";
import { AddDraftForm } from "./add-draft-form";

export const metadata: Metadata = { title: copy.addDraft.title };

// With no Supabase the app layout shows the "accounts aren't set up" notice
// in place of this page. Nothing here queries Supabase.
export default function AddDraftPage() {
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
