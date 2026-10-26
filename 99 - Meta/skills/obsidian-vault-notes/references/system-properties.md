# System - Properties (frontmatter)

All state and metadata of a note lives in YAML properties, managed by Metadata
Menu classes in `99 - Meta/Class/`. Canonical source:
[[Common Frontmatter Schemas & Specific Note Templates]].

> [!important] Dimensions are properties, never tags
> - Execution → `status`: `inbox` | `feed` | `wip` | `blocked` | `done`
> - Knowledge lifecycle → `maturity`: `capture` | `distilled` | `evergreen`
> - Identity → `type` + `subtypes` → `system-taxonomy.md`
> - Cross-references → the 4 tags → `system-tags.md`

## Commons schema (every note)

```yaml
---
paras: []              # wikilinks to PAR notes (e.g., ["[[second-brain]]"])
type: ""               # ONE wikilink to a note in 02 - Categories/_types/
subtypes: []           # wikilinks to notes in 02 - Categories/_subtypes/
tags: []               # ONLY the 4 canonical tags
rate:                  # Number 1-5, optional
status: inbox          # inbox | feed | wip | blocked | done
maturity: capture      # capture | distilled | evergreen
created: YYYY-MM-DD HH:mm
---
```

> [!warning] Forbidden legacy keys and tags
> - `lifecycle` → use `maturity`
> - `subtype` → use `subtypes` (plural)
> - `para_type` → use `paraType`
> - `#_inbox`, `#_capture`, `#_wip`, `#_to_consume` and any other legacy `#_*`
>   status tag → migrate to the matching property on sight.

## Class hierarchy

`commons` is the root class. Each class extends it and adds its own fields:

| Class | Adds | Excludes | Used for |
| --- | --- | --- | --- |
| `note` | — | — | default note |
| `par` | `paraType` (Project/Area/Resource), `active`, `img` | `tags` | PAR index notes in `01 - PAR/` |
| `issue` | `priority` (0=high, 1, 2), `dueDate`, `role` (core/milestone/pattern/debt), `dependencies` | — | work items in `08 - Issues/` |
| `learning` | `learning_status` (to_learn/learning/learned/abandoned), `winstreak` (0-5) | — | study notes |
| `media` | `consumption_status` (to_consume/consuming/completed/abandoned/pending_new_content) | `status`, `maturity` | books, films, podcasts... |
| `capture` | `url`, `author` (MultiFile), `platform` (youtube/x/instagram/web/apple-notes) | — | connector captures in `06 - Inputs/Captures/` |
| `normatives` | `summary`, `superceded` | — | standards/decisions |
| `journal` | `description` (one line: what the journal tracks) | — | project journals, CLI-edited via `.obsidian/personal_scripts/journal.sh` |
| `type` | — | `paras`, `rate`, `tags` | generated type notes |
| `subtype` | — | — | generated subtype notes |

## Class schemas

### PAR index note (`file_class: par`)

```yaml
---
paras: []
type: ""
subtypes: []
rate:
status:
maturity: evergreen
created: YYYY-MM-DD HH:mm
paraType: Project      # Project | Area | Resource
active: true
img:
---
```

### Issue (`file_class: issue`)

```yaml
---
paras: []
type: "[[Issues]]"
subtypes: ["[[Operational - Issues - bug|bug]]"]
rate:
tags: []
status: wip
maturity: capture
created: YYYY-MM-DD HH:mm
priority: 0            # 0 (High), 1 (Medium), 2 (Low)
dueDate: YYYY-MM-DD
role: debt             # core | milestone | pattern | debt
dependencies: []       # MultiFile: links to issues that must resolve first
---
```

### Media (`file_class: media`)

```yaml
---
paras: []
type: "[[Medias]]"
subtypes: ["[[External Knowledge - Medias - book|book]]"]
rate: 5
tags: []
consumption_status: to_consume
created: YYYY-MM-DD HH:mm
---
```

### Learning (`file_class: learning`)

```yaml
---
paras: []
type: "[[Roadmaps]]"
subtypes: ["[[Knowledge - Roadmaps - course|course]]"]
rate:
tags: []
status: wip
maturity: distilled
created: YYYY-MM-DD HH:mm
learning_status: learning
winstreak: 0
---
```

## Creating new properties or classes

When a note kind needs metadata the commons schema cannot hold, add the field
to the matching class in `99 - Meta/Class/` (or create a new class extending
`commons`). Never bolt state onto tags or folders. See
[[WORKFLOWS - New Properties]] for the vault-side workflow.
