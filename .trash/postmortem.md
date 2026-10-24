---
description: Guided post-mortem for a second-brain issue; fills the issue's Post-Mortem section and cleans the notes-to-create helper list down to the notes actually created
---

Run the post-mortem for the issue in $ARGUMENTS (accepts an issue number like `_I00020`, a note name, or a path; when empty, take the most recently modified open issue in `08 - Issues/`, never from `complete/` or `todos/`).

Read first, then guide, never invent answers:

- the issue itself;
- `11 - Projects/second-brain/_0_final/The Issue System.md` — conventions and the post-mortem protocol;
- `11 - Projects/second-brain/_0_real_inbox/Postmortem Content.md` — the question bank behind the protocol.

Walk the user through the post-mortem conversationally, one topic at a time:

1. Objective moved — which personal or work objective this issue moved.
2. Good things and bad things.
3. Rate 1-3.
4. Journal — the completed issue is logged in the project journal through the `project-journaling` skill (`journal.sh log --kind done --link "[[<issue>]]"`); add the good and bad things to that entry.
5. Notes to create — propose per the taxonomy and create only after explicit confirmation, following the obsidian-vault-notes skill: ending note (core note/index that builds the final solution; reusable pieces), tech debt (Descriptive → Project Contexts → technical-debt), review of the resources & tools used (External Knowledge → Resources), additional requirements (Normative → Requirements), decisions or solutions when a pattern emerges, ideas (Your Brain → Ideas).

Then update the issue:

- Fill the `## Post-Mortem` section in place, with nothing below it. The "Notes to create?" sub-list in the template is only reference and inspiration: when closing, clean it so it keeps only the links to the notes actually created (one bullet per note). When none was created, replace the list by a single `- Notes created: none` bullet.
- Keep entries short.
- Update `rate:` in the frontmatter if the user gave one.
- Do not move or rename the file — archiving to `08 - Issues/complete/` is a separate step.
