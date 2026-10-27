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
# [[HOWTO - Capture from the phone]]

> [!abstract] Share on the phone, import on the Mac
> - The iPhone Shortcut "→ Vault" saves each share as one JSON file in `iCloud Drive/Captures/`.
> - Thoughts go to the Apple Notes folder `Vault`.
> - Videos I save on YouTube go to my private watch-later playlist `WatchList`; shorts I save go to Saved Shorts.
> - `capture_import.py` turns the three into capture notes in `06 - Inputs/Captures/`, with `status: inbox`.
> - `capture_ai.py` then runs local models on the queue: the type and subtype, the source, the summary and the paras.
> - The `captures.base` Queue view is the consumption queue.

> [!info] Why a file per share
> - One small file per share never syncs half-written, and the importer moves it to `_done/` once it is a note.
> - YouTube, X, Instagram and Safari all share a URL, so one Shortcut serves every app.

## The Shortcut

Create it once in the Shortcuts app on the iPhone:

- New shortcut, named `→ Vault`. In its details, turn on Show in Share Sheet. Receive: URLs, Text, Safari web pages. If there is no input: Ask For Text, so the shortcut also takes a quick thought from the home screen.
- Ask for Input: Text, prompt `Why?`. It may stay empty.
- Dictionary with three keys:
	- `url`: Shortcut Input.
	- `note`: Provided Input.
	- `created`: Current Date, date format ISO 8601.
- Set Name of the Dictionary: `capture-` + Current Date in the custom format `yyyyMMdd-HHmmss` + `.json`.
- Save File: Ask Where to Save off, destination `iCloud Drive/Captures`, Overwrite off.
- Optional: Show Notification `Saved`.

When the Save File action only offers the Shortcuts folder, the files land in `iCloud Drive/Shortcuts/Captures`. Then set `CAPTURES_DROP` to `~/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/Captures`.

## Apple Notes

- Thoughts go to the folder `Vault`. A note becomes a spark (type Ideas); a note that is mainly a link becomes a capture of that link, and its text becomes the Why.
- Imported notes move to `Vault - Imported`; nothing is deleted.

## The YouTube playlist

- The importer reads two private playlists with yt-dlp and the Firefox login (`CAPTURES_COOKIES_BROWSER`, default `firefox`): `PLaDiM_R1BMLA` (watch later) and `YS` (Saved Shorts, the Save button of the Shorts player). `CAPTURES_YT_PLAYLISTS` changes the comma list.
- Each video or short becomes a capture once. Its url goes to `~/.config/feeds/youtube_done.json`, so a deleted capture is not imported again. The video stays in the playlist.
- The channels I follow stay in the stream ([[Feed and News Design]]); only the videos I save become captures.

## The import

```bash
uv run --script "99 - Meta/scripts/feeds/capture_import.py"            # drop folder, Apple Notes and the YouTube playlist
uv run --script "99 - Meta/scripts/feeds/capture_import.py" --dry-run
uv run --script "99 - Meta/scripts/feeds/capture_import.py" --url <link> --note "why"
```

- YouTube: title, channel, date, duration, the description and the transcript in collapsed callouts. `--no-transcript` skips it.
- X: the post text, the quoted post and the images, through `api.fxtwitter.com`, with no login.
- Instagram: the caption through yt-dlp with the login of `CAPTURES_COOKIES_BROWSER`; else the page tags; else only the link.
- Web: title, author or site, description. For the full text, clip the page on the desktop ([[HOWTO - Clip from the browser]]).
- A url already in the vault is skipped. A capture that fails stays in the drop folder for the next run.
- When YouTube breaks, run it once with `uv run --upgrade --script ...` to update yt-dlp.

## Local AI

After the import, `capture_ai.py` runs the `captures` pipeline of `99 - Meta/scripts/ai/ai.toml` on the queue. All its models are local, through Ollama, so no capture leaves the Mac. Each task goes to the kind of model that is best at it:

- Form (decision model, d3): the type and subtype. The platform decides them for YouTube (video), X and Instagram (post). The model picks only for a web page (article, paper, documentation, tool or bookmark) and for a capture without a link (my thought, or pasted material such as a paper).
- Source (chat model, Qwen 9B): the author of a capture that has none, and the title of pasted material. A name that matches a note links to that note. My own thoughts get no source. A capture is renamed only when nothing links to it.
- Summary (chat model, Qwen 4B): 2 to 4 bullets in the abstract callout from the transcript, the post, the page or the pasted text. My `Why:` stays first. Under 600 characters of material, the page description stays.
- Paras (embeddings): a kNN vote of the typed notes closest to the capture. It writes the PAR only when at least two close notes vote and 80% of the vote agrees. Otherwise `p` in the queue stays my call.
- Groups (embeddings, report only): `--groups` prints the queue in topic groups, each with the PAR its nearest notes point to, so I review similar captures together.

It fills only empty fields, changes type and subtype only while they are the importer's default, and never touches `## Annotations`. The original of each changed capture stays in `99 - Meta/scripts/feeds/.cache/backup/`.

```bash
ollama pull qwen3.5:9b && ollama pull qwen3.5:4b && ollama pull d3:4b && ollama pull qwen3-embedding:0.6b   # once
python3 "99 - Meta/scripts/feeds/capture_ai.py"                       # the queue, alone
python3 "99 - Meta/scripts/feeds/capture_ai.py" <capture> --dry-run
python3 "99 - Meta/scripts/feeds/capture_ai.py" --tasks form,paras    # only some tasks
python3 "99 - Meta/scripts/feeds/capture_ai.py" --groups              # the queue in topic groups
python3 "99 - Meta/scripts/feeds/capture_ai.py" --eval                # accuracy of the paras vote
```

- The import gives it the `budget` of the pipeline, 400 seconds (`--ai-budget`); the captures left wait for the next run. `--no-ai` skips it. When Ollama is not running, the import works and says so.
- Ollama keeps only one model in memory at a time: the AI layer unloads the others before it loads a model.
- `ai.toml` holds the connectors (Ollama, Claude Code, OpenCode Go), the models with their role (chat, embed or decision), the tasks with their model and fallbacks, and the pipelines. To change the model of a task, edit it there; for one run, `AI_TASK_SUMMARY=qwen-small`.

## Consume

`<leader> c` opens the Captures pane of Mise-en-Place: the queue on the left (`status: inbox`, newest first), the note rendered on the right. `?` shows the keys.

- `j` / `k` move, `Enter` opens the note, `o` opens the url.
- `p` links or unlinks a PAR, `t` sets type and subtype in one pick, `#` toggles one of the four tags, `1`-`5` rate.
- `y` keeps it: `status: done`, it stays in `06 - Inputs/Captures/`. `m` moves it, the folder of a linked PAR first. `d` deletes it to `.trash/`.
- `f` filters by platform, `i` runs the import.

## References

- [[The Sources System]] · [[HOWTO - Clip from the browser]] · [[HOWTO - Import X bookmarks]] · [[HOWTO - Import Instagram saves]] · [[HOWTO - Import Pinterest pins]] · [[Capturing - CODE]] · [[WORKFLOWS - Bi-Monthly Inbox Sweep]]
