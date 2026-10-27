---
paras:
  - "[[create-a-feed]]"
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - design-doc|design-doc]]"
rate:
tags:
status: wip
maturity: distilled
created: 2026-10-26 18:00
---
# [[Feed and News Design]]

> [!abstract] One inbox for everything I receive, in three tiers by lifetime
> - Captures: posts and articles I pick; kept. They exist ([[HOWTO - Capture from the phone]]).
> - Stream: new items of the blogs, podcasts, channels and newsletters I follow; auto-imported, deleted after 30 days unless kept.
> - News: one note per story, grouped by interest, with a summary, the list of sources and a bias view; auto-imported, deleted after 30 days unless kept.
> - Keeping a stream item or a news source makes it a normal capture through `capture_import.py --url`.

> [!info] Why this shape
> - Publisher RSS gives the title and the lede, which is all I want, and it is meant to be pulled: no crawling of article pages.
> - SQLite holds the state (items, embeddings, story membership); notes are a rendered view. A story can be redrawn each time a new outlet covers it.
> - Expiry by default keeps the news an inbox, not an archive.

## Sources

All sources live in `99 - Meta/scripts/feeds/sources.yaml`: the news groups, the outlets and the follows.

- News: publisher RSS, one url per section, about 60 feeds of 33 outlets (Spain and global).
- Each outlet has a `lean` (left, centre-left, centre, centre-right, right, none) and a `lang`. Each feed has a hint of its usual groups.
- Follows: blogs, Substack and podcasts by RSS; YouTube by the channel feed (`/feeds/videos.xml?channel_id=`); the videos and shorts I save go to my watch-later playlist and become captures, like an X bookmark or a reel ([[HOWTO - Capture from the phone]]); newsletters through Kill the Newsletter (mail to RSS); X bookmarks through `x_bookmarks.py`.
- Saved lists: `saved_import.py` pulls X bookmarks (API), Instagram saves (the data export, no API) and Pinterest boards (board RSS) into the Captures queue ([[HOWTO - Import X bookmarks]], [[HOWTO - Import Instagram saves]], [[HOWTO - Import Pinterest pins]]). One post at a time stays on the share sheet.
- Optional breadth: the GDELT DOC 2.0 API (free, no key, titles and urls) to find stories and outlets outside my list.
- No commercial news API: the free tiers (NewsAPI.org, GNews, NewsData.io) give 100 to 200 calls a day and nothing that RSS does not give.
- Fetch with a browser-like User-Agent and conditional GET (`ETag`, `Last-Modified`). Use `certifi` for TLS: the system Python fails on Europa Press and the ECB.

## Pipeline

```
sources.yaml ─► fetch (conditional GET) ─► item {outlet, lean, lang, title, lede, url, published}
                                             │ dedupe by url
                                             ▼
                               SQLite  ~/.config/feeds/feeds.db
                                             │
      bge-m3 embedding (Ollama) ─► join an open story of the last 48 h (cosine ≥ τ) or start one
                                             │ new or changed stories only
                                             ▼
                   LLM batch: group · title · 2-3 bullet summary · framing per headline
                                             │
                      render ─► 06 - Inputs/News/   ·   purge > 30 days
```

- One script, `feeds_sync.py`, runs all steps: `fetch`, `cluster`, `enrich`, `render`, `purge`, `export`, or `sync` for all of them in that order. A failed enrich is only a warning: the notes and the pane still update.
- Clustering: `bge-m3` is multilingual, so "El BCE baja los tipos" and "ECB cuts rates" join one story. Its centroid moves with each new item.
- `τ = 0.72` (`FEEDS_TAU`). On titles, the same event in two languages scores 0.75-0.78 and a related but different event about 0.55. On the first 1,200 items, the pairs between 0.66 and 0.72 were mostly related but distinct events (polls versus campaign, election day versus result); the few true duplicates there go to the LLM merge question.
- A story stays open 24 h after its last item and never more than 36 h after its first. With a 48 h window only, a long event (an election) drifted from previews to the result to the market reaction in one story; the cap splits it by day.
- `skip_titles` in `sources.yaml` drops generic titles (live blogs, lottery results) before they are stored: a live blog changes its lede all day and joins any big story.
- First measure: about 400 items a day, about 30 stories a day with two outlets or more. A first sync takes about 2 minutes (embeddings); an incremental one about 7 seconds.
- Borderline pairs (cosine just under `τ`) go to the LLM as a yes/no merge question in the same batch.
- The follows skip clustering and enrichment: they are a queue in the same database.

## LLM backend

One interface, three providers, selected by `--llm` or `FEEDS_LLM` as `<provider>:<model>`. Default `claude:haiku`.

| Provider | Call | Cost |
| --- | --- | --- |
| `claude:haiku` | `claude -p --model haiku --tools "" --no-session-persistence --output-format json --json-schema <schema> --system-prompt <prompt>` | Claude subscription usage |
| `opencode:<model>` | `opencode run --standalone -m opencode-go/<model> --format json` | OpenCode Go subscription |
| `ollama:<model>` | HTTP `localhost:11434/api/chat` with `format: <schema>` | Free, local (`llama3.1:8b`) |

- `claude -p` uses the login of Claude Code, so the calls count against the subscription limits and no API key is needed. Tested on 2026-10-26: Haiku returned schema-valid JSON in about 5 s.
- The script unsets `ANTHROPIC_API_KEY` before it calls `claude`: with that variable set, the CLI bills the API instead of the subscription.
- `--system-prompt` replaces the default Claude Code prompt (about 9k tokens of overhead per call).
- Batch about 20 stories per call: fewer calls, less overhead, less pressure on the limits.
- A failed call falls back to the next provider of `FEEDS_LLM_FALLBACK` (default `opencode:glm-5.3-flash`). A story with no enrichment stays in the database and gets another try on the next run.
- The plugin passes `feeds.llm` and `feeds.fallback` of `99 - Meta/mise-en-place.jsonc` as `FEEDS_LLM` and `FEEDS_LLM_FALLBACK`.
- `claude` uses `--json-schema`, Ollama uses `format`; OpenCode has no schema mode, so the schema goes in the prompt. Every answer is validated against the schema before it is written.
- A story goes to the LLM when it has two outlets or more and its outlet count changed since the last enrichment. A merge drops the enrichment, so the merged story goes again on the next run.
- A pair just under `τ` is asked once (table `merge_checks`). `same: true` moves the items of the second story into the first.
- Embeddings stay local (`bge-m3`) for every provider.

Comparison on 2026-10-26, one batch of the same 20 stories (34k characters, 20 pairs), with Haiku as the reference:

| Provider | Time | Result |
| --- | --- | --- |
| `claude:haiku` | 70-110 s | Good Spanish titles and summaries, framing marks about 1 headline in 4, sensible merges. Default. |
| `opencode:glm-5.3-flash` | 215 s | Same group on 20 of 20, good Spanish, fewer framing marks, one merge more. Fallback. One run failed with `provider.no-route`, the retry worked. |
| `opencode:qwen3.8-flash` | > 600 s | Timeout. |
| `opencode:deepseek-v4.1-flash` | - | Exit 1. |
| `ollama:llama3.1:8b` | 266 s | Titles and summaries in English, same group on 13 of 20, no merges. Only as a last resort. |

- First real run: 77 stories in 4 batches, 388 s, 63 pairs asked, 9 merged; the second run enriched the 9 merged stories again. An incremental sync enriches about 10 stories in about 1 minute.
- One merge of the test joined an election preview and its result. The prompt now says that a preview and a result are different events.

> [!warning] Subscription limits are shared
> - The sync uses the same Claude limits as my interactive work. Keep batches large and enrich only new or changed stories.
> - When the limits are hit, the fallback provider takes over for that run.

## Bias

Three layers, because one headline is weak evidence.

- Outlet lean: from `sources.yaml`. Global outlets from the AllSides and Media Bias/Fact Check ratings; Spanish outlets from the audience self-placement of the Reuters Institute Digital News Report.
- Coverage mix: per story, the count of outlets by side as `L · C · R` (left and centre-left are L; centre-right and right are R; `none` is not counted).
- Blind spot: a story with three or more outlets and none from one side. Compare with the share each side has in `sources.yaml`, because the list has more left than right outlets.
- Headline framing: the LLM labels each headline `neutral`, `favourable` or `critical` towards the main actor, with a low-confidence marker. A hint, never the main signal.

## News notes

- Folder `06 - Inputs/News/`, ignored by git. Kept stories move to `06 - Inputs/News/_kept/`, which git tracks.
- One note per enriched story with two outlets or more. Stories with one outlet stay in the database and show only in the pane. The group `other` is never rendered.
- File name fixed at creation: `YYYY-MM-DD <first LLM title>`, cut at a word. The H1 links the file; the abstract callout carries the latest title and summary.
- `render` rewrites a note only while `status: inbox`. A note set to `done` (by hand or `y` in the pane) moves to `_kept/` on the next purge, and the script never writes it again.
- Purge: delete notes with `status: inbox` and `first_seen` older than 30 days, and the inbox notes of stories that no longer exist (merged or reclustered). Delete the database rows of the same age, except kept stories.
- Metadata: class `news` (`group`, `story_id`, `outlets`, `blindspot`, `first_seen`), type Resources, subtype `news`, approved on 2026-10-26. The L / C / R counts live in the body, the update time is the file time.
- Base `04 - Bases/final-bases/news.base`: Today, Inbox, Blind spots, Kept, Purge.

```markdown
# [[2026-10-26 El BCE baja los tipos al 2%]]
> [!abstract] El BCE baja los tipos al 2%
> - 2-3 bullets of summary

> [!warning] Blind spot: no outlet of the right covers this story

## Coverage · 4 L · 2 C · 0 R
- [L] elDiario.es · [headline](url)
- [C] Expansión · [headline](url) · framing: critical
```

## Views

Two panes of Mise-en-Place ([[The Workplace System]]), with the keys of the Captures pane.

- News (`<leader> F n`, built): one tab per group of `sources.yaml`; stories of the last 3 days by number of outlets, with the coverage mix and the blind-spot mark; the preview shows the summary and every source. `o` opens a source, `y` keeps the story, `c` makes one source a capture, `d` dismisses, `m` shows the stories with one outlet.
- Dismiss writes the story id to `~/.config/feeds/dismissed.json` and trashes the inbox note; `render` reads the file and never writes that note again.
- Stream (to build): grouped by follow. `y` makes the item a capture through `capture_import.py --url` (YouTube gets its transcript), `d` dismisses.
- The pane reads `~/.config/feeds/news.json`, written by `export` at the end of each sync, so the plugin does not need SQLite.

## Auto-import

- The Mise-en-Place plugin runs `feeds_sync.py sync` every 2 hours while Obsidian is open (config `feeds` in `99 - Meta/mise-en-place.jsonc`). `<leader> F s` or the command "Feeds: sync the news now" runs it on demand ([[The Workplace System]]).
- The log is `~/.config/feeds/logs/sync.log`; its time is the last run. A run missed while Obsidian was closed starts in the first five minutes after it opens.
- No launchd agent: Obsidian is open whenever I read the news, and the plugin keeps the job and its trigger in one place. The [[The Maintenance System]] spotlight can read the time of the log.
- The same script can move to a home server or a launchd agent later without changes.

## Build order

- Fetch, store and story clustering, terminal output only.
- LLM enrichment with the three providers.
- News notes, purge and the plugin sync ([[_I00033 Integration of the feed with Obsidian]]).
- The News pane ([[_I00046 News pane in Mise-en-Place]]).
- The follows: stream, Stream pane and keep as capture.

## References

- [[The Sources System]] · [[Input sources]] · [[_I00031 List of feeds to support]] · [[_I00032 Design of the feed]]
