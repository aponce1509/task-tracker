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
created: 2026-10-14 00:25
---
# [[WORKFLOWS - Complete Issue]]

> [!summary]
> Closing an issue keeps its lessons and its spin-offs. The post-mortem fills the issue, new work becomes new issues, what I learned becomes concepts, and the journal logs the completion.

**Trigger:** the last task of an issue is done · **Timecap:** 15 minutes · **Driven by:** `/complete-issue`, the `project-journaling` skill

## Steps

- Tasks: all checked. Open tasks that still matter move to a new issue with `/create-issue`.
- Post-mortem: `/complete-issue` guides it. It fills the Post-Mortem section: objective moved, good things, bad things, rate, notes to create.
- Spin-offs:
	- A quick fix or a new bug → `/create-issue`, with `--role debt` for tech debt.
	- Something I learned → [[WORKFLOWS - Learning Session]].
	- A solution worth reuse → a note linked from the project MoC.
- Todo sweep on the issue: no `#todo` line stays in a closed issue.
- Done-rule: `status: done` and move the file to `08 - Issues/complete/`. Both, or neither.
- Journal: the `project-journaling` skill logs the completion through `journal.sh`, with the issue linked.

## Tidies

- Issues hygiene, journals, open flags.
- Orphan knowledge: the lesson gets a concept before I forget it.
