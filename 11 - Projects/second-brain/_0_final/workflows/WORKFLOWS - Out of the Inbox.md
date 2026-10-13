---
paras:
  - "[[second-brain]]"
type: "[[Standards]]"
subtypes:
  - "[[Normative - Standards - workflow|workflow]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-05-16 14:35
---
# [[WORKFLOWS - Out of the Inbox]]

> [!summary]
> Inbox processing gives a note a home, not perfection. The `inbox-triager` proposes, I decide note by note, and the note leaves `status: inbox` with its metadata and its place.

**Trigger:** any free slot of a few minutes · **Batch:** 5 notes, the oldest first · **Driven by:** `/guide-inbox-clean`

## Steps

- Pick the five oldest notes with `status: inbox`.
- The `inbox-triager` proposes, per note: keep or delete, identity, frontmatter, format, a short fill, issues, destination.
- Decide note by note: accept, change, skip or delete.
- Apply:
	- Delete → `.trash/`. The trash is the trace; no journal entry.
	- A meeting goes to `/parse-meeting`, learning material to `/new-concept`. The kind command does the rest.
	- Metadata: `paras`, `type`, `subtypes`; `status` leaves `inbox`.
	- Format and typos by the kind skill. Brain dumps, open questions and reflections get a short fill in my voice.
	- Todos that are real work → issues. The `#todo` tag goes.
	- Move to its folder ([[Organise - CODE]]). Create the PAR first with [[WORKFLOWS - New PAR]] when needed.
- `maturity` stays `capture`, unless the note is already refined (then `distilled`).
- Run the engine audit at the end.

## Tidies

- Inbox, references, notes without `paras`, legacy marks on sight.
