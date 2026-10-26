---
file_class: issue
paras:
  - "[[create-a-feed]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - improvement|improvement]]"
role: debt
priority: 2
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-26 14:23
dueDate:
dependencies:
  - "[[_I00044 News fetch, store and story clustering]]"
---
# [[_I00048 Story drift in long news events]]
> [!abstract]
> - A long event joins the previews, the result and the day after in one story, with one summary.
> - The note gets long and its summary shows only one part of the event.

## Description

Found while closing [[_I00033 Integration of the feed with Obsidian]]. The Brazil election (story 517, 17 outlets) holds "a coin-flip election" previews, the result ("Lula se impone a Flávio Bolsonaro") and "the challenges of his fourth term" in one story. The headlines share the same names, so the cosine stays over `τ = 0.72`, and the 36 h span of [[Feed and News Design]] still covers election eve to the day after. Done means a preview, a result and the reaction of the same event land in different stories on the test cases, and normal stories do not split.

## Tasks

- [ ] Collect test cases from a week of data: elections, votes, results with previews
  - `feeds_sync.py stories --since 7d` and `pairs`
- [ ] Try a shorter `SPAN` (24 h) or a higher `τ` with `recluster`, and compare the splits
- [ ] Try an LLM split question for big stories (the `merge_checks` way, the other direction)
  - The prompt rule "a preview and a result are different events" already guides the merges
- [ ] Keep the best option and note the result in [[Feed and News Design]]


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