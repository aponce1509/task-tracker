---
name: obsidian-vault-notes
description:
  MANDATORY when creating, writing, editing or refactoring any Markdown (.md)
  note in this Obsidian vault (second brain). Structures raw material - brain
  dumps, uncleaned notes, loose ideas - into well-formed vault notes following
  the metadata framework. Also governs the creation of new note templates,
  tags and taxonomy entries (clusters/types/subtypes).
---

# Obsidian Vault Notes - Note Creation

## Role

You act as the user's secretary and clone: given anything that should live in
the vault - a brain dump, an uncleaned note, a pasted conversation, a loose
idea - you structure it into one or more well-formed vault notes. You decide
what each piece is, where it goes, and which metadata it carries, following
the framework defined in the `references/` of this skill.

This skill also covers **creating and managing new system elements**: note
templates, tags, and taxonomy entries (create, rename, remove, orphan
cleanup). It does NOT cover broader system maintenance (audits, migrations,
vault-wide reorganizations) - that belongs to a separate skill.

## The system in one look

Every dimension of a note belongs to exactly one engine - never mix them:

- **Properties (YAML)** = ALL state/metadata. NEVER express with tags or
  folders what a property can hold.
- **Type/Subtypes** = identity. ONE immutable `type`, multi-value `subtypes`.
  Generated from `taxonomy.json` - never hand-create those files.
- **Tags** = ONLY these 4 cross-references: `#learnable` (memorize),
  `#sentations_request` (collect feelings to replicate), `#rfm` (request for
  meditation), `#todo` (todos to extract). NEVER invent others.
- **PARA context** = `paras:` wikilinks to `[[Project]]` / `[[Area]]` /
  `[[Resource]]` notes.

> **Type** says what it is · **Properties** say how it is · **PARA** says
> where it belongs · **Tags** say what to do with it.

## Where to look

| Situation | Read |
| --- | --- |
| Assign metadata to any note (frontmatter schema, class fields, forbidden keys/tags) | `references/system-properties.md` |
| Choose a type/subtype · add, rename, remove or clean up clusters/types/subtypes | `references/system-taxonomy.md` |
| Apply tags · propose a new tag | `references/system-tags.md` |
| Create an index note | `references/note-index.md` |
| Create a note kind with no `note-<kind>.md` yet | base schema in `references/system-properties.md` + closest template in `99 - Meta/Templates/` |

## Processing raw material

1. **Split**: decide whether the input is one note or several; each note gets
   a single identity (exactly one type).
2. **Metadata**: for each note, read the matching `references/note-<kind>.md`
   when it exists; fill the commons schema and pick type/subtypes from the
   taxonomy.
3. **Place**: work items → `08 - Issues/`; PAR notes → `01 - PAR/`; project
   material → `11 - Projects/<project>/`; areas → `12 - Areas/`; resources →
   `13 - Resources/`; indexes → `00 - Map of Contents/`; anything not yet
   classifiable → `09 - Inbox/`.
4. **Link**: set `paras:` to the relevant project/area/resource and add body
   wikilinks to related notes - never leave a note without context.
5. **Flag**: follow-ups only through the 4 canonical tags (`#todo` for todos
   to extract, ...).

## Creating new system elements

- **New subtype/type/cluster**: explicit user approval required, then the
  taxonomy CLI; renames, removals and orphan cleanup follow the same CLI -
  procedures in `references/system-taxonomy.md`.
- **New tag**: explicit user approval required, then register it in
  [[Tag System & Ontology]] - rules in `references/system-tags.md`.
- **New note kind**: add `references/note-<kind>.md` to this skill (what it
  is, when to use it, how to metadata it) and, when it needs a scaffold, a
  template in `99 - Meta/Templates/`. New metadata fields mean a class in
  `99 - Meta/Class/` - see `references/system-properties.md`.

## Body formatting

- `# [[Title]]` H1 only for the title. No `---` separators in body. Minimal
  headings. No blank lines inside bullet lists.
- Wikilinks `[[Note]]`, embeds `![[Note]]`, callouts `> [!type]`. Subtype
  links use the alias form: `"[[Knowledge - Roadmaps - course|course]]"`.

## Canonical vault references (read when in doubt)

- [[The Metadata system]] (MoC of the metadata core)
- [[Common Frontmatter Schemas & Specific Note Templates]] (properties)
- [[Information Architecture & Taxonomy Model]] (types/subtypes)
- [[Tag System & Ontology]] (tags)
