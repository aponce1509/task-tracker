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
created: 2026-10-26 07:51
---
# [[sb_inputs-elements-pane]]

> [!abstract] The pane: where I consume the captures with the keyboard
> - This is the pane of [[sb_inputs-elements]]: the last step of the pipeline, after the importer wrote the capture notes with status inbox.
> - `<leader>` is the Space key (or Ctrl+Space): it opens the Mise-en-Place key menu. `<leader> c` opens the pane.
> - How a key reaches an action: the plugin listens to every keydown. When the Captures pane is the active pane, it looks the key up in the captures key map of `mise-en-place.jsonc` and runs that action on the pane.
> - The queue is the captures with status inbox, newest first. Keep, move and delete make a capture leave the queue.
> - Look at the action groups: navigation (move, filter, open) does not change the note, edit changes the properties, leave empties the queue, import fills it again.

```pele
flowchart LR
  entry["<leader> c<br/>mise-en-place:captures"] --> view

  subgraph pane[Captures pane]
    view["Captures pane<br/>queue: capture + inbox, newest first"]
    list["Platform chips + list rows"]
    preview["Preview<br/>properties strip + rendered note<br/>MarkdownRenderer"]
    log[Log box<br/>import summary]
    view --> list --> preview
    view --> log
  end

  actions["Pane actions<br/>captures key map"]
  view -->|key| actions

  nav["Navigation<br/>j k · gg G · f filter<br/>Enter open note · o open url"]

  subgraph edit[Edit frontmatter]
    picker["pick from a list<br/>ChoicePicker"]
    e1["p paras · t type + subtype<br/># the four tags"]
    e4[1-5 rate]
    pf["write the properties<br/>processFrontMatter"]
    e1 --> picker --> pf
    e4 --> pf
  end

  subgraph leave[Leave the queue]
    l1["y keep<br/>status done"]
    l2["m move to a folder<br/>PAR folder first, status done"]
    l3["d delete<br/>trash"]
  end

  imp["i / Import button<br/>uv run --script"]
  importer[[Importer<br/>capture_import.py]]
  capture[(Capture note)]

  actions --> nav & edit & leave & imp
  nav --> list
  nav -->|Enter opens the capture note in a tab| capture
  pf --> capture
  l1 & l2 --> pf
  l2 & l3 --> capture
  imp --> importer --> capture
  imp -.->|output summary| log
  capture -.->|metadata change, debounced refresh| view
  picker -.->|focus back to the pane| view

  click importer "sb_inputs-elements-importer"
  click capture "sb_inputs-elements-capture"
```

## Details

- Key routing: the plugin keydown listener asks `contextAt` whether the Captures pane is active, looks the key up in the captures key map and runs the entry of `capturesActions`.
- Code: `.obsidian/plugins/mise-en-place/main.js`, class `Captures` (view type `mise-captures`) and `ChoicePicker`; the plugin methods `capturesView`, `capturesActions` and `contextAt`.
- Styles: `.obsidian/plugins/mise-en-place/styles.css`, classes `.mise-cap-*`.
- Keys: `99 - Meta/mise-en-place.jsonc`, context `captures`; the entry is `<leader> c`. `?` shows the keys.
- `captures.keepStatus` sets the status of keep and move; the default is `done`.
- The refresh is debounced (250 ms) on metadata changes, delete and rename.
- Platform filter: `youtube`, `x`, `instagram`, `web`, `apple-notes`; `f` cycles only the platforms present in the queue.
- Tags are limited to the four canonical ones; the rate key toggles (same key clears).
- Move shows the folders of the linked PARs first, then all folders except `99 - Meta`.
- The import runs with a timeout of 10 minutes and a button shows the state while it runs.
