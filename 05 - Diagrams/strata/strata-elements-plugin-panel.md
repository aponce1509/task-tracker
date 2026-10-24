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
> - The Tree panel is a module of [[strata-elements-plugin|Strata plugin]]. It draws the tree that the plugin builds with the Note model.
> - A right-sidebar view lists each project and its notes as a tree.
> - Each row shows the status dot, the subtypes and a `!` when the name breaks a rule.
> - The plugin owns the rebuild: it rebuilds the tree on vault changes, and the panel only draws the result. A click on a row opens the note in the same tab; Mod-click opens it in a new tab.
> - The diagram shows the states of the panel: it waits in Idle, and each event (vault change, file open, row click) is one short state that returns to Idle.

```pele
stateDiagram-v2
  direction LR
  [*] --> Idle
  Idle --> Rebuilding : vault or metadata change (plugin, debounced)
  Rebuilding --> Idle : plugin builds tree, panel draws it
  Idle --> Highlight : file-open (plugin refreshes the panel)
  Highlight --> Idle : panel redrawn, active row marked
  Idle --> Opening : click row (Mod-click: new tab)
  Opening --> Idle : note opened
```

## Details

- View type `strata-tree`; open it with the ribbon icon or the command "Open diagram tree".
- Rebuilds are debounced to 300 ms, so a burst of agent edits gives one rebuild.
- The `!` marker shows the `problems` of the Note model (`src/model.ts`): a bad level name, a name that does not start with the project folder, or a missing parent. `strata check` reports the same list as errors (`src/cli.ts`); the row tooltip (`src/main.ts`) lists them.
