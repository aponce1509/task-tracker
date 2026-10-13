---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status: done
maturity: evergreen
created: 2026-10-12 17:05
---
# [[The Issue System]]

An **issue** is just a description of something to be done.

> [!abstract] In one line
> A free-form note that describes something to be done: it lives in `08 - Issues/`, is executed through task checklists and is closed with a post-mortem.

## Definition

- An issue is just a description of something to be done. It can be as descriptive as needed: the body is free-form.
- It can be split into smaller tasks — `- [ ] short description` checklists. Comments and any hierarchy are allowed; the point is to help focus on the resolution.
- All issues live in `08 - Issues/` (one file per issue); archived ones live in `08 - Issues/complete/`.
- The project is indicated in the properties — `paras:` links to the PAR notes (e.g. `[[second-brain]]`).

## Properties

| Property | Meaning |
| --- | --- |
| `priority` | 0 = High · 1 = Medium · 2 = Low |
| `role` | core · milestone · pattern · debt |
| `dueDate` | target date |
| `dependencies` | links to other issues that must resolve first; empty when none |
| `status` · `maturity` | execution and knowledge lifecycle |

Full schema: [[Common Frontmatter Schemas & Specific Note Templates]] (class `issue`).

## Body conventions

Free form, with this shape:

- The description reads like an issue: enough context to understand the problem and to follow it later, without the conversation that created it.
- Tasks are concise. Each task can carry sub-bullets with comments, suggestions or anything that helps:
	```markdown
	- [ ] Task title
	  - Comment 1
	  - Suggestion
	- [ ] Task 2
	```
- Comments about the resolution can go next to the tasks, also when the post-mortem exists.
- An issue created from a meeting links back to the meeting note ([[The Meeting System]]).

When there is information worth flagging, prefer callouts:

- `> [!abstract]` — summary: what and why in two lines.
- `> [!info]` (or `> [!warning]` / `> [!danger]`) — rationale: the reasoning behind a decision or trade-off inside the issue.

## Creation

```bash
bash .obsidian/personal_scripts/create-issue.sh --title "Short description" \
  --project second-brain --subtype task --priority 1 --depends _I00005
```

- The script drives the running Obsidian app: it answers the template prompt, waits for numbering/rename/move and then fills the optional properties.
- Template: `99 - Meta/Templates/02 - Issues - Template.md` (Templater). It self-numbers (`_I00001 …`), asks the task name and files itself into `08 - Issues/`.
- Flags: `--project` (paras) · `--subtype` (bug, task, improvement, incident, open-problem, recurring) · `--priority` · `--depends` (repeatable) · `--open`.

## Post-mortem

Closing an issue includes a post-mortem, kept with its helper points at the end of the issue:

- Objective it moved · good things · bad things · rate 1-3.
- Entries feed the **project journal** (`journal.sh log --kind done --link "[[<issue>]]"`), for example [[Journal - second-brain]].
- Notes to create from it (taxonomy check): ending note — core note/index that builds the final solution —, reusable pieces, tech debt (Descriptive → Project Contexts → technical-debt), review of resources & tools used (External Knowledge → Resources), additional requirements (Normative → Requirements), ideas (Your Brain → Ideas), decisions or solutions when a pattern emerges.
- The `/postmortem` command (`99 - Meta/commands/postmortem.md`) guides the session; the helper points stay at the end of the issue.

## Related

- [[Common Frontmatter Schemas & Specific Note Templates]] — the `issue` class and the `dependencies` field
- [[Information Architecture & Taxonomy Model]] — [[Issues]] type and its subtypes
- [[Task Management]] — the MoC this note belongs to
- [[The Note Kinds]] — the map of all note kinds
