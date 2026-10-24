---
description: The approval gate for a new tag, type, subtype, cluster or property - query test, redundancy test, approved definition, then apply through the right path and audit
argument-hint: "<tag | type | subtype | cluster | property> <name>"
---

Gate the new system element: $ARGUMENTS

Tags, types and properties are the engines of retrieval. A new element must enable a query that nothing else gives, and I approve it explicitly. The gate stops drift before it starts.

## Load first

- `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - New Tags & Types.md` or `WORKFLOWS - New Properties.md`, by the kind of element. It wins over anything else here.
- The `obsidian-vault-notes` skill and its references `system-taxonomy.md`, `system-tags.md`, `system-properties.md`.
- The `system-reference-maintance` skill.

## Steps

1. Query test. Ask me for the search or base view that the element enables. No query → stop; say that no element passes without one.
2. Redundancy test. Check `Information Architecture & Taxonomy Model`, `Tag System & Ontology`, `bash .obsidian/personal_scripts/taxonomy.sh tree` and the classes in `99 - Meta/Class/`. Show the closest existing element and say which engine the need belongs to: what a note is → type or subtype; what to do with it → tag (only four exist); how it is → property. When an existing element already gives the query, stop and show how to use it.
3. Definition. Ask the name and the one-line definition. Show them; wait for explicit approval of both.
4. Apply through the right path:
	- type, subtype or cluster → `taxonomy.sh` (it regenerates the notes);
	- tag → register it in `Tag System & Ontology`;
	- property → the class in `99 - Meta/Class/` with a restricted Metadata Menu input, `Common Frontmatter Schemas & Specific Note Templates`, and the templates of the class.
5. Bases. Propose the base view, the view or groupBy of the new subtype, and the row of `Search & Base Queries Reference`. Apply on approval.
6. After-change checklist of `System Maintenance & Review`: run `python3 "99 - Meta/skills/system-reference-maintance/scripts/audit.py"` and `bash .obsidian/personal_scripts/taxonomy.sh verify`, then propose the line for the status log of `11 - Projects/second-brain/AGENTS.md`.

## Output

The query, the redundancy verdict, the applied changes per file, the audit result.

## Rules

- Never apply without the explicit approval of the name and the definition.
- Never hand-edit the generated notes in `02 - Categories/_types` or `_subtypes`.
- A fifth tag is an exception that needs a reason stronger than the query; say so before step 3.
