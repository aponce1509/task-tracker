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
created: 2026-10-24 20:59
dueDate:
dependencies:
---
# [[_I00042 Strata pane refits when the diagram grows]]

> [!abstract]
> - The Diagram pane fits the diagram only when it opens or on a fit action.
> - When an agent or I add nodes, the diagram grows past the pane and I must press `0` to see it all.

## Description

- In `DiagramView` (`src/main.ts`) the `fitted` flag is set in `fit()` and reset only in `setState` (open). `onRender` and `onResize` refit only while the flag is false.
- So a save or a resize keeps the view, which is right after I zoomed or panned, but wrong when I did not touch the view and the diagram grew.
- Shows in [[strata-elements-plugin-pane]], state `FitAtOpen` (Known limit in Details).
- Done: when I have not moved the view since the last fit, a render that changes the diagram size fits it again; after a zoom or pan the view stays.

## Tasks

- [ ] Track "moved by me" apart from "fitted once"
  - set it on zoom, pan and keys; clear it on `fit()`
- [ ] Refit on render and on resize while the view is not moved
- [ ] Test with an agent adding nodes to an open diagram
- [ ] Update [[strata-elements-plugin-pane]]: drop the Known limit, rename `FitAtOpen` if the state means fit again


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