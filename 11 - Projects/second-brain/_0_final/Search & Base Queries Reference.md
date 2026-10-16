---
paras:
  - "[[second-brain]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - cheatsheet|cheatsheet]]"
rate:
tags:
status: done
maturity: evergreen
created: 2026-10-12 18:15
---
# [[Search & Base Queries Reference]]

> [!abstract] One-file reference of the implemented retrieval queries
> What each base in `04 - Bases/final-bases/` implements, which fields each class shows, and the search operators verified against the Obsidian CLI. Companion of [[The Retrieval system]].

> [!info] This note is maintained
> Any change to a base, view or recipe must land here too — the `system-reference-maintance` audit enforces cheatsheet ↔ final-bases sync; procedure in [[System Maintenance & Review]].

## Base inventory

| Base | Views (one per…) | Fields shown | Root filter |
| --- | --- | --- | --- |
| `your-brain.base` | Ideas · Reflections · Inquiries · Mental Models | maturity, status | scoped |
| `external-resources.base` | Resources · Medias | Resources: maturity, rate — Medias: consumption_status, rate | scoped |
| `normative.base` | Requirements · Specs · Decisions · Standards | summary, status, superceded | scoped |
| `descriptive.base` | Architectures · Project Contexts | maturity, status | scoped |
| `operational.base` | HowTos · Solutions · Meetings | maturity, status | scoped |
| `knowledge.base` | Roadmaps · Core Knowledge · Syntheses · Emergent Thoughts · Annotations | Roadmaps add learning_status, winstreak | scoped |
| `assets.base` | Assets | maturity, status | scoped |
| `logging.base` | Journals | maturity, status | scoped |
| `navigation.base` | Indexes (list) · MoCs | maturity, status | scoped |
| `issues-project.base` | Issues · Inbox · Backlog · WIP · Blocked | status, priority, dueDate | scoped + status |
| `issues-all.base` | Complete View · Complete Backlog/Inbox/WIP/Blocked | status, priority, dueDate | vault-wide, grouped by `paras` |
| `issues-subtypes.base` | By Subtype · Bug · Task · Improvement · Incident · Open Problem · Recurring | status, priority, dueDate | scoped + `subtypes.contains(link(...))` |
| `types.base` | Notes | subtypes, maturity, status | `type == this.file` |
| `subtypes.base` | Notes | type, maturity, status | `subtypes.contains(this.file)` |

"Scoped" = root filter `paras.contains(this.file)`.

## The PARA-scope pattern

- Root filter `paras.contains(this.file)` + per-type view filters `type == link("<Type>")`.
- Embed the whole board or one view: `![[issues-project.base]]` · `![[Issues.base#Urgents]]`.
- When embedded, `this.file` = the embedding note → automatic per-PAR filtering, one file serves all PAR notes.
- Headless (`obsidian base:query`) scoped bases return `[]` — no embedding context. Query the vault-wide twin (`issues-all.base`) or use search operators.

## Obsidian search operators (verified)

```text
["paras":"[[second-brain]]"]        every note of a project (the paras engine)
["active":true]                     active PAR notes (path="01 - PAR")
[bridge]                            PAR notes with a bridge (path="01 - PAR")
["active":true] -[bridge]           active PARs without a bridge (path="01 - PAR")
["status":"wip"]                    execution state
["priority":0]                      issue priority tier
["dueDate":>=2026-10-12]            date comparison on issue deadlines
["type":"[[Issues]]"]               identity via the type engine
```

Combine freely with `-path:archive`, folder limits and the rest of the search syntax.

## Obsidian CLI recipes (verified headless)

```bash
# All open issues, vault-wide, with status/priority/dueDate
obsidian base:query path="04 - Bases/final-bases/issues-all.base" format=json

# All notes of one project, with matching lines
obsidian search:context query='["paras":"[[second-brain]]"]' path="08 - Issues"

# Active projects/areas/resources
obsidian search:context query='["active":true]' path="01 - PAR"

# Who depends on an issue (dependencies are real links)
obsidian backlinks path="08 - Issues/_I00005 Developer UI & UX.md" counts

# One property of one note
obsidian property:read name=dependencies path="08 - Issues/_I00014 Finish Second-Brain final document.md"
```

Caveats learned the hard way: `base:views` only works on the file active in Obsidian; CLI targets the most recently focused vault; render pipe large outputs to a file (bare `obsidian help` can hang a pipe).

## Legacy

`04 - Bases/archive/` keeps the retired bases (PARA Base, Issues & Tasks, …). The weekly template still embeds `archive/Issues.base` views (`Urgents`, `Blocked`, …) — migrating those embeds is part of the bases wiring open thread in the AGENTS memory.
