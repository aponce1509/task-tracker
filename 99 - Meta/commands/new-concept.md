---
description: Draft - create concepts from a topic or source, starting from the creation graph
---

Draft command. Create the concepts for $ARGUMENTS (a topic, a source note or pasted material).

- Load the `note-concept` skill.
- Look for sources in the vault or ask the user.
- Draft the concept structure: which concepts, one idea each.
- Look which indexes and MoCs may be relevant (exist, extend, new).
- Suggest the graph (ASCII tree with `[new]`, `[exists]`, `extend`, `[?]`) and wait for approval.
- Write the notes
	- One `concept-distiller` agent per new concept, with the approved graph and its source.
	- The `navigation-curator` agent applies the index and MoC part of the graph.
	- Link each new concept from today's daily note.
- Run the concept and index/MoC audits; report what is left.
