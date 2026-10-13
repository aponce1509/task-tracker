---
paras:
  - "[[second-brain]]"
type: "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - MoCs - domain-moc|domain-moc]]"
rate:
tags:
status: wip
maturity: capture
created: 2026-10-12 18:15
---
# [[The Retrieval system]]

> [!abstract] The searching engine of the vault
> Capture is cheap, retrieval is the point. Built on top of the three engines of [[The Metadata system]]: a note is retrieved by identity (`type`/`subtypes`), by state (properties) and by context (`paras`).

## The searching idea

- **One base per type, one view per subtype.** Every type gets its own `.base` in `04 - Bases/final-bases/`; inside it, one view per subtype. Searching a specific kind of file inside a project becomes mechanical: open the view, read the relevant fields only.
- **PARA scope by embedding.** The root filter is `paras.contains(this.file)` — embedded with `![[<type>.base]]` inside any PAR note, `this.file` resolves to the embedding note and the base shows only that project/area/resource. The same file works for every PAR note; no per-project copies.
- **Relevant fields only.** Each view shows the fields its class cares about — issues show `status`/`priority`/`dueDate`, medias show `consumption_status`/`rate`, roadmaps show `learning_status`/`winstreak`. Everything else stays out of the table.
- **Special cases keep their own shape.** Issues are grouped by status (`inbox` / `backlog` / `wip` / `blocked` / `done`) because that is the input of task selection, not just exploration — see [[Task Management]].

## Query layers

1. **Embedded bases** — the daily in-app surface: per-PAR boards (`![[issues-project.base]]`), per-view embeds in templates (`![[Issues.base#Urgents]]`), context bases in generated notes (`types.base`, `subtypes.base`).
2. **Obsidian search operators** — property queries like `["paras":"[[second-brain]]"]`, `["active":true]`, `["priority":0]`; compose with the full search syntax. Documented in [[Search & Base Queries Reference]].
3. **Obsidian CLI** — the headless surface for agents: `obsidian base:query`, `obsidian search`, `obsidian backlinks`. Scoped bases return empty headless (`this.file` has no embedding context there) — use the vault-wide twins (`issues-all.base`) or search operators instead.

## Implemented today

- Cluster boards (one base per cluster, one view per type, views grouped by subtype): `your-brain` · `external-resources` · `normative` · `descriptive` · `operational` · `knowledge` · `assets` · `logging` · `navigation`
- Work queries: `issues-project` (per PAR, by status) · `issues-all` (vault-wide, grouped by project) · `issues-subtypes` (one view per issue subtype — the model for the per-type wing)
- Context bases: `types.base` · `subtypes.base` (embedded inside the generated `_types`/`_subtypes` notes)
- Full inventory, fields per class and verified CLI recipes: [[Search & Base Queries Reference]]

## Open threads

- Generate the per-type bases for the remaining types from `taxonomy.json` (recipe: `issues-subtypes.base`) — the recipe is proven, the rollout is pending.
- Legacy issues carry no `subtypes`; done state is `status: done` + the
  `complete/` folder (the legacy `complete:` key was migrated away). Adoption
  is gradual ([[Queries]] wishlist: sprint methodology, meetings base).

## Agent Rules

- Task selection runs through `99 - Meta/skills/task-planner/SKILL.md` (draft) — active PARs → open issues → deps/priorities/dueDates → ordered ASCII tree for the day.
- Maintenance runs through [[System Maintenance & Review]]: after any base/query change update [[Search & Base Queries Reference]] (the `system-reference-maintance` audit enforces it); periodic metadata review via the same skill.
