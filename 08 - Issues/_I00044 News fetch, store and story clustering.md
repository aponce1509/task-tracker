---
file_class: issue
paras:
  - "[[create-a-feed]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role: core
priority: 1
rate:
tags:
status: wip
maturity: capture
created: 2026-10-26 11:42
dueDate:
dependencies:
  - "[[_I00032 Design of the feed]]"
---
# [[_I00044 News fetch, store and story clustering]]
> [!abstract]
> - Pull the news feeds of `sources.yaml`, store the items in SQLite and group the items of the same event into one story.
> - Clustering quality decides the value of every later step, so it gets tuned on real data before any LLM or note.

## Description

First step of the news pipeline in [[Feed and News Design]]. `feeds_sync.py` reads `99 - Meta/scripts/feeds/sources.yaml`, fetches the RSS feeds, stores title, lede, url, outlet, lean and date in `~/.config/feeds/feeds.db`, and joins items into stories with `bge-m3` embeddings from Ollama. Done means `feeds_sync.py fetch` and `cluster` run without errors, and `feeds_sync.py stories --since 24h` prints stories whose members are really the same event, in Spanish and in English.

## Tasks

- [x] Script skeleton `99 - Meta/scripts/feeds/feeds_sync.py`
  - `uv run --script`, the style of `capture_import.py`; deps `feedparser`, `certifi`, `pyyaml`
  - Subcommands `fetch`, `cluster`, `stories`, later `sync`
- [x] Fetch with conditional GET
  - Store `ETag` and `Last-Modified` per feed; browser-like User-Agent; `certifi` for TLS
  - Strip HTML from the lede; skip `enabled: false` outlets
- [x] SQLite schema: feeds, items, stories (each item holds its story_id)
  - Dedupe by canonical url (drop `utm_*` and fragments)
- [x] Embeddings with `bge-m3` through `localhost:11434/api/embed`
  - Text: title + lede
- [x] Online clustering
  - Join the closest open story of the last 48 h when cosine ≥ τ, else start a story; update the centroid
  - Keep pairs just under τ as merge candidates for [[_I00045 LLM enrichment of the news with a switchable backend]]
- [ ] Tune τ on three or four days of data
  - Check a sample by hand: merged events, split events, cross-language joins
  - Write the chosen τ and the reason in [[Feed and News Design]]
  - First pass on 2026-10-26: τ 0.72, story span 24 h since the last item and 36 h since the first, `skip_titles` for live blogs
- [ ] Fix the outlets with no working feed (Público, La Razón, elEconomista, RTVE) and add right-leaning global outlets

## Post-Mortem

- We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
- Objective moved:
- Good things:
- Bad Things:
- Rate (1-3):
- Notes to create?
	- Ending note: core note/index that builds the final solution
	- Reusable in other places
	- Tech debt
	- Review of the resources & tools used
	- Additional requirements
	- Ideas