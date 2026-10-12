# Note - Index

A navigation note: a curated directory of wikilinks into a set of notes.
Zettelkasten style - the body is essentially a flat list of links, nested with
subitems and (only when it grows) grouped with headers. An index navigates; it
never classifies (that is the taxonomy's job) and it is not a MoC (a richer
map that connects a domain - separate note kind).

## When to use it

- A topic needs an entry point: a curated page listing the notes of a domain
  → subtype `topic-index`.
- The vault (or a major section) needs a master directory → subtype
  `global-index` (rare; usually exactly one).
- Living list: new related notes are appended as they appear; entries are
  pruned only when the index is replaced.

Placement: `00 - Map of Contents/`. A topic index may live next to the content
it curates when that keeps it closer to its notes.

## Metadata

```yaml
---
paras: []                # PAR context the index serves, if any
type: "[[Indexes]]"
subtypes:
  - "[[Navigation & Meta - Indexes - topic-index|topic-index]]"
  # or "[[Navigation & Meta - Indexes - global-index|global-index]]"
rate:
tags: []
status: done             # an index is navigation, not work in progress
maturity: evergreen      # continuously curated, never "finished" knowledge
created: YYYY-MM-DD HH:mm
---
```

No class-specific fields - an index carries only the commons schema.

## Body template

```markdown
# [[<Title>]]

> [!abstract] <one-line rationale>
> Why this index exists: the question it answers or the domain it curates.
> One or two sentences, no more.

- [[Note A]]
- [[Note B]]
	- [[Sub-note of B]]
	- [[Another sub-note]]
- [[Note C]]

## <Grouping header> (only when the flat list gets long)

- [[Note D]]
```

Rules:

- H1 is the title; immediately below, ONE `> [!abstract]` callout with the
  abstract/rationale of the index.
- The rest is the link list: top-level bullets for entries, tab-indented
  subitems for notes that belong under an entry.
- Headers are allowed ONLY to group a long list - not to structure prose.
  No blank lines inside the list.
- Plain list of links: no per-link commentary paragraphs. If a link needs
  explanation, that explanation belongs in the linked note.

## Example

```markdown
---
paras:
  - "[[second-brain]]"
type: "[[Indexes]]"
subtypes:
  - "[[Navigation & Meta - Indexes - global-index|global-index]]"
rate:
tags: []
status: done
maturity: evergreen
created: 2026-10-12 15:10
---
# [[The Second Brain System]]

> [!abstract] Canonical notes of the second brain
> Every note that defines the system lives here; new canonical notes are
> appended and entries are pruned only when a new index replaces this one.

- [[The Metadata system]]
	- [[Information Architecture & Taxonomy Model]]
		- [[Common Frontmatter Schemas & Specific Note Templates]]
		- [[Tag System & Ontology]]
- [[All Obsidian commands]]
```
