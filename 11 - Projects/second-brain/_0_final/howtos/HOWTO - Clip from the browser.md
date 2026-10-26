---
paras:
  - "[[second-brain]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - guide|guide]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-26 12:00
---
# [[HOWTO - Clip from the browser]]

> [!abstract] Full articles from the desktop browser
> - Obsidian Web Clipper saves the page I read as Markdown, with its full text or only my highlights.
> - The template `Capture` writes the same capture note as the phone importer: `06 - Inputs/Captures/`, `status: inbox`, `platform: web`.
> - From there the note follows the same queue, triage and review as any capture.

> [!info] Clipper or importer
> - Phone, video and social posts go through the share Shortcut and the importer ([[HOWTO - Capture from the phone]]). It gets transcripts and captions, and it skips known urls.
> - A desktop article that I want to read or distill goes through the Clipper. The importer keeps only the title and description of a web page.

> [!warning] No dedup
> - The Clipper does not check the vault for the url. A page shared from the phone and clipped on the desktop gives two notes. The inbox sweep catches them.

## Setup

- Install Obsidian Web Clipper in the browser. In Settings, General, add the vault `new_second_brain`.
- Settings, Templates, Import: `99 - Meta/Templates/Web Clipper - Capture.json`. Make `Capture` the default template.
- Settings, Highlighter: when the page has highlights, keep only the highlights in the content.
- Leave the Interpreter off. `inbox_ai.py` proposes type, subtypes and paras on the Mac.

## Clip

- Optional: highlight the passages that matter.
- Open the Clipper, write the Why as the first bullet of the abstract callout, then Add to Obsidian.
- For a paper, change the subtype to `paper` in the Captures pane (`t`).

## References

- [[The Sources System]] · [[HOWTO - Capture from the phone]] · [[WORKFLOWS - Bi-Monthly Inbox Sweep]]
