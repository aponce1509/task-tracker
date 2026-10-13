# Note - Issue

An issue is just a description of something to be done. Canonical definition:
[[The Issue System]] (`11 - Projects/second-brain/_0_final/`).

## Identity & metadata

- `type: "[[Issues]]"`, exactly one subtype: bug, task, improvement, incident,
  open-problem, recurring - alias form `"[[Operational - Issues - bug|bug]]"`.
- Class `issue` (Metadata Menu) adds to the commons schema: `priority`
  (0 high, 1 medium, 2 low), `dueDate`, `role` (core/milestone/pattern/debt)
  and `dependencies` - wikilinks to other issues that must resolve first.
- Done state lives ONLY in `status: done` plus the `complete/` folder - no
  `complete:` key (legacy, migrated 2026-10-13).
- Project context goes in `paras:` (links to PAR notes).

## Placement

- Active issues: `08 - Issues/`, one file per issue, self-numbered
  `_I00001 Short description.md`.
- Archive: `08 - Issues/complete/`; todos live in `08 - Issues/todos/`.

## Creating an issue - use the script

```bash
bash .obsidian/personal_scripts/create-issue.sh --title "Short description" \
  --project second-brain --subtype task --priority 1 --depends _I00005
```

The script drives the running Obsidian app (CLI): it answers the Templater
"Task Name?" prompt, waits for the note to be numbered, renamed and moved,
then fills the optional properties.

| Flag | Effect |
| --- | --- |
| `--project <par>` | sets `paras: ["[[<par>]]"]` |
| `--subtype <slug>` | sets the issue subtype link |
| `--priority <0-2>` | sets `priority` |
| `--depends <issue>` | adds to `dependencies` (repeatable; number or note name) |
| `--open` | opens the note in Obsidian |

Notes:

- The template is `99 - Meta/Templates/02 - Issues - Template.md` (Templater).
  It self-numbers from the highest `_I\d{5}` in the folder, prompts the name,
  renames and files itself; the H1 gets the final numbered name via `tR`.
- Never use `obsidian create template=` for issues: it only resolves core
  `{{date}}`/`{{title}}` variables, not Templater code.
- Root-level target paths fail in the Templater CLI handler - always pass a
  folder path.

## Body conventions

- Tasks: `- [ ] short description`; comments and any hierarchy are free-form.
- Callouts when information deserves flagging: `> [!abstract]` summary,
  `> [!info]` rationale.
- Dependencies always as note-name wikilinks, e.g.
  `"[[_I00005 Developer UI & UX]]"` list items.

## Closing - post-mortem

The helper points of the Post-Mortem section stay at the end of the issue.
The `/postmortem` command (`99 - Meta/commands/postmortem.md`) guides the
session and fills them in place. Entries feed the project journal
(`journal.sh log --kind done --link "[[this issue]]"`; the
`project-journaling` skill owns when to log) and spawn follow-up notes
(ending note, reusables, tech debt, resources review, additional
requirements, ideas) - propose via the taxonomy, create only with user
approval. The journal close protocol produces the tech debt file.
