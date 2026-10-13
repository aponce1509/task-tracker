---
paras:
  - "[[second-brain]]"
type: "[[Standards]]"
subtypes:
  - "[[Normative - Standards - workflow|workflow]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-14 00:30
---
# [[WORKFLOWS - New Tags & Types]]

> [!summary]
> Tags and types are the core of retrieval. A new tag, type, subtype or cluster passes a gate first: it must enable a query that nothing else gives, and I approve it explicitly.

**Trigger:** a note does not fit the taxonomy, or a search needs a mark that does not exist · **Driven by:** the `obsidian-vault-notes` skill, `taxonomy.sh`

## Steps

- Query test: write the search or the base view that the new element enables. No query, no element.
- Redundancy test: check [[Information Architecture & Taxonomy Model]] and [[Tag System & Ontology]].
	- What a note is → a type or a subtype.
	- What to do with a note → a tag. Only four exist.
	- How a note is → a property, see [[WORKFLOWS - New Properties]].
- Approve it explicitly, with its name and definition.
- Apply:
	- Type, subtype or cluster → `taxonomy.sh`, then regenerate. Never hand-edit the generated notes.
	- Tag → register it in [[Tag System & Ontology]].
- Bases: a new type gets a base, a new subtype a view or a groupBy. Update [[Search & Base Queries Reference]].
- Run the after-mod checklist of [[System Maintenance & Review]].

## Tidies

- Engines: the gate stops drift before it starts.
