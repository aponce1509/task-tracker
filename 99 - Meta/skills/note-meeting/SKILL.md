---
name: note-meeting
status: draft
description:
  Create and parse meeting notes in this vault - keep the raw notes, put the
  take-aways and callouts on top, turn todos into issues that link back, and
  log the meeting in the project journal. Use when the user shares meeting
  notes, a transcript or asks for a meeting note. Creation only.
---

# Note - Meeting

Spec (source of truth, read it first): `11 - Projects/second-brain/_0_final/The Meeting System.md`.
Shared rules: the `obsidian-vault-notes` skill. Issues: the `note-issue` skill. Journal: the `project-journaling` skill.

## Context

Before writing, know: the PAR, the date, who was there and why the meeting happened. When the user gives raw notes without this context, ask once.

## Create

- Folder `<base>/<PAR>/Logs/_M/`, file `_M<NNNNN> <Meeting name>.md`. Compute the next number from the files in that folder (start at `_M00001`).
- Frontmatter: `type: "[[Meetings]]"`, one subtype of `sync`, `planning`, `retrospective`, `1on1`, `paras:` the PAR, `status: inbox`, `maturity: capture`.
- Body sections as in the spec. The raw notes go under `## Notes` exactly as given; never rewrite or drop them.

## Parse

1. Take-aways: key points, decisions, ideas and comments, as short bullets. Ideas and comments stay here unless the user asks for their own note.
2. Callouts on top: `> [!abstract]` with why we met and what we decided; add `warning`, `question` or `info` only when the meeting raised a risk, an open point or a rationale.
3. Todos: propose each one as an issue (title, subtype, priority). After approval, create them with the `note-issue` skill; each issue links back to the meeting, and `## Todos` links each issue.
4. Journal: log the meeting without a separate request, `journal.sh log --kind meeting --what "<one line>" --link "[[<meeting note>]]"` (the `project-journaling` skill gives the flow).
5. Set `status: done` and `maturity: distilled`.

For long dumps or transcripts, hand steps 1 to 3 to the `meeting-extractor` agent and review its proposal.

## Guardrails

- Never invent decisions, owners or dates that are not in the notes.
- Never create issues without approval of the list.
- Write as the user would: no notes addressed to the user.
