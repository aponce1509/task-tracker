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
# [[sb_inputs-elements-importer]]

> [!abstract]
> The importer is `capture_import.py`, the element of [[sb_inputs-elements]] that turns the drop and the notes into capture notes. This diagram shows its modules in one pass.
> - Left to right: sources, then `normalize`, the dedupe against `known_urls`, `build`, `render` and `write`.
> - The dedupe runs before any fetch: a link already in the vault costs no network call.
> - Only the adapters and `page_meta` call outside services (external nodes).
> - Cleanup: a duplicate is cleaned at once, a new capture after its note is written; a failed one stays in its source.
> - Last, its function `local_ai` hands the queue to the enricher ([[sb_inputs-elements-enricher]]); it never fails the import.

```pele
flowchart LR
  subgraph src[Sources]
    cli[--url<br/>CLI]
    drop[from_drop<br/>.json and .txt]
    notes[from_notes<br/>JXA and NoteHTML]
  end
  icloud[(external: iCloud drop<br/>Captures/)]
  apple[(external: Apple Notes<br/>Vault)]
  icloud --> drop
  apple --> notes

  subgraph imp[capture_import.py]
    cap[Capture records]
    norm[normalize<br/>one spelling per url]
    known{known_urls<br/>url in the vault?}
    build[build<br/>platform_of]
    yt[youtube]
    xp[x_post]
    ig[instagram]:::wip
    wb[web]
    th[thought<br/>no url]
    pm[page_meta<br/>Open Graph]
    tr[transcript<br/>json3, 1 per minute]
    rend[render<br/>frontmatter, abstract, no_tags]
    wr[write<br/>unique file name]
    la[local_ai<br/>budget from ai.toml]
  end

  ytdlp[external: yt-dlp]
  fx[external: api.fxtwitter.com]
  site[external: web pages]
  enricher[enricher<br/>capture_ai.py]
  out[(06 - Inputs/Captures/<br/>capture note)]
  done[_done/<br/>Vault - Imported]

  cli --> cap
  drop --> cap
  notes --> cap
  cap --> norm --> known
  known -->|new| build
  known -->|no url, thought| build
  known -->|dup| done
  build --> yt & xp & ig & wb & th
  yt --> ytdlp
  yt --> tr
  xp --> fx
  ig -->|cookies| ytdlp
  ig -->|fallback| pm
  wb --> pm
  pm --> site
  yt & xp & ig & wb & th --> rend
  rend ==> wr ==> out
  wr -.->|after a successful run| done
  wr -.->|after the cleanup| la
  la -.->|non-dry run, unless --no-ai; skipped when Ollama is down| enricher
  enricher -.->|works on the queue| out

  click out "sb_inputs-elements-capture"
  click enricher "sb_inputs-elements-enricher"
```

## Details

- Path: `99 - Meta/scripts/feeds/capture_import.py`, a `uv` script with `yt-dlp` as its only dependency.
- Run: `uv run --script "99 - Meta/scripts/feeds/capture_import.py" [--dry-run] [--only drop|notes] [--url X --note Y] [--no-transcript] [--no-ai] [--ai-budget S]`.
- Env: `CAPTURES_DROP` (drop folder), `CAPTURES_NOTES_FOLDER` (Apple Notes folder), `CAPTURES_COOKIES_BROWSER` (safari, chrome or firefox; yt-dlp reuses its login for Instagram).
- A `.txt` drop file holds free text: its first URL is the link, the rest is the note (the Why). A `.json` file holds `url`, `note` and `created`.
- A thought has no url, so it skips the dedupe and goes straight to `build`.
- `Capture` record: `url`, `note` (the Why), `created`, `origin` (drop, notes or cli) and `ref` (source file or Apple Note id).
- `NoteHTML` converts the HTML of an Apple Note to Markdown.
- `from_drop` triggers the iCloud download of placeholder files before it reads them.
- `normalize`: `youtu.be` and shorts become `watch?v=`, `twitter.com` becomes `x.com`, tracking params are dropped.
- `known_urls` is every `url:` property in the vault, so the dedupe covers all notes, not only captures.
- `render` writes the frontmatter of the capture class (status inbox), the abstract callout with the Why, and `no_tags` escapes hashtags except the four canonical tags.
- Cleanup: a drop file moves to `_done/` and an Apple Note moves to `Vault - Imported` (JXA). A duplicate is cleaned the same way; a failed capture is not.
- Limits: the Instagram adapter has only its fallback tested (Open Graph, else the bare link). The handoff to the enricher is not tested on the real queue yet. A `--dry-run` writes and moves nothing.
- When YouTube breaks, update `yt-dlp` with `uv run --upgrade`.
- `local_ai(budget)` is the importer function that runs last, after the cleanup, on a non-dry run without `--no-ai`: it calls `capture_ai.py` on the inbox queue with the `budget` of the `captures` pipeline in `99 - Meta/scripts/ai/ai.toml` (400 s; `--ai-budget` overrides it). When Ollama is down it prints "local AI skipped"; the import result stays the same.
- Exit code 1 when at least one capture failed.
- The Mise-en-Place pane and `/sweep` call this script; the output note is described in [[sb_inputs-elements-capture]].
