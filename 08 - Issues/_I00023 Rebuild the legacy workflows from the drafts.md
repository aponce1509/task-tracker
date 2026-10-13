---
file_class: issue
paras:
  - "[[second-brain]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - improvement|improvement]]"
role:
priority: 2
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-13 23:42
dueDate:
dependencies:
---
# [[_I00023 Rebuild the legacy workflows from the drafts]]

> [!abstract] Summary
> The four workflows in `_0_final/workflows/` still describe the process before the commands existed. Rebuild each one from its draft so the canonical workflows match `/guide-inbox-clean`, `/guide-distillation` and the `vault-auditor` agent.

## Description

- The legacy workflows are [[WORKFLOWS - Out of the Inbox]], [[WORKFLOWS - Bi-Monthly Inbox Sweep]], [[WORKFLOWS - Distillation of a Note]] and [[WORKFLOWS - Contextual Capture Review]]. They are manual step lists with numbered steps and pre-command wording.
- The drafts live in `11 - Projects/second-brain/_0_real_inbox/workflows - tmp/`, one per workflow: the steps mapped to the commands, the changes against the legacy version, and the open questions.
- Done when the four notes in `_0_final/workflows/` follow the drafts with the open questions answered, the links from [[The Second Brain System]] and [[The CODE system]] still resolve, and the tmp drafts are in `.trash/`.
- Related: [[_I00019 add to any workflow clean of todo tags]], its step belongs in the rebuilt workflows.

## Tasks

- [ ] Answer the open questions of each draft
- [ ] Rewrite Out of the Inbox
  - Driven by `/guide-inbox-clean`
- [ ] Rewrite Bi-Monthly Inbox Sweep
  - `/guide-inbox-clean` in batches plus the `vault-audi
- [ ] Rewrite Distillation of a Note
  - Driven by `/guide-distillation`
- [ ] Rewrite Contextual Capture Review
  - Decide if it gets its own command
- [ ] Fold in the todo-tag clean step of [[_I00019 add to any workflow clean of todo tags]]
- [ ] Update the links from the index and the CODE MoC; om the commands" from the index
- [ ] Move the tmp drafts to `.trash/`

## Post-Mortem

- We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
- Objective moved:
- Good things:
- Bad Things:
- Rate (1-3):
- Notes to create?
	- Ending note: core note/index that builds the final solution
	- Reusable in other places
	- Tech debt
	- Review of the resources & tools used
	- Additional requirements
	- Ideas