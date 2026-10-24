---
paras:
  - "[[second-brain]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - runbook|runbook]]"
rate:
tags:
status: wip
maturity: distilled
created: 2026-10-12 23:40
---
# [[System Maintenance & Review]]

> [!abstract] Two loops keep the engines honest
> - What to do right after any system modification, and the periodic review that checks everything is still well.
> - Both loops are executed by the `system-reference-maintance` skill — no tracking issues, the audit itself is the tracker.

> [!info] Place in the system
> This runbook is the engine part of [[The Maintenance System]], the map of every maintenance workflow.

> [!info] Executor
> The checks here run through the `system-reference-maintance` skill:
> `python3 "99 - Meta/skills/system-reference-maintance/scripts/audit.py"`
> (`99 - Meta/skills/system-reference-maintance/SKILL.md` documents markers, verdicts and escalation).

## After any change

A change to the system is any of these: a base or view, a template, a Metadata Menu class, a taxonomy entry, a search recipe, a canonical note.

- Searching engine changed (base/view/recipe) → update [[Search & Base Queries Reference]]: inventory table + verified recipes — enforced by the audit's `bases` check (cheatsheet ↔ final-bases drift)
- Properties or classes changed → update [[Common Frontmatter Schemas & Specific Note Templates]] and the class in `99 - Meta/Class/`
- Taxonomy changed → through the CLI only (`taxonomy.sh`), generated notes regenerate; [[Information Architecture & Taxonomy Model]] stays the spec
- Tag changed → register it in [[Tag System & Ontology]]
- New canonical note landed in `_0_final/` → append to [[The Second Brain System]] index + the AGENTS.md File Inventory
- Any change → append the AGENTS.md status log (append-only; never rewrite history)
- Close the loop → run the review checklist below before calling it done

## Periodic review (all is well)

Run the `system-reference-maintance` skill (`audit.py`) on a bi-monthly rhythm, next to [[WORKFLOWS - Bi-Monthly Inbox Sweep]]:

- Note kinds: `bash "99 - Meta/skills/note-concept/scripts/audit.sh"` and `bash "99 - Meta/skills/note-index-moc/scripts/audit.sh"` — checks in [[The Concept System]] and [[The Index and MoC System]]; the `vault-auditor` agent runs all audits and the guidance checks of [[The AI Guidance System]]
- Taxonomy: `bash .obsidian/personal_scripts/taxonomy.sh verify` → "generated notes: all expected files exist", "orphans: none"
- Bases: headless query every `.base` in `04 - Bases/final-bases/` — scoped bases returning `[]` is pass, a YAML/filter error is fail; coverage matrix: every type has a base, every subtype a view or a groupBy (target design in [[The Retrieval system]])
- Links: `obsidian unresolved` → zero · `obsidian dev:errors` → clean
- Properties: sweep forbidden legacy keys (`lifecycle`, `subtype`, `para_type`) and legacy `#_*` tags → migrate to the matching property on sight
- Tags: `obsidian tags sort=count counts` → only `#learnable` · `#sentations_request` · `#rfm` · `#todo` survive
- Issues hygiene: done-rule consistency (`status: done` must agree with the
  `complete/` folder — both, or neither) and issues living in the right folder

## Escalation

- A review finding that is real work → new issue via `create-issue.sh`; never fix ad hoc inside the review itself
- New type/subtype/tag needs → approval gate first: [[WORKFLOWS - New Tags & Types]] · [[WORKFLOWS - New Properties]]
