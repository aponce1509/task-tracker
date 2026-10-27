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
# [[HOWTO - Import Pinterest pins]]

> [!abstract] Pin to a public board, pull the board feed into the Captures queue
> - Every public Pinterest board has an RSS feed: `https://www.pinterest.com/<user>/<board>.rss`, with its newest 25 pins.
> - The boards I want in the vault go in `saved.pinterest` of `99 - Meta/scripts/feeds/sources.yaml`.
> - `saved_import.py pinterest` writes one capture note per new pin: the pin text, the image, the board, the date and the source link. `platform: pinterest`, `status: inbox`.

> [!info] Why RSS and not the share sheet
> - A pin page renders with JavaScript: the share sheet gives a link whose page has no title and no text, so the capture would be empty.
> - The board feed carries the text and the image, needs no login and no app, and was tested on 2026-10-26.
> - The feed gives only the newest 25 pins of a board: run the import more often than I pin 25 things to one board.
> - Secret boards have no feed. The Pinterest API (v5) can read them, but it needs a developer app with review. Not built.

## Configure

- Make one public board for the vault, for example `To vault`, or use the public boards I already have. A pin saved to a secret board never reaches the vault.
- Open the board in the browser and copy its url: `https://www.pinterest.com/<user>/<board>/`.
- Add it to `sources.yaml`:

```yaml
saved:
  pinterest:
    - https://www.pinterest.com/<user>/to-vault/
```

- The url may end in `/` or in `.rss`; the script adds `.rss` when it is missing.

## Test

- The feed answers. Open `https://www.pinterest.com/<user>/<board>.rss` in the browser, or:

```bash
curl -s -A "Mozilla/5.0" "https://www.pinterest.com/<user>/<board>.rss" | head -c 500
```

- Expected: XML that starts with `<rss`. An HTML page or a 404 means the board is secret or the url is wrong.
- The import, without writing:

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" pinterest --dry-run
```

- Expected: one `+ 06 - Inputs/Captures/Pin - ….md` line per pin and `pinterest: N new · … (dry run)`. `no boards` means `saved.pinterest` is empty.
- To test without touching `sources.yaml`, use a public board of Pinterest itself:

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" pinterest --board https://www.pinterest.com/pinterest/official-news/ --dry-run
```

- The real import, once the dry run looks right:

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" pinterest --no-ai
```

- Check in the vault: the notes in `06 - Inputs/Captures/`, `platform: pinterest`, with `Board:`, `Pinned` and `Source:` in the abstract and the image below the text. In the Captures pane, Pinterest is under the "other" chip.
- Run it again. Expected: `0 new · … N seen before`.
- Pin something new to the board, wait a few minutes (the feed is cached) and run it again. Expected: `1 new`.

## Use

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" pinterest
```

- The first run imports up to 25 pins per board, old ones too. I delete the ones I do not want with `d` in the Captures pane; they never come back.
- Without `--no-ai`, `capture_ai.py` runs on the queue after the import.
- A board with mostly images and no text gives thin notes: the `## Annotations` section is where I write why I kept it.

## References

- [[HOWTO - Capture from the phone]] · [[HOWTO - Import X bookmarks]] · [[HOWTO - Import Instagram saves]] · [[Feed and News Design]]
