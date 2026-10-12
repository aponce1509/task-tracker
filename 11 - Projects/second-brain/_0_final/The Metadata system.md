---
paras:
  - "[[second-brain]]"
type: "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - MoCs - domain-moc|domain-moc]]"
rate:
tags:
status: done
maturity: evergreen
created: 2026-10-12 13:34
---
# [[The Metadata system]]

The vault retrieves notes through **three engines**. Every dimension of a note belongs to exactly one of them.

## The Three Engines

1. **Properties** — structured metadata: state, lifecycle, rating, tracking
	→ [[Common Frontmatter Schemas & Specific Note Templates]]
2. **Taxonomy** — identity: one immutable `type` + `subtypes`, generated from `taxonomy.json`
	→ [[Information Architecture & Taxonomy Model]]
3. **Tags** — only 4 cross-references: `#learnable` · `#sentations_request` · `#rfm` · `#todo`
	→ [[Tag System & Ontology]]

Context is a fourth, separate mechanism: **PARA links** in the `paras:` property.

> [!important] One-rule summary
> **Type** says what it is · **Properties** say how it is · **PARA** says where it belongs · **Tags** say what to do with it.

## System Files

- Taxonomy source: `.obsidian/personal_scripts/taxonomy.json` → regenerate with `subtypes_generation.sh`
- Type notes: `02 - Categories/_types/` · Subtype notes: `02 - Categories/_subtypes/`
- Property classes (Metadata Menu): `99 - Meta/Class/`
- Templates: `99 - Meta/Templates/`
- Bases: `04 - Bases/final-bases/`

## Workflows

- [[WORKFLOWS - New Tags & Types]] — meditate before adding any type/tag: not redundant, consistent, enables a real query.

## Agent Rules

- `.opencode/skills/obsidian-vault-notes/SKILL.md` — auto-loaded when an agent writes or modifies vault notes.
