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
> - Each feature links to the one element note that owns it. The parts are in [[strata-elements]].

```pele
flowchart LR
  subgraph view[Viewing]
    direction TB
    render[Render pele blocks]:::done
    nav[Breadcrumb and child chips]:::done
    panel[Tree panel]:::done
    pane[Diagram pane]:::done
    colors[Status colors]:::done
    hover[Page preview of linked nodes]:::done
  end
  subgraph author[Authoring]
    direction TB
    project[New project with three views]:::done
    child[New child diagram]:::done
    check[Check notes]:::done
    svg[Render to SVG]:::done
  end
  subgraph plan[Planning]
    direction TB
    json[Tree as JSON]:::done
    workers[Parallel build plan]:::done
  end
  click render "strata-elements-plugin-render"
  click nav "strata-elements-plugin"
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
- `Status colors` links to [[strata-elements-plugin-render]]: the render colors each node by its status class. A linked node without a class takes the `status` of its note (`src/main.ts`).
- `Page preview of linked nodes` links to [[strata-elements-plugin-render]]: hover on a linked node with Mod held shows the page preview (`registerHoverLinkSource` with `defaultMod`, `src/main.ts`).
- `Breadcrumb and child chips` has no own note; it lives in [[strata-elements-plugin]].
