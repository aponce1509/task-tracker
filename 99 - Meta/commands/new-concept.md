---
description: Create concept notes from a topic or a source, starting from an approved creation graph, and link them into indexes, MoCs and the daily note
argument-hint: <topic, source note, or pasted material>
---

Create the concepts for: $ARGUMENTS

Concepts are the atoms of the vault; indexes and MoCs are the molecules that give them value. A concept never lands alone: the change is planned as a graph first, so every new concept has a source and a way in.

## Load first

- The `note-concept` skill (graph format, writing rules) and the `note-index-moc` skill.
- `11 - Projects/second-brain/_0_final/The Concept System.md` and `The Index and MoC System.md`: the specs. They win over anything else here.

## Steps

1. Sources. Search the vault (`obsidian search query="<topic>"`) for source notes (Medias, Resources) and for the material in $ARGUMENTS. If there is no source, ask the user for one or confirm that the user is the source.
2. Inventory. Search the existing concepts, indexes and MoCs of the topic, so the graph marks them `[exists]` instead of duplicating them.
3. Structure. Split the material into concepts, one idea each, each learnable in one day. Decide the relations (`uses`, `vs`, `part of`) and the navigation: which index or MoC to create or `extend`.
4. Show the creation graph and wait for approval. Use exactly the format of the `note-concept` skill: `Sources`, `Navigation`, `Concepts`, and a `MoC outline` line when a MoC is involved. Change it until the user approves.
5. Write the concepts.
	- One or two concepts: write them yourself with the skill.
	- More: one `concept-distiller` subagent per `[new]` concept, in parallel (Claude Code: Agent tool; OpenCode: task tool). Each starts with no context, so pass: the approved graph, the concept to write, the source content or path, the PAR and the target folder.
6. Navigation. Apply the `[new]` and `extend` lines of the graph with the `navigation-curator` subagent in apply mode (pass the approved Navigation block and the list of concept notes created), or yourself for a single small change.
7. Recall. Link each new concept from today's daily note, under `## Learned` (step 5 of the `note-concept` skill).
8. Audit: `bash "99 - Meta/skills/note-concept/scripts/audit.sh"` and `bash "99 - Meta/skills/note-index-moc/scripts/audit.sh"`. Fix only what this run caused.

## Output

The graph as applied (each node now `[exists]`), the notes created or changed, and the audit lines that concern them.

## Rules

- Nothing is written before the graph is approved: the graph is where the user decides the structure, and rework after writing is expensive.
- Rewrite sources in the user's style; never paste them as the concept body.
