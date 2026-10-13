---
description: Clean a batch of inbox notes - triage with the inbox-triager subagent, then apply the approved metadata, format, issues and moves note by note
argument-hint: "[number of notes, default 5]"
---

Clean the inbox: $ARGUMENTS notes (default 5).

Inbox processing is about giving each note a home, not about perfection. Small batches keep the review honest; the user approves every change because the inbox holds the user's own raw thinking.

## Load first

- The `obsidian-vault-notes` skill and `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - Out of the Inbox.md`.

## Steps

1. Pick the batch: the N oldest notes in `09 - Inbox/` by `created` (or by file date when `created` is empty).
2. Triage. Delegate to the `inbox-triager` subagent (Claude Code: Agent tool; OpenCode: task tool) with the list of paths. It is read-only and returns one proposal per note and a summary table.
3. Show the table. Then go note by note: show the proposal for one note and wait for the user's decision (accept, change, skip, delete).
4. Apply the decision for that note:
	- Delete: move the file to `.trash/`; never `rm`.
	- Metadata: fix the frontmatter (`paras`, `type`, `subtypes`, `status` leaves `inbox`).
	- Format and typos: per the skill of its kind.
	- Fill: for a brain dump, open question or reflection, add the approved short development, in the user's voice.
	- Issues: create the approved ones with the `note-issue` skill, each linking the note.
	- New PAR: when the note needs a Project, Area or Resource that does not exist, create the PAR note from `99 - Meta/Templates/09 - PARA Note - Template.md` only with approval.
	- Move: to the approved folder (`git mv` when tracked, `mv` otherwise), then check that links still resolve.
5. After the batch: `python3 "99 - Meta/skills/system-reference-maintance/scripts/audit.py"` and report new drift.

## Output

One line per note: `<note> → <destination | deleted | skipped>`, plus issues and PARs created, then the audit result.

## Rules

- One note at a time after the table: the user decides, the agent applies. Never apply a whole batch on one approval.
- Never guess a PAR. A wrong home hides the note; the inbox at least keeps it visible.
- Notes stay in the user's voice: no comments addressed to the user.
