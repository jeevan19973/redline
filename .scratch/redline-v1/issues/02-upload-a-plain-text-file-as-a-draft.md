# 02: Upload a plain-text file as a Draft

**What to build:** A Signer uploads a plain-text file. It is read in their browser, and only the extracted text is sent to the server and stored as a new Draft. The Draft appears in the library, newest first, and opening it shows the extracted text so the Signer can confirm Underline read the document they meant (ADR 0001: the stored text is what every later citation is checked against).

**Blocked by:** 01 (Sign in to an empty library)

**Status:** ready-for-agent

- [ ] A `drafts` table is added by a migration: id, owner, title, extracted text, created at. No original-file column and no deal or grouping column (ADR 0005)
- [ ] Row-level security limits every Draft to its owner
- [ ] A `.txt` file is read in the browser; the original file is never uploaded or stored
- [ ] The Draft title defaults to the file name and can be edited before saving
- [ ] The library lists the Signer's Drafts newest first
- [ ] Opening a Draft shows its exact extracted text
- [ ] Each upload, including a re-upload of the same file, creates its own Draft
- [ ] A second Signer cannot see or open the first Signer's Drafts
