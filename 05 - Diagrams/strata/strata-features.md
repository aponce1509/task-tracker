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
> - The features of Strata, grouped by area, each with its status.
> - Each feature links to the element that builds it.

```pele
flowchart LR
  subgraph view[Viewing]
    direction TB
    render[Render pele blocks]:::done
    nav[Breadcrumb and child chips]:::done
    panel[Tree panel]:::done
    pane[Zoom pane]:::done
    colors[Status colors]:::done
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
  click project "strata-elements-cli"
  click child "strata-elements-plugin"
  click check "strata-elements-cli"
  click svg "strata-elements-cli"
  click json "strata-elements-cli"
  click workers "strata-elements-skill"
```

## Details

- A feature is something I can do with the system, not a part of it; the parts are in [[strata-elements]].
