---
file_class: issue
paras:
  - "[[second-brain]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - bug|bug]]"
role:
priority: 2
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-24 21:00
dueDate:
dependencies:
---
# [[_I00043 Strata node colors follow note status changes]]

> [!abstract]
> - A linked node takes the color of its note `status` only when its pele block renders.
> - When I change the `status` of a linked note, the open diagram keeps the old color until the block renders again.

## Description

- The Block renderer colors a linked node without a status class in `wireLinks()` (`src/main.ts`), after each Pele render, from the metadata cache.
- A metadata change of the linked note runs the debounced `rebuild()` of the tree, but it does not re-render or re-color the open blocks that link to that note.
- Shows in [[strata-elements]] and [[strata-features]]: set an element note to `wip`, the parent diagram stays `done` until I edit the parent or reopen it.
- Done: a `status` change of a note updates the color of every rendered node that links to it, without a re-render of the whole block.
- See [[strata-elements-plugin-render]].

## Tasks

- [ ] Keep, per rendered block, the linked node elements and their target notes
  - `wireLinks` already resolves each target; store the pair there
- [ ] On metadata change of a note, re-apply the status class on the nodes that link to it
  - only nodes without a class in the diagram; a class in the diagram wins
- [ ] Do the same in the Diagram pane, which uses the same `wireLinks`
- [ ] Test: change the `status` of `strata-elements-cli` with [[strata-elements]] open
- [ ] Update the Details of [[strata-elements-plugin-render]]


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