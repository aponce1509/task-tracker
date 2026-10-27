---
paras:
  - "[[second-brain]]"
  - "[[create-a-feed]]"
type: "[[HowTos]]"
subtypes:
  - "[[Operational - HowTos - guide|guide]]"
rate:
tags:
status: wip
maturity: distilled
created: 2026-10-26 15:26
---
# [[HOWTO - Import Instagram saves]]

> [!abstract] Two paths: share one post now, or import the whole saved list from an export
> - One post or reel: the share sheet → `→ Vault` ([[HOWTO - Capture from the phone]]). This is the daily path.
> - The backlog: request the Instagram data export (JSON, only Saved), then `saved_import.py instagram <zip>` writes one capture note per saved post and reel.
> - Both end in `06 - Inputs/Captures/`, `platform: instagram`, `status: inbox`.

> [!info] Why an export
> - Instagram has no API for saved posts. The data export is the official way to get the list, and it carries no risk for the account.
> - A scraper with my login (gallery-dl, browser extensions) can read the saved list too, but Instagram blocks accounts that do it. Not worth it.
> - The export has only the links. The caption comes later, per post, through yt-dlp.

## Configure

The caption needs my Instagram login in a browser on the Mac, read by yt-dlp:

- Log in to instagram.com in Safari (or Chrome, Firefox).
- Add the browser to `~/.zshrc` and open a new terminal:

```bash
export CAPTURES_COOKIES_BROWSER=safari   # or chrome, firefox
```

- Safari only: give the terminal app Full Disk Access (System Settings → Privacy & Security), else yt-dlp cannot read the Safari cookies.
- Without the login, the note gets the page tags when Instagram shows them, and else only the link.

## Request the export

On the phone or on instagram.com:

- Profile → menu → Accounts Center → Your information and permissions → Export your information → Create export.
- Pick the Instagram profile → Export to device.
- Customize information: clear all, then select only Saved (under Your Instagram activity).
- Date range: All time. Format: JSON (not HTML). Media quality: Low.
- Start export. Instagram mails a link when it is ready, from minutes to a day. Download the zip to `~/Downloads/`; the link expires after some days.

The script reads every JSON file whose name contains `saved` (`saved_posts.json`, `saved_collections.json`), in the zip or in the unzipped folder, so a change of the folder layout does not break it.

## Test

- The export holds links, without writing:

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" instagram ~/Downloads/<export>.zip --max 3 --dry-run
```

- Expected: three `+ 06 - Inputs/Captures/… .md` lines and `instagram: 3 new · … (dry run)`. `no saved post links found` means the export is HTML or Saved was not selected.
- With the login, the dry-run titles are `@handle - first words of the caption`. A title `Instagram - <code>` means yt-dlp got no caption: check `CAPTURES_COOKIES_BROWSER` and the login.
- The real import of the same three:

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" instagram ~/Downloads/<export>.zip --max 3 --no-ai
```

- Check in the vault: three notes in `06 - Inputs/Captures/`, `platform: instagram`, with the caption and the image. `<leader> c`, `f` on the instagram chip.
- Run the same command again. Expected: `0 new · … 3 seen before`.
- A reel shared from the phone before is skipped as `already in the vault`: the share and the export use the same link form.

## Use

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" instagram ~/Downloads/<export>.zip            # all of it
uv run --script "99 - Meta/scripts/feeds/saved_import.py" instagram ~/Downloads/<export>.zip --max 50   # in batches
```

- Import a large backlog in batches of about 50: each post is one yt-dlp call with my login, and many calls in a row can trigger a check from Instagram. `--max` takes the first N not seen before, so the next run continues where the last one stopped.
- A new export holds the old saves too; the seen file skips them, so I can request a fresh export every few months and import only the new ones.
- Day to day, the share sheet is faster than an export.
- After the import, unsave the posts on Instagram if I want the saved list to be only what is not in the vault yet.

## References

- [[HOWTO - Capture from the phone]] · [[HOWTO - Import X bookmarks]] · [[HOWTO - Import Pinterest pins]] · [[Feed and News Design]]
