# Second Brain — Build Memory

This file is the memory of the second brain build: objective, current state, and the files close to final. Read it first when working in `11 - Projects/second-brain/`. Append to the status log; never rewrite history.

> [!note] This file intentionally has no YAML frontmatter
> It is agent memory, not a vault note: it is invisible to Bases and search.

## Objective & Scope

Build a personal second brain that:

- Tracks past knowledge — a set of indices to recover information, plus a notebook for learning. Reference: `09 - Inbox/Second Brain MoC.md`.
- Reduces mental load while improving productivity — a clear task methodology, a development diary, and knowing what to extract from it.
- Incorporates AI into the system.

It is explicitly not meant to be the default documentation of a project.

## Current State

The canonical definition lives in `11 - Projects/second-brain/_0_final/`. The rest of the vault — `_0_real_inbox/`, the outlines, and the building blocks — is the semi-productive backlog converging toward it slowly.

Entry point: `_0_final/The Second Brain System.md` — a Zettelkasten-style index that lists every canonical note. New notes get appended there; entries are only pruned when a new index replaces it.

## File Inventory

### Close to final (productive)

| File | Role | Notes |
| --- | --- | --- |
| `_0_final/The Second Brain System.md` | Index / entry point | Zettelkasten-style: every canonical note, with sub-notes nested. Resolves the previously broken `[[The Second Brain System]]`. |
| `_0_final/The Metadata system.md` | MoC of the metadata core | The de-facto hub: three engines, system files, agent rules. |
| `_0_final/Information Architecture & Taxonomy Model.md` | Specs | Type + subtypes taxonomy; generated, never hand-written. |
| `_0_final/Common Frontmatter Schemas & Specific Note Templates.md` | Specs | Properties engine and class schemas. |
| `_0_final/Tag System & Ontology.md` | Specs | The only 4 canonical tags. |
| `_0_final/All Obsidian commands.md` | Resources / tool | Dataview utility listing every command. |
| `_0_final/The Issue System.md` | Specs | What an issue is: definition, properties (incl. `dependencies`), script-based creation, post-mortem. |
| `_0_final/Task Management.md` | MoC (draft) | Task management as a system: issues, creation, closing. Candidate links; sections to backfill. |
| `_0_final/The Retrieval system.md` | MoC | The searching engine: one base per type, one view per subtype, PARA-scoped boards, CLI query layer. |
| `_0_final/Search & Base Queries Reference.md` | Reference | One-file cheatsheet: every implemented base/view, fields per class, verified search + CLI recipes. Sync enforced by the audit. |
| `_0_final/The CODE system.md` | MoC | The notes lifecycle: capture → organise → distill → express, the two property axes (`status` execution / `maturity` knowledge), workflows and open threads. Phase notes still in `_0_real_inbox/`, wired to the MoC. |
| `_0_final/System Maintenance & Review.md` | Runbook | After-mod checklist + periodic all-is-well review (taxonomy, properties, tags, bases, links); executed by the `system-reference-maintance` skill. |

### Skeleton (operational, in continuous improvement)

- `.obsidian/personal_scripts/taxonomy.json` — taxonomy source of truth (9 clusters, 25 types, 103 subtypes).
- `.obsidian/personal_scripts/subtypes_generation.sh` — generator for types/subtypes notes.
- `02 - Categories/_types/` and `02 - Categories/_subtypes/` — generated notes.
- `99 - Meta/Class/` — Metadata Menu classes (commons, note, par, issue, learning, media, normatives, type, subtype).
- `04 - Bases/final-bases/` — the final Bases views.
- `99 - Meta/Templates/` — note templates (a duplicate `Templates 1/` folder exists: open item, not yet resolved).
- `.obsidian/personal_scripts/create-issue.sh` — issue creation wrapper (answers the Templater prompt, fills properties).
- `99 - Meta/commands/postmortem.md` — guided post-mortem command for issues (canonical; `.opencode/commands/` and `.claude/commands/` are dir symlinks to the folder).
- `99 - Meta/skills/` — canonical home of all five agent skills (`markdown-editing`, `obsidian-vault-notes`, `project-journaling`, `system-reference-maintance`, `task-planner`); `.opencode/skills/` and `.claude/skills/` are committed symlinks to it, so every harness loads the same sources.
- `scripts/sync-skills.sh` — keeps every harness view (`.opencode`/`.claude` skills + commands; `--codex` adds the AGENTS-standard `.agents/skills`) pointed at the canonical `99 - Meta` folders: `sync` repairs symlinks idempotently (--apply also migrates legacy real-dir copies, conflicts go to `.trash/`), `clean` removes `.DS_Store`/dangling links (dry-run by default), `status` exits 1 when a view is off.
- `99 - Meta/skills/task-planner/SKILL.md` — task-selection skill: active PARs → open issues → deps/priority/dueDate → ordered ASCII tree for the day.
- `99 - Meta/skills/system-reference-maintance/SKILL.md` + `scripts/audit.py` — reference-consistency audit for the engines: taxonomy/types-subtypes, properties/classes, tags, bases coverage; exit 0 = all clean. The executor of `System Maintenance & Review`.
- `04 - Bases/final-bases/issues-subtypes.base` — the model for the per-type wing: one base for the Issues type, one view per subtype.
- `.obsidian/personal_scripts/journal.sh` — project journal CLI, the only editor of journal files: append-only bulleted Log (`- timestamp: description` with inline links, `key::: ` sub-bullets, free lines in any format), link/good/bad/comment on existing entries, tech debt + intermediate products + human sections, close protocol (tech debt note), CSV export for Excel.
- `99 - Meta/skills/project-journaling/SKILL.md` — journaling skill: logs completions and events (meetings with the meeting note linked, issues completed, milestones, intermediate products, tech debt, close), never every action; owns the close protocol.
- `99 - Meta/Class/journal.md` + `99 - Meta/Templates/Project Journal - Template.md` + `note-journal.md` in the vault skill — the journal note kind (class `journal` adds `description`).

### Backlog (not yet consolidated)

- `_0_real_inbox/` — the ~40 working notes from the previous iteration.
- Outlines: `Second Brain Outline`, `Mid Term Second Brain Outline`, `Notes a base system`, `Second Brain MVP`, `Second Brain Issues`.
- `Second Brain Building Blocks` — the high-level description of the whole system.

## Planned MoCs

Maps of content describe the system as a whole (how I stay productive), not the taxonomy clusters. Remaining:

- Product documentation.
- Task management (draft `_0_final/Task Management.md`).
- Others, defined progressively.

## Open Threads

- `09 - Inbox/Second Brain Rules Extract.md` — dated audit of the whole system (rules, gaps, TODOs, contradictions). Keep as reference; do not duplicate here.
- Legacy tag model still coexists with the new one; taxonomy largely unused; bases not fully wired.

## Agent Rules

- Never hand-edit generated files (`02 - Categories/_types`, `_subtypes`); edit `taxonomy.json` and regenerate.
- New type/subtype/tag proposals go through the vault skill workflow — never invented ad hoc.
- `_0_final/` docs lead; the rest of the vault catches up.
- When a new canonical note lands in `_0_final/`, add it to the index (`The Second Brain System.md`) and to the File Inventory here. The index is append-only until a new index replaces it.

## Status Log

- 2026-10-12 — agents.md created. `_0_final/The Second Brain System.md` added as the index/entry point.
- 2026-10-12 — index reframed to Zettelkasten style: every canonical note listed, taxonomy spec sub-notes nested under it.
- 2026-10-12 — task management defined: `_0_final/The Issue System.md` + draft `_0_final/Task Management.md`; issue template fixed (broken `template-content` include removed, `subtypes`/`dependencies`, post-mortem helper points, H1 gets the numbered name); `dependencies` added to the `issue` class; `create-issue.sh` + `/postmortem` command added; both included in the vault skill (`references/note-issue.md`).
- 2026-10-12 — retrieval wing started: `_0_final/The Retrieval system.md` (domain-moc, the searching engine) + `_0_final/Search & Base Queries Reference.md` (one-file cheatsheet of implemented queries); new `04 - Bases/final-bases/issues-subtypes.base` (one base per type / one view per subtype, exemplar on Issues, verified via CLI); `task-planner` skill added (`.opencode/skills/task-planner/SKILL.md`); index and PAR note wired.
- 2026-10-12 — maintenance loops added: `_0_final/System Maintenance & Review.md` (runbook: after-mod checklist + periodic all-is-well review); issues `_I00021` (cheatsheet sync, P1) and `_I00022` (tags/properties/taxonomy review, P2) created via `create-issue.sh`; task-planner skill marked draft; index, Retrieval system, Metadata system and cheatsheet wired to the runbook.
- 2026-10-12 — `issues-subtypes.base` added to the PARA Note template Operative Searches (new PARs get it automatically); Templater config checked: `99 - Meta/Templates/` is the active folder, but folder-trigger for `01 - PAR` points at a missing `Index - Template.md` (config issue, pending).
- 2026-10-12 — `system-reference-maintance` skill created (`.opencode/skills/system-reference-maintance/`): SKILL.md + `scripts/audit.py` (stdlib-only). First live audit surfaced real drift: forbidden `subtype:` key on `_I00017/18/19`; templates with phantom classes (`category`, `capture`); bases filtering `link("Decissions")`/`link("Synthesis")` which match no taxonomy type (decisions/syntheses views dead); subtype alias mismatches (`topic_index` vs `topic-index`); 24 issues with legacy `complete`; stray tags (`#excalidraw`, `#debt`, `#untagged`); findings left as issues to create on user's call.
- 2026-10-13 — project journaling shipped: `journal.sh` CLI (Log table rows append-only with `n|date|time|kind|what|dur|link|good|bad|comment`, pipes escaped, link attachable after the row exists, `debt`/`product`/`reflect` sections, close → tech debt note + products extraction + human lines, CSV export); `journal` class (adds `description`); `Project Journal - Template.md`; `note-journal.md` reference in the vault skill; `project-journaling` skill (triggers on completions and events — meetings, issues, milestones, products, debt, close — never every action). First journal: `11 - Projects/second-brain/Journal - second-brain.md`. Resolves the "(project journal — TBD)" pointer in the issues template.
- 2026-10-13 — journal format v2 on user feedback: tables out, bullets in. Each Log entry is `- YYYY-MM-DD HH:mm: description` (wikilinks inline — no link key, no link section) with `key::: value` nested bullets (kind, dur, good, bad, comment) and free lines in any format (`journal.sh append`); export pivots entries to CSV (`n,date,time,kind,what,dur,good,bad,comment`). Sandbox suite green; live journal migrated.
- 2026-10-13 — maintenance issues `_I00021`/`_I00022` removed at the user's request (the `system-reference-maintance` skill is the maintenance tracker; no tracking issues needed). Deleted via Obsidian trash; all references cleaned across the index, runbook, Retrieval system, cheatsheet, SKILL description and this inventory.
- 2026-10-13 — CODE wing shipped: `_0_final/The CODE system.md` (domain-moc) maps the notes lifecycle — capture (raw + metadata → `09 - Inbox`), organise (out of the inbox → its place; progressive summarisation starts), distill (continuation of curating: links, summaries, `maturity` climb), express (intermediate/final products) — plus the two property axes (`status` execution, `maturity` knowledge) and the four workflows. Phase notes updated in `_0_real_inbox/` (Capturing/Organise/Distill/Express - CODE, How I see the CODE Process, Implementing the O fo CODE): capture contract added (whole source / link / highlight per connector), out-of-the-inbox + place model, distill = curated continuation; convergence/divergence direction fixed in "How I see the CODE Process" (was reversed vs `Convergence and Divergence`); dead links (`CHECKLIST - Out Of Inbox`, `Organising Workflow`, `Tags Reference`) re-pointed to implemented notes; phase notes promoted to `status: wip`. Index ([[The Second Brain System]]), inbox [[Second Brain MoC]] and this inventory wired; CODE removed from Planned MoCs.
- 2026-10-13 — legacy `complete` key retired (issue dual bookkeeping): `complete:` removed from 20 active issues + both issue templates; the 4 issues marked `complete: true` now carry `status: done` (_I00006/_I00008/_I00010/_I00011) and `_I00006` was archived to `08 - Issues/complete/` so property and folder agree. Done-rule is now single: `status: done` + the `complete/` folder. Updated: audit script (legacy-complete special case dropped, done-rule rewritten), task-planner SKILL, note-issue.md reference, Common Frontmatter Schemas (forbidden legacy keys), System Maintenance & Review, The Retrieval system, and `04 - Bases/archive/Issues.base` (views filter `status != done`, `complete` column → `status`; Weekly Note embeds keep working). New issues get `status: inbox` from the template — the bleed is closed.
- 2026-10-13 — subtype alias drift fixed on 6 notes (audit types-check): links now alias the canonical slug — `topic-index` (neovim, AI Tools Index, Inspiration Sources, Obsidian Plugins), `project-moc` (The Learning App), `project-idea` (Input sources); baseline re-accepted, 0 NEW.
- 2026-10-13 — skills distributed beyond OpenCode (`_I00021`): canonical sources moved to `99 - Meta/skills/` (the five skills); `.opencode/skills/` and `.claude/skills/` are now committed directory symlinks to it (one source of truth, every harness reads the same files), `/postmortem` mirrored to Claude Code via `.claude/commands/postmortem.md` symlink; root `AGENTS.md` added with the Skills section. Real bug found and fixed on the way: `task-planner`, `project-journaling` and `system-reference-maintance` were silently NOT loaded by OpenCode at all — their `description:` block scalars contained `: ` (colon+space), which breaks strict YAML frontmatter parsing, and OpenCode then drops the skill from `available_skills` without any warning (verified by a controlled probe matrix; colon-free descriptions fixed it, all five now listed in a fresh session). Descriptions of those three skills rewritten short + colon-free; path references updated across the index, Retrieval system, Metadata system, runbook, cheatsheet companion and this inventory to the canonical `99 - Meta/skills/` path.
- 2026-10-13 — commands distributed like the skills (`_I00021` follow-up): `/postmortem` moved to canonical `99 - Meta/commands/postmortem.md` (git mv, history preserved); `.opencode/commands/` and `.claude/commands/` are now dir symlinks to it (the per-file Claude Code symlink replaced — same one-source layout as the skills). `scripts/sync-skills.sh` added: `sync` idempotently repairs the four harness views (`--codex` opts in `~`-free `.agents/skills`; `--apply` migrates legacy real-dir layouts into canonical, conflicts to `.trash/`), `clean` removes `.DS_Store`/dangling links (dry-run by default, never deletes real content), `status` exits 1 when a view is off. Matrix-tested in a sandbox (repair/migrate/conflict/clean/help) before touching the vault; inventory, Issue System, note-issue reference, root AGENTS.md and this log updated to the canonical paths.
