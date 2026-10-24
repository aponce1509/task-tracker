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
> - The diagram shows the two states of the view: `FitAtOpen` (all the diagram in the pane, as fitted when it opened or when a fit action ran) and `Moved` (any other zoom or position).
> - Each change of zoom or position goes to `Moved`. A fit action goes back to `FitAtOpen`.
> - Warning: a save of the note or a resize keeps the transform. A diagram that grows can stay in `FitAtOpen` while it no longer fits.

```pele
stateDiagram-v2
  direction LR
  [*] --> FitAtOpen : open
  FitAtOpen --> Moved : zoom or pan
  Moved --> Moved : zoom or pan
  Moved --> FitAtOpen : double-click, 0, fit button
  FitAtOpen --> FitAtOpen : save or resize, view kept
  Moved --> Moved : save or resize, view kept
```

## Details

- View type `strata-diagram`, class `DiagramView` in `src/main.ts`; its state is the file and the index of the pele block.
- Pinch comes as `wheel` with `ctrlKey` in Electron; plain `wheel` pans. Keys: `+` `-` zoom, `1` actual size (100 %, about the centre), arrows pan: all go to `Moved`. `0` fits.
- Zoom or pan means: pinch, scroll, drag, keys `+` `-` `1`, arrow keys, zoom buttons and a click on the zoom label.
- Fit actions: double-click on the stage, key `0` and the fit button of the toolbar.
- A click on the zoom label (the percentage) also sets the actual size.
- Known limit: the pane fits the diagram only at open or on a fit action. A save or a resize keeps the transform, so a diagram that grows can stay in `FitAtOpen` and no longer fit. An issue to refit on growth is open.
- Mod-click on the expand button opens a split instead of a tab.
- The pan and zoom is a CSS transform on the SVG, not the Pele zoom: Pele zooms only a diagram that overflows its box.
