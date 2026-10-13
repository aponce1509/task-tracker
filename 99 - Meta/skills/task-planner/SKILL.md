---
name: task-planner
status: draft
description:
  Pick what to work on right now in this vault (second brain). Gathers the
  active projects' open issues with dependencies, priorities and due dates
  and renders an ordered ASCII tree of candidate tasks. Use when asked what
  to do next or to plan a day or project. It only proposes, the user
  decides.
---

# Task Planner

> [!warning] Draft
> Provisional until it survives a real planning session; the search recipes are verified, the ranking order may move.

Select the tasks worth doing now. Non-destructive by design: gather, rank,
render — never edit properties, never close issues, never write files on your
own. The user picks from the tree; only then (if asked) append the chosen ones
to the daily note.

Canonical references: [[The Retrieval system]] · [[Search & Base Queries
Reference]] · [[Task Management]].

## Data model (one look)

- **PAR notes** live in `01 - PAR/` (class `par`): `paraType` Project | Area |
  Resource, `active: true` when live. `archive/` and `wip_paras/` are not
  candidates.
- **Issues** live in `08 - Issues/` (class `issue`), archived under
  `08 - Issues/complete/`. Frontmatter that matters here:
	- `status`: `inbox` | `feed` | `wip` | `blocked` | `done` — legacy notes
	  instead carry `complete: true`; treat an issue as done when ANY of:
	  `status == "done"` · `complete == true` · path under `complete/`.
	- `priority`: `0` high, `1` medium, `2` low; empty = unrated (lowest).
	- `dueDate`: `YYYY-MM-DD` or empty.
	- `dependencies`: wikilinks to issues that must resolve first (real links,
	  so backlinks find dependents).
	- `role`: `core` | `milestone` | `pattern` | `debt` — milestones with a
	  `dueDate` are the project deadlines.
- There are **no deadlines on PAR notes**; a project's deadline is the nearest
  `dueDate` among its open issues (prefer `role: milestone` ones).

## Step 1 — Resolve the scope

- The user names a project → that one PAR note only.
- No project → list the active ones and plan across all of them:

```bash
obsidian search:context query='["active":true]' path="01 - PAR"
```

Exclude hits under `archive/` and `wip_paras/`. Filesystem fallback (always
works, even without Obsidian running):

```bash
rg -l 'active: true' "01 - PAR" -g '!archive/**' -g '!wip_paras/**'
```

## Step 2 — Gather the candidates

For each project in scope, its open issues (the `paras` engine doing the
work):

```bash
obsidian search:context query='["paras":"[[<project>]]"]' path="08 - Issues"
```

Drop anything already done (see the done rule above). Then read each issue's
frontmatter — the files are tiny — for `status`, `priority`, `dueDate`,
`dependencies`, `role`. Vault-wide shortcut with status/priority already
parsed:

```bash
obsidian base:query path="04 - Bases/final-bases/issues-all.base" format=json
```

(the per-project `issues-project.base` returns `[]` headless — `this.file`
needs the embedding note; see the reference note.)

## Step 3 — Dependencies decide readiness

An issue is **ready** when every note listed in its `dependencies:` is done.
To check a dependency or find who depends on X:

```bash
obsidian property:read name=dependencies path="08 - Issues/<issue>.md"
obsidian backlinks path="08 - Issues/<issue>.md" counts
```

Not-ready issues are never offered as first-class candidates — they appear as
indented children under the issue that blocks them, or under a
`blocked (external)` branch when their blocker is not in scope.

## Step 4 — Order (top of tree = do first)

Within one project, sort ready candidates by:

1. `dueDate` past → overdue first (soonest overdue on top);
2. `status == wip` → finish what is already started;
3. `priority` 0 → 1 → 2 → unrated;
4. `dueDate` ascending, then file name.

Across projects (no project given): one root per project, projects ordered by
their nearest open `dueDate` (overdue first), projects without deadlines last.

## Step 5 — Render the tree

ASCII box-drawing only, one line per task, annotation trail
`· P<tier> · <status> · due <date|—>`:

```text
second-brain · deadline: —
├── OVERDUE
│   └── _I00018 personal vps · P2 · inbox · due 2026-10-01
├── WIP
│   └── _I00012 Implement all the queries and make the templates · P0 · wip
├── P1
│   ├── _I00014 Finish Second-Brain final document · P1 · backlog
│   └── _I00013 The mise-en-place note must be completed · P1 · backlog
├── P2
│   └── _I00003 Create a script to move complete issues to complete · P2
│       └── blocked by _I00012 (not ready yet)
└── needs triage
    └── _I00020 Configure the Obsidian setup scripts with env vars · inbox
```

Keep it honest: empty sections are simply omitted, never padded.

## Handoff

Ask the user which tasks to take. If asked to put them in the day's todo:

```bash
obsidian daily:append content="- [ ] [[_I00014 Finish Second-Brain final document]]"
```

(or their own daily workflow — the planner stops at the proposal unless told
otherwise).
