---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes: ["[[Normative - Specs - feature-spec|spec]]"]
rate:
tags:
status:
maturity: capture
created: 2026-08-18 23:15
---
# [[Common Frontmatter Schemas & Specific Note Templates]]

## Global Property & Metadata Taxonomy

Instead of relying on tags with prefixes like `#_inbox` or `#_to_learn`, dimensions are elevated to explicit YAML keys:

- Execution Properties
	- `status`: `inbox` | `wip` | `blocked` | `done`
- Knowledge Lifecycle Properties
	- `lifecycle`: `capture` | `distilled` | `evergreen`
- Structural Role Properties
	- `role`: `core` | `pattern` | `milestone` | `debt`
- Learning Properties
	- `learning_status`: `to_learn` | `learning` | `learned` | `abandoned`
- Media Consumption Properties
	- `consumption_status`: `to_consume` | `consuming` | `completed` | `abandoned` | `pending_new_content`

This note contains the boilerplate YAML frontmatter templates for notes in your vault.

## Common Base Schema

Every note in the system inherits these core properties.

```yaml
---
paras: []             # List of links to P/A/R index notes (e.g., ["[[Project A]]"])
type: ""              # Structural identity (e.g., "Resource", "Issue", "Concept")
subtype: []           # List of applicable subtypes (e.g., ["article", "paper"])
tags: []              # Cross-cutting thematic or inline tags
rate: null            # Rating scale: 1 to 5
created: YYYY-MM-DD   # Creation timestamp
status: inbox         # Options: inbox, wip, blocked, done
lifecycle: capture    # Options: capture, distilled, evergreen
---
```

## Type-Specific Schema Overrides

### 1. P/A/R Index Notes (`para`)

Use this for root nodes in your PARA structure (Projects, Areas, Resources).

```yaml
---
paras: []
type: "PAR"
subtype: ["index"]
tags: []
rate: null
created: YYYY-MM-DD
paraType: "Project"     # Options: Project, Area, Resource
active: true            # Active project/area flag
lifecycle: evergreen
---

```


### 2. Issues (`Issue`)

Use for actionable work items, tasks, and bugs.

```yaml
---
paras: []
type: "Issue"
subtype: ["bug"]        # Options: bug, task, improvement, incident, open-problem
tags: []
rate: null
created: YYYY-MM-DD
status: wip             # Options: inbox, wip, blocked, done
priority: 0             # Scale: 0 (High), 1 (Medium), 2 (Low)
dueDate: YYYY-MM-DD     # Target resolution date
role: "debt"            # Options: core, pattern, milestone, debt
---

```


### 3. External Knowledge - Medias (`Media`)

Use for books, films, podcasts, videos, and shows.

```yaml
---
paras: []
type: "Media"
subtype: ["book"]       # Options: book, film, podcast, show, video
tags: []
rate: 5                 # Rating: 1-5
created: YYYY-MM-DD
consumption_status: "to_consume" # Options: to_consume, consuming, completed, abandoned, pending_new_content
---
```


### 4. Learning & Study Notes (`Syllabus` / `Concept`)

Use when managing deliberate learning paths or educational material.

```yaml
---
paras: []
type: "Syllabus"
subtype: ["course"]     # Options: course, curriculum, module
tags: []
rate: null
created: YYYY-MM-DD
learning_status: "learning" # Options: to_learn, learning, learned, abandoned
lifecycle: "distilled"
---
```
