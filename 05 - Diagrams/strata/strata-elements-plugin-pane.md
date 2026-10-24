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
> - The diagram shows the two states of the view: `Fitted` (all the diagram in the pane) and `Moved` (a zoom or position that Me chose).
> - While `Fitted`, a save of the note or a resize fits the diagram again, so a diagram that an agent grows stays in view.
> - A zoom or pan goes to `Moved`, and then a save or a resize keeps the view. A fit action goes back to `Fitted`.

```pele
stateDiagram-v2
  direction LR
  [*] --> Fitted : open
  Fitted --> Fitted : save or resize, fit again
  Fitted --> Moved : zoom or pan
  Moved --> Moved : zoom or pan
  Moved --> Moved : save or resize, view kept
  Moved --> Fitted : double-click, 0, fit button
```

## Details

- View type `strata-diagram`, class `DiagramView` in `src/main.ts`; its state is the file and the index of the pele block.
- Pinch comes as `wheel` with `ctrlKey` in Electron; plain `wheel` pans. Keys: `+` `-` zoom, `1` actual size (100 %, about the centre), arrows pan: all go to `Moved`. `0` fits.
- Zoom or pan means: pinch, scroll, drag, keys `+` `-` `1`, arrow keys, zoom buttons and a click on the zoom label.
- Fit actions: double-click on the stage, key `0` and the fit button of the toolbar.
- A click on the zoom label (the percentage) also sets the actual size.
- The flag `moved` holds the state: `zoomAt` and `pan` set it, `fit` and `setState` (open) clear it. `onRender` and `onResize` fit while it is clear ([[_I00042 Strata pane refits when the diagram grows]]).
- Mod-click on the expand button opens a split instead of a tab.
- The pan and zoom is a CSS transform on the SVG, not the Pele zoom: Pele zooms only a diagram that overflows its box.
