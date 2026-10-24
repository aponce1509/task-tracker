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
# [[WORKFLOWS - New Properties]]

> [!summary]
> Properties hold all the state of a note. A new property must enable a real query, belong to one class, and have a restricted input in Metadata Menu.

**Trigger:** a note needs state that no property holds · **Driven by:** the `obsidian-vault-notes` skill

## Steps

- Query test: write the base view or search that uses the property. No query, no property.
- Redundancy test: no property for what a type, a subtype or a tag already says.
- Class: commons only by exception. Otherwise the class of the notes that need it, in `99 - Meta/Class/`.
- Metadata Menu: restrict the input type (file, select, boolean, number) so typos cannot enter.
- Update [[Common Frontmatter Schemas & Specific Note Templates]] and the templates of the class.
- Run the after-change checklist of [[System Maintenance & Review]].

## Tidies

- Engines: the gate stops drift before it starts.
