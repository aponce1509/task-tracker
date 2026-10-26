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
> - `capture_import.py` turns both into capture notes in `06 - Inputs/Captures/`, with `status: inbox`.
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

## The import

```bash
uv run --script "99 - Meta/scripts/feeds/capture_import.py"            # drop folder and Apple Notes
uv run --script "99 - Meta/scripts/feeds/capture_import.py" --dry-run
uv run --script "99 - Meta/scripts/feeds/capture_import.py" --url <link> --note "why"
```

- YouTube: title, channel, date, duration, the description and the transcript in collapsed callouts. `--no-transcript` skips it.
- X: the post text, the quoted post and the images, through `api.fxtwitter.com`, with no login.
- Instagram: the caption through yt-dlp when `CAPTURES_COOKIES_BROWSER` names the browser with my Instagram login; else the page tags; else only the link.
- Web: title, author or site, description.
- A url already in the vault is skipped. A capture that fails stays in the drop folder for the next run.
- When YouTube breaks, run it once with `uv run --upgrade --script ...` to update yt-dlp.

## Consume

`<leader> c` opens the Captures pane of Mise-en-Place: the queue on the left (`status: inbox`, newest first), the note rendered on the right. `?` shows the keys.

- `j` / `k` move, `Enter` opens the note, `o` opens the url.
- `p` links or unlinks a PAR, `t` sets type and subtype in one pick, `#` toggles one of the four tags, `1`-`5` rate.
- `y` keeps it: `status: done`, it stays in `06 - Inputs/Captures/`. `m` moves it, the folder of a linked PAR first. `d` deletes it to `.trash/`.
- `f` filters by platform, `i` runs the import.

## References

- [[The Sources System]] · [[Capturing - CODE]] · [[WORKFLOWS - Bi-Monthly Inbox Sweep]]
