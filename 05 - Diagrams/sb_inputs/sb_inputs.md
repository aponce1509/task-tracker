---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - context|context]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-26 07:51
---
# [[sb_inputs]]

> [!abstract] sb_inputs: capture from the phone and the browser, consume at the Mac
> - sb_inputs is the capture pipeline of my second brain. I share a link on the iPhone with the shortcut, or I write a thought in Apple Notes. The importer then makes one typed capture note in the vault. On the Mac, the Web Clipper saves a full page from the browser as the same capture note.
> - The drop is the iCloud Drive folder `Captures/`: each share lands there as one file. The Captures pane is the pane of the Mise-en-Place plugin, inside Obsidian.
> - I am the only user. I capture on the iPhone, and I consume the queue at the Mac in the Captures pane.
> - The importer runs when I press Import in the Captures pane. Every two weeks `/sweep`, the agent command of the inbox sweep, runs it too, so no share stays in the drop.
> - Look at what each side gives. The phone side only gives files (the drop) and notes (Apple Notes). The importer is the only part that calls outside services; the local models stay on the Mac. The Web Clipper writes to the vault directly, without the importer. The vault side is where I read and sort the captures.
> - After each import, the enricher (the local AI pass) runs local models through Ollama on the Mac: the type and subtype, the author, a summary and the paras of each capture. The AI layer (`ai.toml`) gives each task its model. No capture leaves the Mac.
> - Yellow is built and not fully tested: the shortcut is built, but no share has reached the drop yet, and the Web Clipper template has not clipped a page yet (status wip). The enricher is wip too: tested on copies, not on the real queue. The importer and the Captures pane run today.
> - Two views go one level down: the [[sb_inputs-features|features]] (what I can do) and the [[sb_inputs-elements|elements]] (the parts and how they connect).

```pele
flowchart LR
  me([Me<br/>iPhone and Mac])
  subgraph phone[iPhone]
    apps[YouTube, X,<br/>Instagram, Safari]
    shortcut[shortcut<br/>share sheet]:::wip
    notes[Apple Notes<br/>folder Vault]
  end
  drop[(drop Captures/<br/>iCloud Drive)]
  subgraph sys[Mac]
    sb[importer and Captures pane]:::done
    clipper[Web Clipper<br/>in the browser]:::wip
    enricher[enricher<br/>capture_ai.py]:::wip
    ollama[Ollama, local models<br/>decision, chat, embed]
  end
  subgraph ext[Outside services]
    yt[YouTube<br/>yt-dlp, transcript]
    fx[api.fxtwitter.com]
    ig[Instagram<br/>cookies or Open Graph]
    web[Web pages<br/>Open Graph]
  end
  vault[(Vault in Obsidian<br/>06 - Inputs/Captures/)]
  me -- shares --> apps
  me -- types a thought --> notes
  apps -- share, optional why --> shortcut
  shortcut -- one JSON file --> drop
  drop -- read --> sb
  notes -- read --> sb
  sb -- fetch --> yt & fx & ig & web
  sb -- after each import --> enricher
  enricher -- decide, chat, embed --> ollama
  enricher -- fills the capture --> vault
  sb -- one capture note per item --> vault
  me -- clips a page or highlights --> clipper
  clipper -- full page as a capture note --> vault
  me -- consumes in the Captures pane --> vault
  features[Features<br/>what I can do]
  elements[Elements<br/>the parts]
  click features "sb_inputs-features"
  click elements "sb_inputs-elements"
```

## Details

- Importer: `99 - Meta/scripts/feeds/capture_import.py`, a uv script with yt-dlp. It reads the drop and Apple Notes through osascript JXA.
- Captures: `06 - Inputs/Captures/`. The importer skips a url that the vault has already (dedupe on the `url` property).
- Moves after the import: drop files go to `Captures/_done/`, Apple Notes go to the folder `Vault - Imported`. A capture that fails stays for the next run.
- Captures pane: `.obsidian/plugins/mise-en-place/main.js` (class Captures), opened with `<leader> c`. It has an Import button that runs the importer.
- Base: `04 - Bases/final-bases/captures.base` with the views Queue, By author and All captures.
- Local AI pass: `99 - Meta/scripts/feeds/capture_ai.py`, through the AI layer `99 - Meta/scripts/ai/vault_ai.py` and its config `ai.toml`. Models, all through Ollama: `d3:4b` decides the type and subtype, `qwen3.5:9b` writes the author, `qwen3.5:4b` the summary, `qwen3-embedding:0.6b` gives the vectors for the paras vote and the groups. It fills only empty fields and never touches `## Annotations`. Status wip: tested on copies, not yet on the real queue.
- The sweep (`/sweep`, every two weeks) runs the importer too, as a safety net.
- How to capture: [[HOWTO - Capture from the phone]] · [[HOWTO - Clip from the browser]].
- Web Clipper: Obsidian Web Clipper with the template `99 - Meta/Templates/Web Clipper - Capture.json`. It writes to `06 - Inputs/Captures/` with `platform: web` and subtype `article`.
- Limit: the shortcut is built but not tested end to end. Until the first share reaches the drop, only Apple Notes is proven to feed the importer.
- Limit: the Web Clipper does not dedupe on `url`. A page shared from the phone and clipped on the Mac gives two captures.
- Limit: Instagram needs browser cookies for full metadata. Without them the importer falls back to Open Graph tags, then to the bare link.
- Features and Elements are navigation, not parts of the system: they have no edge.
