---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - dynamic|dynamic]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 12:00
---
# [[strata-elements-plugin-panel]]

> [!abstract] Tree panel
> - A right-sidebar view lists each project and its notes as a tree.
> - Each row shows the status dot, the subtypes and a `!` when the name breaks a rule.
> - The panel follows the active file and rebuilds on vault changes.

```pele
stateDiagram-v2
  direction LR
  [*] --> Idle
  Idle --> Rebuilding : vault or metadata change
  Rebuilding --> Idle : tree built, panel re-rendered
  Idle --> Highlight : file-open
  Highlight --> Idle
  Idle --> Opening : click row
  Opening --> Idle : note opened
```

## Details

- View type `strata-tree`; open it with the ribbon icon or the command "Open diagram tree".
- Rebuilds are debounced to 300 ms, so a burst of agent edits gives one rebuild.
