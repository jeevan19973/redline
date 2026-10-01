# 08: The Signer's Red lines raise severity, with the Severity floor

**What to build:** A Signer sees the default Red lines and keeps their own list. Marking a catalog clause type as one they will not accept raises matching Caution flags to Dangerous. Nothing a Signer does to their Red lines can hide or lower a Dangerous flag (the Severity floor, ADR 0003). Each report records which Red lines it ran against, and the Signer can re-run analysis after changing them.

**Blocked by:** 07 (Clean verdict and guaranty gap)

**Status:** ready-for-agent

- [ ] A `red_lines` table is added by a migration (id, owner, kind, value, created at), with row-level security by owner
- [ ] The Signer can view the default catalog, read-only
- [ ] The Signer can add, edit and remove their own Red lines of the catalog kind
- [ ] A Signer's catalog Red line raises a matching Caution flag to Dangerous and marks it raised by that Red line
- [ ] The Severity floor is enforced in code after model output is parsed: no Red line change removes or lowers a Dangerous flag
- [ ] A flag crossing a Red line prevents the Clean verdict
- [ ] Every Report stores a snapshot of the Red lines it ran against, and the Draft page shows them
- [ ] Changing Red lines does not rewrite past Reports; the Signer can re-run analysis on a Draft, which replaces its Report
- [ ] Deterministic tests with the fake client: a Red line raises a Caution flag to Dangerous and marks it; a Dangerous flag still appears when the matching Red line is removed
