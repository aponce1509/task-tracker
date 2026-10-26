---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - container|container]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-26 07:51
---
# [[sb_inputs-elements]]

> [!abstract]
> Parts of the capture pipeline and where each one runs.
> - iPhone: the "→ Vault" Shortcut and the Apple Notes folder `Vault`.
> - iCloud Drive: the folder `Captures/` (drop).
> - Mac: `capture_import.py` (importer), the only part that talks to outside services. The Web Clipper in the browser, which writes capture notes directly. `/sweep`, the agent command of the two-weekly sweep.
> - Mac, local AI: the enricher (`capture_ai.py`) runs the `captures` pipeline after each import. The AI layer (`vault_ai.py` with `ai.toml`) gives each task its model: a decision model for the type, a chat model for the author and the summary, an embedding model for the paras and the groups. All of them run in Ollama on the Mac, so no capture leaves the Mac. See [[sb_inputs-elements-enricher]] and [[sb_inputs-elements-ailayer]].
> - Obsidian vault: the capture notes, `captures.base` and the Captures pane.
> - Follow one share: shortcut → drop → importer → services → capture → the enricher fills it. Then base and pane read the capture.
> - The importer has three callers: the pane (Import), `/sweep` (the agent command for the two-weekly sweep, which empties the capture devices before it cleans the inbox), and the user by hand in a terminal.
> - The fields of a capture note are in [[sb_inputs-elements-capture]].

```pele
flowchart LR
  subgraph phone[iPhone]
    shortcut["The → Vault Shortcut"]
    notes[(Apple Notes<br/>folder Vault)]:::done
  end
  subgraph icloud[iCloud Drive]
    drop[("drop (Captures/)")]:::done
  end
  subgraph mac[Mac]
    hand["by hand (terminal)"]:::done
    sweep["/sweep<br/>agent, every two weeks"]:::done
    importer[importer<br/>capture_import.py]
    clipper[Web Clipper<br/>template Capture]:::wip
    enricher[enricher<br/>capture_ai.py]:::wip
    ailayer[AI layer<br/>vault_ai.py, ai.toml]:::wip
    ollama[(Ollama, one model at a time<br/>d3:4b, qwen3.5:9b, qwen3.5:4b,<br/>qwen3-embedding:0.6b)]
  end
  subgraph services[Outside services]
    yt[YouTube<br/>yt-dlp]:::done
    ig[Instagram<br/>yt-dlp]:::wip
    fx[X<br/>api.fxtwitter.com]:::done
    web[Web pages<br/>Open Graph]:::done
  end
  subgraph vault[Obsidian vault]
    capture[Capture note]
    base[captures.base]:::done
    pane[Captures pane]
  end
  shortcut -->|JSON file per share| drop
  drop ==> importer
  notes -->|osascript| importer
  importer -->|metadata, transcript| yt
  importer -->|metadata| ig & fx
  importer -->|"Open Graph (also the Instagram fallback)"| web
  importer ==>|writes note| capture
  clipper ==>|"writes note (no dedupe)"| capture
  importer -->|after the import, budget from ai.toml| enricher
  enricher -->|tasks of the captures pipeline| ailayer
  ailayer -->|decide, chat, embed| ollama
  enricher ==>|fills type, author, summary, paras| capture
  enricher -->|reads typed notes for the paras vote| vault
  base -->|reads| capture
  pane -->|reads, edits frontmatter,<br/>moves, trashes| capture
  pane -->|Import| importer
  sweep -->|runs| importer
  hand -->|uv run| importer
  click shortcut "sb_inputs-elements-shortcut"
  click importer "sb_inputs-elements-importer"
  click enricher "sb_inputs-elements-enricher"
  click ailayer "sb_inputs-elements-ailayer"
  click capture "sb_inputs-elements-capture"
  click pane "sb_inputs-elements-pane"
```

## Details

- Importer: `99 - Meta/scripts/feeds/capture_import.py`, a uv script with yt-dlp. Dedupes on `url`, escapes hashtags, writes to `06 - Inputs/Captures/`.
- After import: drop files go to `Captures/_done/`; Apple Notes go to the folder `Vault - Imported`.
- Enricher: `99 - Meta/scripts/feeds/capture_ai.py`, called by the importer after each import. `--no-ai` skips it, `--ai-budget` overrides the `budget` of the pipeline (400 s). It is skipped, and the import still works, when Ollama is down.
- AI layer: `99 - Meta/scripts/ai/vault_ai.py` reads `ai.toml` (connectors, models with a role, tasks, pipelines). It also has the Claude Code and OpenCode Go connectors, for other pipelines; no capture task uses them. See [[sb_inputs-elements-ailayer]].
- Env vars: `CAPTURES_DROP`, `CAPTURES_NOTES_FOLDER`, `CAPTURES_COOKIES_BROWSER`.
- Base: `04 - Bases/final-bases/captures.base` (Queue, By author, All captures).
- Pane: `.obsidian/plugins/mise-en-place/main.js`, class `Captures`; leader key `c`, Import button or key `i`.
- Sweep: `99 - Meta/commands/sweep.md`, run by Claude Code or OpenCode. Step 2 runs the importer. The workflow is [[WORKFLOWS - Bi-Monthly Inbox Sweep]].
- Web Clipper: Obsidian Web Clipper, template `99 - Meta/Templates/Web Clipper - Capture.json` (subtype article, platform web). Not tested yet: see [[HOWTO - Clip from the browser]].
- The Web Clipper, `/sweep` and "by hand" have no element note: they are a browser extension with one template, an agent command and a shell command.
- Capture class: `99 - Meta/Class/capture.md` (file_class capture, status inbox).
- The Shortcut is built, not tested end to end: see [[sb_inputs-elements-shortcut]]. The life of a capture: [[sb_inputs-elements-capture-lifecycle]].
