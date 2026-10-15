---
name: note-index-moc
status: draft
description:
  Create index and MoC notes in this vault and do the linking between
  concepts, indexes and MoCs - bullets-only indexes, prose MoCs, bold entries
  for navigation notes, reachability from the global index. Use when a new
  index or MoC is needed or a creation graph marks one to extend. Creation only.
---

# Note - Index and MoC

Spec (source of truth, read it first): `11 - Projects/second-brain/_0_final/The Index and MoC System.md`.
Shared rules: the `obsidian-vault-notes` skill. Concepts: the `note-concept` skill.

## Decide the kind

- Value only in which notes and how they group → index.
- Explains how notes connect, in an order or as a map → MoC.
- One topic often needs both: the index lists, the MoC explains, the index links the MoC in bold.

## Metadata

```yaml
---
paras: ["[[<par>]]"]
type: "[[Indexes]]"          # or "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - Indexes - topic-index|topic-index]]"
  # domain-moc | project-moc | area-moc; global-index only for the root
rate:
tags: []
status: done                 # wip for a MoC draft
maturity: evergreen
created: YYYY-MM-DD HH:mm
---
```

Folder: `00 - Map of Contents/`, or next to the content. Template: `99 - Meta/Templates/08 - Index & MoCs - Template.md`.

## Write an index

- `# [[Title]]`, then one `> [!abstract]` callout: the question the index answers.
- Only bullets. No prose paragraphs, no per-link commentary. Any short bullet is fine (link, group label, path).
- Nest as deep as needed, tab-indented, no blank lines in the list. Headers only to group a long list.
- Index or MoC entries in bold: `- **[[Clustering model training]]**`.
- More than one entry; at least one concept. Link the new index from the root ([[Your main notes]], under its domain group) or from an index already reachable from it.
- Never create a second `global-index`: the vault has one root.

## Write a MoC

- `# [[Title]]`, then `> [!abstract] Title` with bullets on the next line, no empty `>` line: the flow the MoC covers and what it maps, as short impersonal phrases (as in the spec example "Scale, pick the algorithm, measure"). Never first person ("I can name"), never "the reader can".
- Prose in ASD-STE100 that links concepts. Use the order of the flow when the topic has one.
- `domain-moc`: link concepts, not issues. `project-moc` / `area-moc`: may link the issues, meetings and journal of the project or area. Unresolved links are allowed for concepts still to write.
- Link the new MoC from at least one index, in bold.

## Extend

When a creation graph marks `extend`:

- Index: add the new concept by its title in the right group. Keep existing entries; prune only when the user asks.
- MoC: add the concept only when it changes the flow; rewrite the affected sentence, not the whole MoC.

## Guardrails

- Never invent notes to fill an index. Unresolved links only for concepts that the graph marks `[?]`.
- Never put issues, meetings or journals in a `topic-index` or `domain-moc`; work belongs in a `project-moc` or `area-moc`.
- Write as the user would: no notes addressed to the user.
- Audit after a change: `bash "99 - Meta/skills/note-index-moc/scripts/audit.sh"`.
