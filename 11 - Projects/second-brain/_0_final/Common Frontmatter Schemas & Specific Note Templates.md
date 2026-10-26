---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status: done
maturity: evergreen
created: 2026-08-18 23:15
---
# [[Common Frontmatter Schemas & Specific Note Templates]]

This note defines the **properties engine**: every piece of structured metadata is a YAML property, managed by Metadata Menu classes in `99 - Meta/Class/`.

> [!important] Dimensions are properties, never tags
> - Execution → `status`: `inbox` | `feed` | `wip` | `blocked` | `done`
> - Knowledge lifecycle → `maturity`: `capture` | `distilled` | `evergreen`
> - Identity → `type` + `subtypes` → [[Information Architecture & Taxonomy Model]]
> - Cross-references → the 4 tags → [[Tag System & Ontology]]

## Common Base Schema (`commons` class)

Every note inherits these properties.

```yaml
---
paras: []              # MultiFile: links to PAR notes (e.g., ["[[second-brain]]"])
type: ""               # File: ONE link to a note in 02 - Categories/_types/
subtypes: []           # MultiFile: links to notes in 02 - Categories/_subtypes/
tags: []               # ONLY the 4 canonical tags
rate:                  # Number 1-5, optional
status: inbox          # inbox | feed | wip | blocked | done
maturity: capture      # capture | distilled | evergreen
created: YYYY-MM-DD HH:mm
---
```

> [!warning] Forbidden legacy keys
> - `lifecycle` → use `maturity` (0 notes use `lifecycle`; `maturity` is the live key)
> - `subtype` → use `subtypes` (plural, as in `commons`)
> - `para_type` → use `paraType`
> - `complete` → use `status: done` + the `complete/` folder (issues legacy;
>   migrated 2026-10-13)

## Class Hierarchy (`99 - Meta/Class/`)

`commons` is the root. Each class extends it and adds its own fields:

| Class | Adds | Excludes | Used for |
| --- | --- | --- | --- |
| `note` | — | — | default note |
| `par` | `paraType` (Project/Area/Resource), `active`, `bridge` (Input: the next concrete action when I come back, may hold `[[links]]`), `img` | `tags` | PAR index notes in `01 - PAR/` |
| `issue` | `dueDate`, `priority` (0=high, 1, 2), `role` (core/milestone/pattern/debt), `dependencies` | — | work items in `08 - Issues/` |
| `learning` | `learning_status` (to_learn/learning/learned/abandoned), `winstreak` | — | study notes |
| `media` | `consumption_status` (to_consume/consuming/completed/abandoned/pending_new_content) | `status`, `maturity` | books, films, podcasts… |
| `capture` | `url` (Input: the source link), `author` (MultiFile: channel, handle or site), `platform` (youtube/x/instagram/web/apple-notes) | — | connector captures in `06 - Inputs/Captures/` |
| `news` | `group` (a group of `sources.yaml`), `story_id`, `outlets`, `blindspot` (L/R), `first_seen` | — | news stories in `06 - Inputs/News/`, written by `feeds_sync.py` |
| `normatives` | `summary`, `superceded` | — | standards/decisions |
| `journal` | `description` (Input: one line on what the journal tracks) | — | project journals, CLI-edited via `.obsidian/personal_scripts/journal.sh` |
| `type` | — | `paras`, `rate`, `tags` | generated type notes |
| `subtype` | — | — | generated subtype notes |

> [!note] `winstreak` (learning class): consecutive successful learning/review cycles, `0`–`5`.

> [!note] Daily & weekly notes are habit trackers
> Notes under `07 - Daily/` and the `Daily Note - Template` / `Weekly Note - Template` are **property-free by design**: no class schema applies, and habit keys (`calorias`, `toothTimes`, `films`, `bookMinutes`, …) are valid properties there, not drift. The `system-reference-maintance` audit exempts them.

## Type-Specific Schema Overrides

### 1. PAR Index Notes (`file_class: par`)

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
bridge:              # next concrete action ([[The Hemingway Bridge]])
img:
---
```

### 2. Issues (`file_class: issue`)

```yaml
---
paras: []
type: "[[Issues]]"
subtypes: ["[[Operational - Issues - bug|bug]]"]
rate:
tags: []
status: wip            # inbox | feed | wip | blocked | done
maturity: capture
created: YYYY-MM-DD HH:mm
priority: 0            # 0 (High), 1 (Medium), 2 (Low)
dueDate: YYYY-MM-DD
role: debt             # core | milestone | pattern | debt
dependencies: []       # MultiFile: links to issues that must resolve first
---
```

### 3. Medias (`file_class: media`)

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

### 4. Learning (`file_class: learning`)

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

### 5. Project journals (`file_class: journal`)

```yaml
---
paras: []              # the project PAR note
type: "[[Journals]]"
subtypes: ["[[Logging - Journals - project-log|project-log]]"]
rate:
tags: []
status: wip            # wip while open → done on close
maturity: capture
created: YYYY-MM-DD HH:mm
description: ""        # one line on what this journal tracks
---
```

### 6. Captures (`file_class: capture`)

```yaml
---
paras: []
type: "[[Resources]]"  # [[Ideas]] for Apple Notes thoughts
subtypes: ["[[External Knowledge - Resources - post|post]]"]  # video · post · bookmark · spark
rate:
tags: []
status: inbox          # the consumption queue; leaves it on review
maturity: capture
created: YYYY-MM-DD HH:mm
url: ""                # the source link; the importer dedupes on it
author: []             # ["[[@ThePrimeagen]]"]
platform: youtube      # youtube | x | instagram | web | apple-notes
---
```

### 7. News (`file_class: news`)

Written and rewritten only by `feeds_sync.py render` ([[Feed and News Design]]); no template.

```yaml
---
file_class: news
paras: []
type: "[[Resources]]"
subtypes: ["[[External Knowledge - Resources - news|news]]"]
rate:
tags: []
status: inbox          # inbox = expires 30 days after first_seen · done = kept, moved to _kept/
maturity: capture
created: YYYY-MM-DD HH:mm
group: politics-spain  # a group of sources.yaml (other is never rendered)
story_id: 517          # the story in ~/.config/feeds/feeds.db
outlets: 7             # outlets that cover the story
blindspot:             # L | R: no outlet of that side, 3+ outlets
first_seen: YYYY-MM-DD HH:mm
---
```

> [!note] Journals are edited only through `.obsidian/personal_scripts/journal.sh` — entries are bulleted (`- timestamp: description` with inline links + `key::: ` sub-bullets) and export to Excel/CSV; the close protocol creates the tech debt note. The `project-journaling` skill owns when to log.

