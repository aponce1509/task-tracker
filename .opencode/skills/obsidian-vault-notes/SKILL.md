---
name: Obsidian Vault Notes
description:
  MANDATORY when creating, writing, editing or refactoring any Markdown (.md)
  note in this Obsidian vault (second brain). Enforces the metadata system -
  properties schema, type/subtype taxonomy, the 4-tag whitelist, wikilink and
  formatting rules.
---

# Obsidian Vault Notes - Non-negotiable Rules

## 1. Three engines - never mix them

- **Properties (YAML)** = ALL state/metadata. NEVER express with tags or folders
  what a property can hold.
- **Type/Subtypes** = identity. ONE `type` per note, immutable. `subtypes`
  multi-value.
- **Tags** = ONLY these 4 cross-references. NEVER invent others:
  - `#learnable` (memorize) - `#sentations_request` (collect feelings to
    replicate) - `#rfm` (request for meditation) - `#todo` (todos to extract)
- **PARA context** = `paras:` wikilinks to `[[Project]]` / `[[Area]]` /
  `[[Resource]]` notes.

## 2. Base frontmatter (every note)

```yaml
---
paras: [] # wikilinks to PAR notes
type: "" # ONE wikilink to a note in 02 - Categories/_types/
subtypes: [] # wikilinks to notes in 02 - Categories/_subtypes/
rate: # 1-5, optional
tags: [] # ONLY the 4 canonical tags
status: inbox # inbox | feed | wip | blocked | done
maturity: capture # capture | distilled | evergreen
created: YYYY-MM-DD HH:mm
---
```

FORBIDDEN keys: `lifecycle` (use `maturity`), `subtype` (use `subtypes`),
`para_type` (use `paraType`). FORBIDDEN tags: `#_inbox`, `#_capture`, `#_wip`,
`#_to_consume` and any other legacy `#_*` status tag - migrate to the matching
property.

## 3. Class-specific fields (classes in `99 - Meta/Class/`)

- `issue`: `priority` (0=high/1/2), `dueDate`, `role`
  (core|milestone|pattern|debt)
- `par`: `paraType` (Project|Area|Resource), `active`, `img` - NO tags
- `learning`: `learning_status` (to_learn|learning|learned|abandoned),
  `winstreak`
- `media`: `consumption_status`
  (to_consume|consuming|completed|abandoned|pending_new_content) - NO
  status/maturity
- `normatives`: `summary`, `superceded`

## 4. Types/subtypes are GENERATED - never hand-create or edit

- Source of truth: `.obsidian/personal_scripts/taxonomy.json` (clusters → types
  → subtypes).
- Files in `02 - Categories/_types/` and `02 - Categories/_subtypes/` come from
  `subtypes_generation.sh` - do not edit them; change the JSON and regenerate.
- Creating a new type/tag requires explicit user approval
  ([[WORKFLOWS - New Tags & Types]]): not redundant, consistent, enables a real
  query.

Manage the taxonomy with the CLI (works from any directory):

```bash
bash .obsidian/personal_scripts/taxonomy.sh help   # all commands
bash .obsidian/personal_scripts/taxonomy.sh tree   # clusters → types → subtypes
```

Add/remove/edit clusters, types or subtypes only through this CLI - it guards
every edit, regenerates the generated notes and flags orphans. Full workflow
(approval gate, regeneration, orphan cleanup, link sweeps) in
`references/taxonomy-management.md`.

## 5. Body formatting

- `# [[Title]]` H1 only for the title. No `---` separators in body. Minimal
  headings. No blank lines inside bullet lists.
- Wikilinks `[[Note]]`, embeds `![[Note]]`, callouts `> [!type]`. Subtype links
  use the alias form: `"[[Knowledge - Roadmaps - course|course]]"`.

## 6. Canonical references (read when in doubt)

- `11 - Projects/second-brain/_0_final/The Metadata system.md` (MOC)
- `11 - Projects/second-brain/_0_final/Common Frontmatter Schemas & Specific Note Templates.md`
  (properties)
- `11 - Projects/second-brain/_0_final/Information Architecture & Taxonomy Model.md`
  (types/subtypes)
- `11 - Projects/second-brain/_0_final/Tag System & Ontology.md` (tags)
