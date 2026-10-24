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
created: 2026-10-24 19:15
---
# [[strata-elements-plugin-pane]]

> [!abstract] The Diagram pane: one diagram in its own tab
> - The Diagram pane is a module of the [[strata-elements-plugin|Strata plugin]]. The expand button of a rendered block, or the command "Open diagram in pane", opens it.
> - The diagram shows the two states of the view: `Fitted` (all the diagram in the pane) and `Moved` (any other zoom or position).
> - Each change of zoom or position goes to `Moved`. Only a fit goes back to `Fitted`. A save of the note re-renders the diagram and keeps the view.

```pele
stateDiagram-v2
  direction LR
  [*] --> Fitted : open
  Fitted --> Moved : pinch, scroll, drag, keys + - 1, arrow keys, zoom buttons, zoom label click
  Moved --> Moved : pinch, scroll, drag, keys + - 1, arrow keys, zoom buttons, zoom label click
  Moved --> Fitted : double-click, 0, fit button
  Fitted --> Fitted : note saved, view kept
  Moved --> Moved : note saved, view kept
  Fitted --> Fitted : resize, view kept
  Moved --> Moved : resize, view kept
```

## Details

- View type `strata-diagram`, class `DiagramView` in `src/main.ts`; its state is the file and the index of the pele block.
- Pinch comes as `wheel` with `ctrlKey` in Electron; plain `wheel` pans. Keys: `+` `-` zoom, `1` actual size (100 %, about the centre), arrows pan: all go to `Moved`. `0` fits.
- A click on the zoom label (the percentage) also sets the actual size.
- The pane fits the diagram only at open. A save or a resize after the first fit keeps the transform, so a diagram that grows can go out of the fitted view.
- Mod-click on the expand button opens a split instead of a tab.
- The pan and zoom is a CSS transform on the SVG, not the Pele zoom: Pele zooms only a diagram that overflows its box.
