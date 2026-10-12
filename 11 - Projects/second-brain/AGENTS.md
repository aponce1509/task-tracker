# Second Brain — Build Memory

This file is the memory of the second brain build: objective, current state, and the files close to final. Read it first when working in `11 - Projects/second-brain/`. Append to the status log; never rewrite history.

> [!note] This file intentionally has no YAML frontmatter
> It is agent memory, not a vault note: it is invisible to Bases and search.

## Objective & Scope

Build a personal second brain that:

- Tracks past knowledge — a set of indices to recover information, plus a notebook for learning. Reference: `09 - Inbox/Second Brain MoC.md`.
- Reduces mental load while improving productivity — a clear task methodology, a development diary, and knowing what to extract from it.
- Incorporates AI into the system.

It is explicitly not meant to be the default documentation of a project.

## Current State

The canonical definition lives in `11 - Projects/second-brain/_0_final/`. The rest of the vault — `_0_real_inbox/`, the outlines, and the building blocks — is the semi-productive backlog converging toward it slowly.

Entry point: `_0_final/The Second Brain System.md` — a Zettelkasten-style index that lists every canonical note. New notes get appended there; entries are only pruned when a new index replaces it.

## File Inventory

### Close to final (productive)

| File | Role | Notes |
| --- | --- | --- |
| `_0_final/The Second Brain System.md` | Index / entry point | Zettelkasten-style: every canonical note, with sub-notes nested. Resolves the previously broken `[[The Second Brain System]]`. |
| `_0_final/The Metadata system.md` | MoC of the metadata core | The de-facto hub: three engines, system files, agent rules. |
| `_0_final/Information Architecture & Taxonomy Model.md` | Specs | Type + subtypes taxonomy; generated, never hand-written. |
| `_0_final/Common Frontmatter Schemas & Specific Note Templates.md` | Specs | Properties engine and class schemas. |
| `_0_final/Tag System & Ontology.md` | Specs | The only 4 canonical tags. |
| `_0_final/All Obsidian commands.md` | Resources / tool | Dataview utility listing every command. |

### Skeleton (operational, in continuous improvement)

- `.obsidian/personal_scripts/taxonomy.json` — taxonomy source of truth (9 clusters, 25 types, 103 subtypes).
- `.obsidian/personal_scripts/subtypes_generation.sh` — generator for types/subtypes notes.
- `02 - Categories/_types/` and `02 - Categories/_subtypes/` — generated notes.
- `99 - Meta/Class/` — Metadata Menu classes (commons, note, par, issue, learning, media, normatives, type, subtype).
- `04 - Bases/final-bases/` — the final Bases views.
- `99 - Meta/Templates/` — note templates (a duplicate `Templates 1/` folder exists: open item, not yet resolved).

### Backlog (not yet consolidated)

- `_0_real_inbox/` — the ~40 working notes from the previous iteration.
- Outlines: `Second Brain Outline`, `Mid Term Second Brain Outline`, `Notes a base system`, `Second Brain MVP`, `Second Brain Issues`.
- `Second Brain Building Blocks` — the high-level description of the whole system.

## Planned MoCs

Maps of content describe the system as a whole (how I stay productive), not the taxonomy clusters:

- CODE framework — how I capture, organise, distill and express.
- Product documentation.
- Task management.
- Others, defined progressively.

## Open Threads

- `09 - Inbox/Second Brain Rules Extract.md` — dated audit of the whole system (rules, gaps, TODOs, contradictions). Keep as reference; do not duplicate here.
- Legacy tag model still coexists with the new one; taxonomy largely unused; bases not fully wired.

## Agent Rules

- Never hand-edit generated files (`02 - Categories/_types`, `_subtypes`); edit `taxonomy.json` and regenerate.
- New type/subtype/tag proposals go through the vault skill workflow — never invented ad hoc.
- `_0_final/` docs lead; the rest of the vault catches up.
- When a new canonical note lands in `_0_final/`, add it to the index (`The Second Brain System.md`) and to the File Inventory here. The index is append-only until a new index replaces it.

## Status Log

- 2026-10-12 — agents.md created. `_0_final/The Second Brain System.md` added as the index/entry point.
- 2026-10-12 — index reframed to Zettelkasten style: every canonical note listed, taxonomy spec sub-notes nested under it.
