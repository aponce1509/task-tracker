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

> [!abstract] From pele block to clickable, colored diagram
> - The Block renderer of the Strata plugin: the path of one `pele` block from the note to the SVG on screen.
> - Obsidian gives each `pele` block to the Block renderer. A render child mounts Pele in the block.
> - After each Pele render, the Block renderer wires every link of the SVG. This is the place where the status colors come from.
> - A node that links to a note and has no status class takes the color of the `status` of that note.
> - A link to a missing note gets the unresolved style: the node shows dimmed.
> - Me hovers a linked node for the page preview, and clicks it to open the note.
> - When an agent saves the file, Obsidian runs the block again, so the diagram updates by itself.

```pele
sequenceDiagram
  autonumber
  actor Me
  participant O as Obsidian
  participant R as Block renderer
  participant C as Render child
  participant Pe as Pele
  O->>R: pele block (source, el, ctx)
  R->>R: Breadcrumb + child chips, only in a diagram note
  R->>C: addChild(canvas, source)
  C->>Pe: mount(canvas, source, zoom auto)
  Pe-->>C: SVG + onRender
  C->>R: wireLinks(canvas)
  loop each link in the SVG
    alt link with a scheme, such as https
      R->>R: on click, open it outside Obsidian
    else link to a note
      R->>O: find the note of the link
      O-->>R: the note, or no note
      alt no note
        R->>R: add the unresolved style, the node shows dimmed
      else note found and node has no status class
        R->>R: add the status of the note as its class
      end
    end
  end
  Me->>R: hover a linked node, Mod held
  R->>O: hover-link event with the note name
  O-->>Me: page preview of the note
  Me->>R: click a linked node
  R->>O: openLinkText(note), Mod-click opens a new tab
  Note over O,Pe: on file save Obsidian unloads the render child (Pele destroy) and runs the block again
```

## Details

- Code: `src/main.ts`. `StrataPlugin.renderBlock` is the Block renderer, `DiagramChild` is the render child, `StrataPlugin.wireLinks` wires the links.
- Pele writes `<a href>` for `click` and `<a data-href>` for `class x internal-link`; both are wired.
- Links with a scheme (`https:`) open outside Obsidian; links without one are note names, resolved with `metadataCache.getFirstLinkpathDest`.
- Unresolved style: class `is-unresolved` on the link, `opacity: 0.6` in `styles.css`. The node stays clickable: a click calls `openLinkText`, and Obsidian opens the link as it does everywhere. For a missing note, Obsidian creates an empty note with that name and opens it.
- Status color: the `status` of the linked note (`inbox`, `wip`, `blocked`, `done`) goes on the `.pele-node` as a class. A class set in the diagram (`a:::wip`) wins. `styles.css` colors the classes.
- The status color comes at render time: a change of `status` in a linked note shows on the next render of the block.
- Page preview: the hover source is `strata` with `defaultMod: true`, so the preview needs Mod held, unless the Page preview settings say otherwise.
- The Diagram pane calls the same `wireLinks` after its own Pele render, so links and colors are the same there.
- Syntax errors: Pele shows them in the block, dimmed over the last good render.
