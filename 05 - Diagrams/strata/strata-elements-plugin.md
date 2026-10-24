---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - component|component]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 12:00
---
# [[strata-elements-plugin]]

> [!abstract] The Obsidian side
> - The plugin renders every `pele` code block with Pele and maps the colors to the Obsidian theme.
> - In a diagram note it adds a breadcrumb of the parents and chips for the children.
> - A side panel shows the tree of all projects with the status of each note.
> - A linked node takes the color of its note status; any diagram opens in its own pane with pan and zoom.

```pele
flowchart TB
  subgraph obsidian[Obsidian]
    vault[(Vault events<br/>create · delete · rename · metadata)]
    reading[Reading view · Live preview]
  end
  subgraph plugin[Strata plugin]
    model[Tree model]
    render[pele block renderer]
    nav[Breadcrumb + child chips]
    panel[Tree panel]
    pane[Diagram pane]
    cmds[Commands<br/>new project · new child · open parent · open in pane]
  end
  vault -- debounced rebuild --> model
  reading -- pele block --> render
  model --> nav & panel & cmds
  render --> nav
  render -- expand --> pane
  click model "strata-elements-model"
  click render "strata-elements-plugin-render"
  click panel "strata-elements-plugin-panel"
  click pane "strata-elements-plugin-pane"
```

## Details

- Entry: `src/main.ts`, class `StrataPlugin`.
- Setting: the diagrams folder, default `05 - Diagrams`.
- Status colors: a node class `inbox`, `wip`, `blocked` or `done` (`a:::done`) is colored by `styles.css`; a linked node without one gets the `status` of its note.
- The plugin uses the `pele` language, so the built-in `mermaid` blocks keep working unchanged.
