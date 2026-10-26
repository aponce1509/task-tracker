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
# [[sb_inputs-elements-shortcut]]

> [!abstract]
> Phone side of the capture pipeline: the steps of the shortcut "→ Vault", from the share sheet to the drop.
> - One shortcut serves every app, because every app shares a URL.
> - One file per share: iCloud syncs a file as a whole, so one new file per share never arrives half-written (unlike appending to one shared file).
> - Status wip: built in the Shortcuts app on 2026-10-26. The first share has not reached the drop yet, so it is not tested end to end.
> - Look for the end: the shortcut stops at the drop. The [[sb_inputs-elements-importer]] takes the file from there.

```pele
flowchart TB
  a([Share sheet input<br/>URLs, Text, Safari web pages]) --> c
  b([No input: run from the home screen<br/>Ask For Text]) --> c
  c[Ask for Input<br/>Text, prompt Why?, may stay empty] --> d[Dictionary<br/>url = Shortcut Input<br/>note = Provided Input<br/>created = Current Date, ISO 8601]
  d --> e[Set Name<br/>capture- + yyyyMMdd-HHmmss + .json]
  e --> f[Save File<br/>Ask Where to Save off<br/>Overwrite off]
  f ==> g[(drop Captures/<br/>iCloud Drive/Captures)]
  f -.-> h([Notification Saved])
  g ==> i[[importer<br/>capture_import.py]]
  class a,b,c,d,e,f,h wip
  class g done
  click i "sb_inputs-elements-importer"
```

## Details

- Steps come from [[HOWTO - Capture from the phone]].
- Share sheet: Show in Share Sheet on. Without input, Ask For Text makes the shortcut take a quick thought.
- A text-only share becomes a thought: the dictionary has no url.
- The name has a timestamp, so each share is a new file and Overwrite stays off.
- Save File points to `Captures/` at the root of iCloud Drive, chosen in the folder picker (not the Shortcuts folder). On the Mac it is `~/Library/Mobile Documents/com~apple~CloudDocs/Captures`, the default of `CAPTURES_DROP`.
- If Save File only offers the Shortcuts folder, set `CAPTURES_DROP` to `~/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/Captures`.
- The notification is optional.
