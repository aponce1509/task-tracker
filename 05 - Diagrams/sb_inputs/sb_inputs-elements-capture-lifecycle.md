---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - dynamic|dynamic]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-26 07:51
---
# [[sb_inputs-elements-capture-lifecycle]]

> [!abstract]
> One [[sb_inputs-elements-capture|capture]] from share to done: the states it passes and what moves it.
> - The queue of the [[sb_inputs-elements-pane|pane]] is every capture with status `inbox`.
> - Four ways in: a share (DropFile), a note in Apple Notes (AppleNote), the importer `--url` in a terminal, and the Web Clipper. `--url` goes through the same skip-or-create choice as the drop. Only the Web Clipper writes the capture straight to the queue, with no dedupe.
> - Only a capture with a url can be skipped or fail a fetch. A thought (an Apple Note or a text-only share in the drop) has no url: it always becomes a spark.
> - Look at the importer run: three exits (skip, retry, create).
> - After the import, the enricher ([[sb_inputs-elements-enricher]]) writes the type and subtype, the author, the summary and the paras into the capture. The capture stays in Inbox.
> - Edit keys: `p` paras, `t` type, `#` tags, `1-5` rate.
> - Look at the pane keys: `y`, `m` and `d` leave the queue, the edits stay in it.
> - Keep and move both set status `done`. They differ only in the folder.
> - The state machine works, but three parts are untested: the DropFile path waits for the shortcut ([[sb_inputs-elements-shortcut]]), the Web Clipper path has not clipped a page yet, and the enrich loop has not run on the real queue. That is why the note is wip.

```pele
stateDiagram-v2
  [*] --> DropFile : share on phone
  [*] --> AppleNote : write in Vault
  [*] --> Inbox : importer --url
  [*] --> Skipped : importer --url, url known
  [*] --> Inbox : web clipper
  DropFile --> Skipped : url known
  AppleNote --> Skipped : url known
  DropFile --> DropFile : fetch fails
  AppleNote --> AppleNote : fetch fails
  DropFile --> Inbox : import
  AppleNote --> Inbox : import
  Inbox --> Inbox : edit: paras, type, tags, rate
  Inbox --> Inbox : enriched by the local models
  Inbox --> Done : y keep
  Inbox --> MovedDone : m move
  Inbox --> Trash : d delete
  Skipped --> [*]
  Done --> [*]
  MovedDone --> [*]
  Trash --> [*]
  note right of DropFile : JSON in drop
  note right of Skipped : only a capture with a url, no note, source to _done when there is one
  note right of Inbox : status inbox, in 06 - Inputs/Captures
  note right of Done : status done, stays in 06 - Inputs/Captures
  note right of MovedDone : status done, PAR folder first
  note right of Trash : in .trash
```

## Details

- Import: [[sb_inputs-elements-importer]] runs `capture_import.py`. A source is the JSON file in `drop` or an Apple Notes note in the `Vault` folder.
- After import or skip, the source moves to `_done` (drop) or `Vault - Imported` (notes).
- A failed fetch leaves the source in place. The next run tries again.
- Enrich may rename a capture of pasted material to its real title, only when no note links to it.
- A thought (an Apple Note or a text-only share without a link) has no url. It never reaches Skipped and never fails a fetch.
- `--url` (`uv run --script capture_import.py --url <link> --note "why"`) applies the dedupe like the drop. The Web Clipper ([[HOWTO - Clip from the browser]]) writes the note directly and does not check the url.
- Dedupe reads every url in the vault. A `done` capture still blocks a re-import of the same url.
- Done: the status comes from `captures.keepStatus` in `99 - Meta/mise-en-place.jsonc` (default `done`). The note stays in `06 - Inputs/Captures`.
- Edits in [[sb_inputs-elements-pane]]: paras `p`, type `t`, tags `#`, rate `1-5`. They do not change the status.
- Enrich runs on every capture with status `inbox`, oldest first, within the budget of the pipeline (400 s, in `ai.toml`). It runs once per content version and models: a later run skips the capture while the note and the models of its tasks do not change. My edits in the pane are kept (the type changes only while it is the importer's default).
