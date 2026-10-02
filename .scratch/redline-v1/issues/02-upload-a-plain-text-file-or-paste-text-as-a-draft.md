# 02: Upload a plain-text file or paste text as a Draft

**What to build:** A Signer uploads a plain-text file or pastes the document's text. It is read in their browser, and only the extracted text is sent to the server and stored as a new Draft. The Draft appears in the library, newest first, and opening it shows the extracted text so the Signer can confirm Underline read the document they meant (ADR 0001: the stored text is what every later citation is checked against).

**Blocked by:** 01 (Sign in to an empty library)

**Status:** done

- [x] A `drafts` table is added by a migration: id, owner, title, extracted text, created at. No original-file column and no deal or grouping column (ADR 0005)
- [x] Row-level security limits every Draft to its owner
- [x] A `.txt` file is read in the browser; the original file is never uploaded or stored
- [x] Pasted text creates a Draft the same way, stored exactly as pasted; the title has no file name to default to, so the Signer names it
- [x] The Draft title defaults to the file name and can be edited before saving
- [x] The library lists the Signer's Drafts newest first
- [x] Opening a Draft shows its exact extracted text
- [x] Each upload, including a re-upload of the same file, creates its own Draft
- [x] A second Signer cannot see or open the first Signer's Drafts

## Comments

2026-10-01 (unattended build run): Built. Typecheck and build pass. The drafts migration and its RLS were checked against the local database inside a rolled-back transaction (each Signer sees only their own Drafts; cross-owner insert, delete and any update are refused; CRLF text round-trips byte for byte). Not run end to end in a browser, because the migration is not applied. Decisions: server-action body limit raised to 2 MB with a plain message above it; a loaded .txt is shown read-only so the stored text equals the file's text; the title keeps the .txt extension; dates show in UTC.
