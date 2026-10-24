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
# [[strata-elements-plugin-render]]

> [!abstract] From code block to clickable diagram
> - Obsidian calls the processor for each `pele` block; the processor mounts Pele in a render child.
> - After each render the plugin wires the links: note links open the note, hover shows the page preview.
> - When an agent saves the file, Obsidian runs the processor again, so the diagram updates by itself.

```pele
sequenceDiagram
  participant O as Obsidian
  participant P as StrataPlugin
  participant C as DiagramChild
  participant Pe as Pele
  actor Me
  O->>P: pele block (source, el, ctx)
  P->>P: breadcrumb from the tree
  P->>C: addChild
  C->>Pe: mount(el, source, zoom auto)
  Pe-->>C: SVG + onRender
  C->>P: wireLinks(canvas)
  P->>P: mark unresolved links
  Me->>P: click node
  P->>O: openLinkText(target)
  Note over O,Pe: on file save Obsidian unloads the child (destroy) and runs the block again
```

## Details

- Pele writes `<a href>` for `click` and `<a data-href>` for `class x internal-link`; both are handled.
- Links with a scheme (`https:`) open outside; links without one are note names.
- Mod-click opens the note in a new tab, the same as Obsidian links.
- Syntax errors: Pele shows them in the block, dimmed over the last good render.
