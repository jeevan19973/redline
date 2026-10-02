# 13: Labeled fixture set

**What to build:** A labeled set of real documents that every eval target is measured against. The labels must come from someone qualified to read a commercial lease, not from the model and not from the brief's author alone (PRD section 4). Who that is has not been decided.

**Blocked by:** None (can start immediately)

**Status:** ready-for-human

- [ ] A labeller qualified to read a commercial lease is chosen
- [ ] The set covers all four document types: Commercial lease, vendor or service contract, freelance agreement, vendor terms of service
- [ ] It includes documents with no Dangerous clause and documents with known Dangerous clauses
- [ ] It includes at least one Commercial lease that refers to a separate guaranty
- [ ] It includes at least one vendor terms of service containing Non-negotiable clauses
- [ ] Each document is labeled with its expected flags, severities and Readings, plus fixture questions the document cannot answer
- [ ] The measured targets in PRD section 4 are agreed before the first eval run
- [ ] No fixture contains anything that cannot be committed to the repo
