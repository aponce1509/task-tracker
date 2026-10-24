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

> [!abstract] The Strata plugin, inside Obsidian
> - This is the Strata plugin of [[strata-elements]]: the part that renders the Diagram notes in Obsidian.
> - The box holds its five modules. Obsidian, Pele and the Note model are outside the box: the plugin uses them.
> - The Note model is shared code (`src/model.ts`), also used by the strata CLI. The plugin builds its diagram tree with it.
> - The Block renderer draws each `pele` block with Pele and mounts the breadcrumb and the child chips.
> - A linked node takes the color of its note status: the Block renderer reads that status from the Obsidian metadata cache.
> - Follow the edge labels: each one says what passes from one module to the next.

```pele
flowchart TB
  notes[(Diagram notes<br/>05 - Diagrams)]
  subgraph obsidian[Obsidian]
    cache[Metadata cache<br/>files · frontmatter · links]
    reading[Reading view · Live preview]
  end
  model[Note model<br/>src/model.ts · shared with the strata CLI]
  pele([Pele])
  subgraph plugin[Strata plugin]
    render[Block renderer]
    nav[Breadcrumb + child chips]
    panel[Tree panel]
    pane[Diagram pane]
    cmds[Commands<br/>New diagram project · New child diagram · Open parent diagram · Open diagram in pane · Open diagram tree]
  end
  notes -- indexed by --> cache
  cache -- names and frontmatter<br/>rebuild on change --> model
  model -- parents and children --> nav
  model -- the tree, with status --> panel
  obsidian -- active file<br/>file-open --> panel
  panel -- opens the note<br/>row click --> obsidian
  model -- names and template --> cmds
  reading -- pele block --> render
  cache -- note status --> render
  render -- draws with --> pele
  render -- mounts --> nav
  render -- expand button --> pane
  pane -- draws with --> pele
  cmds -- create notes --> notes
  cmds -- open in pane --> pane
  class nav,cmds done
  click model "strata-elements-model"
  click render "strata-elements-plugin-render"
  click panel "strata-elements-plugin-panel"
  click pane "strata-elements-plugin-pane"
```

## Details

- Entry: `src/main.ts`, class `StrataPlugin`. Setting: the diagrams folder, default `05 - Diagrams`.
- Tree: `rebuild()` reads the name, `status` and `subtypes` of each note in `<root>/<project>/` and calls `buildTree` of the Note model. Vault `create`, `delete`, `rename` and metadata `changed` events start it, debounced 300 ms.
- Tree panel: `rebuild()` of the plugin owns the rebuild. It sets `this.tree`, then `refreshViews()` calls `render()` of each Tree panel. The panel only draws `this.tree`. A `file-open` event also calls `refreshViews()`, so the panel marks the active file without a rebuild. A row click calls `openLinkText`.
- Status: `wireLinks()` resolves each `click` link and reads the `status` of the target from the metadata cache, not from the tree. A node with a status class in the diagram (`a:::done`) keeps it. `styles.css` gives the colors.
- Breadcrumb and child chips: only in a diagram note; the chain comes from `ancestorsOf`, the chips from the children of the node, with the status dot and the subtype.
- Commands overlap with the CLI: `New diagram project` and `New child diagram` create the same notes as `strata new`, with the same `noteTemplate`. The CLI does not need Obsidian.
- Both copy the `paras` of the parent note and check the level name with `validLevel`.
- The plugin uses the `pele` language, so the built-in `mermaid` blocks keep working unchanged.
