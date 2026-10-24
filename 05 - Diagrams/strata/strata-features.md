---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - features|features]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 19:15
---
# [[strata-features]]

> [!abstract] What Strata does
> - The features of [[strata]], grouped by area: what I can do with it, each with its status.
> - Each feature links to the one element note that owns it. The parts are in [[strata-elements]]. Every feature carries its status color.
> - Viewing: what I see in Obsidian (the diagram, the links between notes, the tree, the pane).
> - Authoring: what the agents and I do to write and check diagrams, with the CLI and the plugin commands.
> - Planning: what turns the tree into work, with the tree as JSON and the build loop.

```pele
flowchart LR
  subgraph view[Viewing]
    direction TB
    render[Render pele blocks]:::done
    nav[Breadcrumb and child chips]:::done
    up[Open parent diagram]:::done
    panel[Tree panel]:::done
    pane[Diagram pane]:::done
    colors[Status colors on linked nodes]:::done
    hover[Page preview on hover]:::done
  end
  subgraph author[Authoring]
    direction TB
    project[New project with three views]:::done
    child[New child diagram]:::done
    agents[Agents write and review diagrams]:::done
    check[Check diagram notes]:::done
    svg[Render a note to SVG]:::done
  end
  subgraph plan[Planning]
    direction TB
    json[Tree as JSON for agents]:::done
    workers[Parallel build plan from the tree]:::done
  end
  click render "strata-elements-plugin-render"
  click nav "strata-elements-plugin"
  click up "strata-elements-plugin"
  click agents "strata-elements-skill"
  click panel "strata-elements-plugin-panel"
  click pane "strata-elements-plugin-pane"
  click colors "strata-elements-plugin-render"
  click hover "strata-elements-plugin-render"
  click project "strata-elements-cli"
  click child "strata-elements-cli"
  click check "strata-elements-cli"
  click svg "strata-elements-cli"
  click json "strata-elements-cli"
  click workers "strata-elements-skill"
```

## Details

- A feature is something I can do with the system, not a part of it; the parts are in [[strata-elements]].
- `New project with three views` and `New child diagram` link to [[strata-elements-cli]] (`strata new`), the path of the agents. The plugin commands ([[strata-elements-plugin]]) offer them too.
- `Status colors on linked nodes` links to [[strata-elements-plugin-render]]: the render colors each node by its status class. A linked node without a class takes the `status` of its note (`src/main.ts`).
- `Page preview on hover` links to [[strata-elements-plugin-render]]: hover on a linked node with Mod held shows the page preview (`registerHoverLinkSource` with `defaultMod`, `src/main.ts`).
- `Breadcrumb and child chips` and `Open parent diagram` have no own note; they live in [[strata-elements-plugin]]. `Open parent diagram` is a plugin command (`src/main.ts`).
- `Agents write and review diagrams` links to [[strata-elements-skill]]: the design loop, where diagram-writer agents write the notes and the diagram-reviewer reads them cold.
