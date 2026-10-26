---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - features|features]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-26 07:51
---
# [[sb_inputs-features]]

> [!abstract] What the capture pipeline does
> - The features of [[sb_inputs]], in four columns: Capture (how something reaches the drop, the notes or the vault), Import (what the importer does with it), Enrich (what a local AI pass adds to the capture) and Consume (how I clear the queue). The Enrich column runs local models on the Mac, so no capture leaves it, and it is wip. The parts that do the work are in [[sb_inputs-elements]].
> - Read the columns left to right: I share, the importer writes a capture, I decide. The diagram has no lines: a node is a feature, not a step.
> - Colors: inbox (dashed) is not built yet, wip (yellow) is built and not fully tested, done (green) works.
> - Look at three nodes: sharing from the phone is wip because the shortcut is built but no share has reached the drop yet ([[sb_inputs-elements-shortcut]]), and the Instagram post is wip because only the link-only fallback is tested. Clipping a page is wip because the Web Clipper template has not clipped a page yet. The Web Clipper has no element note: it is a browser extension with one template, described in [[sb_inputs-elements]].
> - Import features link to [[sb_inputs-elements-importer]]. Enrich features link to [[sb_inputs-elements-enricher]]. Consume features link to [[sb_inputs-elements-pane]], and the base views link to [[sb_inputs-elements-capture]].

```pele
flowchart LR
  subgraph capture[Capture]
    direction TB
    share[Share a link from any phone app with a why]:::wip
    thought[Write a thought in Apple Notes]:::done
    clip[Clip a full page or its highlights from the Mac browser]:::wip
    cli[Capture one link from the terminal with a why]:::done
  end
  subgraph import[Import]
    direction TB
    yt[YouTube video with transcript]:::done
    x[X post without login]:::done
    ig[Instagram post, best effort]:::wip
    web[Web page]:::done
    spark[Apple Notes thought as a spark]:::done
    dedupe[Skip a url already in the vault]:::done
    tags[Escape hashtags]:::done
    retry[Failed capture stays for the next run]:::done
    run[Run from the pane, /sweep or a terminal]:::done
  end
  subgraph enrich[Enrich]
    direction TB
    form[Type and subtype of a web page: article, paper, documentation, tool or bookmark]:::wip
    pasted[Thought or pasted material, for a capture without a link]:::wip
    author[Author of a post, page or pasted material without one, and the title of pasted material]:::wip
    summary[Summary of the content in the abstract callout]:::wip
    paras[PAR only from a clear vote of close notes]:::wip
    groups[Queue in topic groups, each with its likely PAR, a report that writes nothing]:::wip
  end
  subgraph consume[Consume]
    direction TB
    queue[Queue with platform filter and preview]:::done
    set[Set paras, type, tags and rate]:::done
    decide[Keep, move or delete]:::done
    views[Base views Queue, By author, All captures]:::done
  end
  click share "sb_inputs-elements-shortcut"
  click thought "sb_inputs-elements-importer"
  click clip "sb_inputs-elements"
  click cli "sb_inputs-elements-importer"
  click yt "sb_inputs-elements-importer"
  click x "sb_inputs-elements-importer"
  click ig "sb_inputs-elements-importer"
  click web "sb_inputs-elements-importer"
  click spark "sb_inputs-elements-importer"
  click dedupe "sb_inputs-elements-importer"
  click tags "sb_inputs-elements-importer"
  click retry "sb_inputs-elements-importer"
  click run "sb_inputs-elements-importer"
  click summary "sb_inputs-elements-enricher"
  click form "sb_inputs-elements-enricher"
  click pasted "sb_inputs-elements-enricher"
  click author "sb_inputs-elements-enricher"
  click paras "sb_inputs-elements-enricher"
  click groups "sb_inputs-elements-enricher"
  click queue "sb_inputs-elements-pane"
  click set "sb_inputs-elements-pane"
  click decide "sb_inputs-elements-pane"
  click views "sb_inputs-elements-capture"
```

## Details

- A feature is something I can do, not a part; the parts are in [[sb_inputs-elements]].
- Share from the phone: the shortcut "→ Vault" saves one JSON file per share (`url`, `note`, `created`) in the drop, the iCloud folder `Captures/`. It is built but not tested end to end, so the node is wip.
- Thought in Apple Notes: it goes in the notes folder `Vault`. The importer reads it, so the node links to [[sb_inputs-elements-importer]].
- Clip from the Mac: Obsidian Web Clipper writes the capture directly, with the full text or only the highlights ([[HOWTO - Clip from the browser]]). It does not go through the importer, so no dedupe.
- Importer: `99 - Meta/scripts/feeds/capture_import.py`. Drop files move to `_done/`, imported Apple Notes move to `Vault - Imported`.
- YouTube uses yt-dlp, with the transcript. X uses api.fxtwitter.com, no login. A web page uses Open Graph tags.
- Instagram uses yt-dlp with browser cookies, else page tags, else the bare link. Captions need `CAPTURES_COOKIES_BROWSER`. Only the link-only fallback is tested, so the node is wip.
- Dedupe is on the `url` property of the capture. Non-canonical #hashtags are escaped so they do not create tags.
- A capture is written to `06 - Inputs/Captures/` with file_class capture and status inbox. The importer runs from the Import button of the pane, from `/sweep` or from a terminal.
- Capture from the terminal: `uv run --script "99 - Meta/scripts/feeds/capture_import.py" --url <link> --note "why"` imports one link, with the dedupe.
- Enrich: `99 - Meta/scripts/feeds/capture_ai.py`, called by the importer after every import (`--no-ai` skips it). Each task has its model in `99 - Meta/scripts/ai/ai.toml`, all local through Ollama: `d3:4b` (decision) for the type and subtype, `qwen3.5:9b` (chat) for the source, `qwen3.5:4b` (chat) for the summary, `qwen3-embedding:0.6b` (embeddings) for the paras and the groups. The groups are a report (`capture_ai.py --groups`) and write nothing. It is built and tested on copies of captures only, so the nodes are wip ([[sb_inputs-elements-enricher]]).
- The enricher fills only empty fields and never touches `## Annotations`. It writes a PAR only when at least 80% of the vote of the close notes agrees (cosine similarity >= 0.55, at least 2 voters); else the PAR stays my call. A budget of 400 s per run leaves the rest for the next run.
- Consume: the pane opens with `<leader> c`. Keep sets status done, move puts the capture in a folder (PAR folder first), delete sends it to the trash. The base is `captures.base`.
