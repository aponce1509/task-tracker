---
name: note-concept
status: draft
description:
  Create concept notes (Core Knowledge atoms) in this vault. Starts from the
  creation graph - sources, indexes and MoCs to create or extend, concepts and
  their relations - and writes each concept as a researcher note in
  ASD-STE100 with LaTeX, linked from the daily note. Use when the user learns
  or must learn something. Creation only.
---

# Note - Concept

Spec (source of truth, read it first): `11 - Projects/second-brain/_0_final/The Concept System.md`.
Shared rules: the `obsidian-vault-notes` skill. Indexes and MoCs: the `note-index-moc` skill.

## Flow

1. Sources: find them in the vault (`obsidian search query="<topic>"`) or ask the user. Never invent a source.
2. Graph: search the existing concepts, indexes and MoCs of the topic, then draw the creation graph (format below). Show it and wait for approval. Change it until the user approves.
3. Write: one note per `[new]` concept (template `99 - Meta/Templates/Concept - Template.md`). For many concepts, hand each one to a `concept-distiller` agent with the approved graph.
4. Navigation: apply the `[new]` and `extend` entries of the Navigation block with the `note-index-moc` skill (or the `navigation-curator` agent).
5. Recall: link every new concept from today's daily note, as a bullet under `## Learned`. Get the file with `obsidian daily:path` and insert with the Edit tool; if the section does not exist (older notes), add `## Learned` before `## WIPS Notes`, or at the end. A link, never an embed.
6. Audit: `bash "99 - Meta/skills/note-concept/scripts/audit.sh"` and fix what the new notes caused.

## Graph format

```
Sources
  [exists] Article - Clustering with sklearn
  [new]    Video - StatQuest kmeans

Navigation
  [exists] Index: Clustering models          (extend: +gaussian-mixtures)
  [new]    MoC:   Clustering model training  (linked from the Index)

Concepts
  [new]    kmeans            <- Video - StatQuest kmeans
    uses   [exists] scaling
    uses   [?]      inertia
  [new]    gaussian-mixtures <- Article - Clustering with sklearn
    vs     kmeans
  [exists] silhouette-score  (cited by the MoC, not touched)

MoC outline: scaling -> pick algorithm (Index) -> inertia, silhouette -> overfitting
```

- Every node is `[new]`, `[exists]`, `extend` or `[?]` (a link to a note that does not exist yet).
- Every new concept has a source (`<-`) or the user as the source.
- Every new concept has a way in: an index or MoC that links it.

## Write a concept

- Frontmatter as in the spec: `type: "[[Core Knowledge]]"`, subtypes from `concept`, `framework`, `principle`, `culture` (only those that apply), `paras:` the resource or area, `status: done`, `maturity: capture`.
- Folder `13 - Resources/<resource>/`, `09 - Inbox/` when the PAR is not clear. Title is the concept name, no prefix.
- `> [!abstract]` on top: what it is, what it solves, the key idea or formula.
- Style of a mathematics or computer science researcher: definitions, notation, formulas in LaTeX (`$...$`, `$$...$$`), short ASD-STE100 sentences.
- One idea per note. When the draft holds two ideas, propose a split.
- At least one outgoing link to a concept or a source. Unresolved links are fine.

## Guardrails

- Never write before the graph is approved.
- `#learnable` marks what the user wants to say from memory. Add it only when the user asks; never use it as a state.
- Never copy text from a source as the concept body; rewrite it in the user's style.
- Write as the user would: no notes addressed to the user.
