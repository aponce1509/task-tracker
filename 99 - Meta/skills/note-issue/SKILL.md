---
name: note-issue
status: draft
description:
  Create an issue note in this vault (08 - Issues) through create-issue.sh
  and write its body - context, concise tasks with sub-bullets, links back to
  the meeting that produced it. Use whenever a todo, bug or improvement must
  become an issue. Creation only.
---

# Note - Issue

Spec (source of truth, read it first): `11 - Projects/second-brain/_0_final/The Issue System.md`.
Shared rules (properties, taxonomy, tags, writing style): the `obsidian-vault-notes` skill.

## Create - always through the script

```bash
bash .obsidian/personal_scripts/create-issue.sh --title "Short description" \
  --project second-brain --subtype task --priority 1 --depends _I00005
```

| Flag | Effect |
| --- | --- |
| `--project <par>` | sets `paras: ["[[<par>]]"]` |
| `--subtype <slug>` | bug, task, improvement, incident, open-problem, recurring |
| `--priority <0-2>` | 0 high, 1 medium, 2 low |
| `--role <role>` | core, milestone, pattern, debt |
| `--depends <issue>` | adds to `dependencies` (repeatable; number or note name) |
| `--open` | opens the note in Obsidian |

- The script drives the running Obsidian app: it answers the Templater prompt, waits for numbering, rename and move, then fills the properties.
- Never use `obsidian create template=` for issues: it does not run Templater code.
- Never hand-create an issue file and never invent its `_I` number.
- Done state is only `status: done` plus the `08 - Issues/complete/` folder. Never write a `complete:` key.

## Write the body

After the script returns the note path, fill the body with the Edit tool:

- `> [!abstract]` on top: what and why, two lines.
- Description: enough context to understand and follow the problem without this conversation. State the problem, where it shows, and what done means.
- Tasks: concise `- [ ] Task title`, sub-bullets (two spaces) for comments and suggestions. No long prose inside a task.
- Created from a meeting: link the meeting note in the description (`From [[_M00003 Sprint planning]].`) and add the issue to the meeting `## Todos`.
- Dependencies: `--depends` flag, never only in prose.
- Leave the `## Post-Mortem` helper points untouched at the end; `/postmortem` fills them.

## Guardrails

- Gather context first. When the request has no clear problem, PAR or definition of done, ask the user before running the script.
- Split into several issues only when the parts are really independent (different PAR, different done). Otherwise use tasks in one issue.
- Write as the user would: no notes addressed to the user, no "TODO for you".
- On completion (`status: done`), the `project-journaling` skill logs it.
