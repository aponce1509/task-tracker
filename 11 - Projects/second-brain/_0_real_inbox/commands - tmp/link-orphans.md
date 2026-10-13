New. The tidy-while-learning loop on demand, when the audits show orphans or thin indexes.

- Argument: `[topic]`, default all
- Load: `note-index-moc`, `navigation-curator` (find mode, then apply)
- Steps
	- Run the concept and index audits; collect orphan concepts, `no-concept`, `single`, `moc-unlinked`
	- `navigation-curator` find mode: where each orphan belongs, which concept a thin index misses
	- Show the plan as a small graph; approval stop
	- `navigation-curator` apply mode with the approved plan
	- Rerun the audits; show before and after counts
- Output: plan, applied links, audit deltas
- Rules
	- Never invent a concept to fill an index; missing ones become `/new-concept` suggestions
	- Batches of 5 orphans
