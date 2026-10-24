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
created: 2026-10-14 00:20
---
# [[WORKFLOWS - End Week]]

> [!summary]
> The weekly spotlight in fifteen minutes: what got done, what rolled, the recall of the week, old open questions, stale issues and silent projects. It is the only weekly moment that looks at the system.

**Trigger:** Friday afternoon, or Sunday evening · **Timecap:** 15 minutes · **Driven by:** `/weekly-review end`, which runs `/spotlight` and offers `/recall week`

## Steps

- Completed tasks: list the issues done this week, from the issue bases or the journals.
- Workload: did I overcommit? A task that rolled every day gets dropped, split or sent back to its issue with a lower priority.
- Recall: run `/recall week` on the concepts of `## Learned` of the week. Open questions land as `#rfm`, topics as `Read:` lines.
- Open questions: each `#rfm` older than a week gets a decision.
	- Answered → write the answer in the note and remove the tag.
	- Worth work → `/create-issue`.
	- No longer relevant → delete the line.
- Issues: a `wip` issue not touched this week becomes `blocked`, goes back to `inbox`, or closes. A `done` issue outside `08 - Issues/complete/` moves there.
- PARs: an active project with no progress for two weeks gets [[WORKFLOWS - End PAR]] (paused) or a reason in its PAR note.
- Highlights: two or three lessons or milestones of the week in the weekly note.
- Set `cleanSystem: true` in the weekly note.

## Tidies

- Unrecalled concepts, open flags (`#rfm`), issues, PARs.
