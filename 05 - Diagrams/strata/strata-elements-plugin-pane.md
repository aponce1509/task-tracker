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

> [!abstract] A diagram in its own pane
> - The expand button of a rendered block, or the command "Open diagram in pane", opens the diagram in a tab.
> - The pane pans and zooms with the trackpad, the mouse and the keys, and re-renders when the note changes.

```pele
stateDiagram-v2
  direction LR
  [*] --> Fitted : open
  Fitted --> Moved : pinch, scroll, drag, keys
  Moved --> Moved : pinch, scroll, drag, keys
  Moved --> Fitted : double-click, 0, fit button
  Fitted --> Fitted : note saved
  Moved --> Moved : note saved, view kept
```

## Details

- View type `strata-diagram`, class `DiagramView` in `src/main.ts`; its state is the file and the index of the pele block.
- Pinch comes as `wheel` with `ctrlKey` in Electron; plain `wheel` pans. Keys: `+` `-` zoom, `0` fit, `1` actual size, arrows pan.
- Mod-click on the expand button opens a split instead of a tab.
- The pan and zoom is a CSS transform on the SVG, not the Pele zoom: Pele zooms only a diagram that overflows its box.
