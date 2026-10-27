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
# [[HOWTO - Import X bookmarks]]

> [!abstract] Bookmark on X, pull the list into the Captures queue
> - `saved_import.py x` reads my bookmarks through the X API and writes one capture note per post in `06 - Inputs/Captures/`, `platform: x`, `status: inbox`.
> - Each post goes through the same adapter as a share (`api.fxtwitter.com`: text, quoted post, images). When that fails, the note keeps the text the API returned.
> - A post I import or delete never comes back: the script keeps the ids in `~/.config/feeds/saved_seen.json`.

> [!info] Why the API and not the share sheet
> - X has no export of bookmarks. The share sheet works for one post ([[HOWTO - Capture from the phone]]); the API is the only bulk path.
> - The API is pay-per-use since 2026: I buy credits in the Developer Console and each bookmark read costs a fraction of a cent. Check the real price in the console before the first run of `--max 0`.
> - The API gives about the latest 800 bookmarks, newest first. Older ones are out of reach.

## Configure

Once, on the desktop:

- Open the X Developer Console (from `developer.x.com`) with my X account and accept the developer terms.
- Create a project and an app in it.
- In the app, open User authentication settings:
	- App permissions: Read.
	- Type of app: Native App (public client, no secret). A Web App also works, then I need its client secret too.
	- Callback URI: `http://127.0.0.1:8765/callback`.
	- Website URL: any url of mine, it is required but not used.
- Copy the OAuth 2.0 Client ID (and the Client Secret for a Web App).
- Buy a small amount of credits in the console. Without credits the API refuses every call.
- Add the id to `~/.zshrc` and open a new terminal:

```bash
export X_CLIENT_ID="..."
export X_CLIENT_SECRET="..."   # only for a Web App
```

- Log in once. The browser opens, I approve, and the token goes to `~/.config/feeds/x_token.json` (outside the vault, mode 600). It refreshes itself with `offline.access`.

```bash
python3 "99 - Meta/scripts/feeds/x_bookmarks.py" auth
```

## Test

Each step must pass before the next one.

- The token works and the API answers:

```bash
python3 "99 - Meta/scripts/feeds/x_bookmarks.py" list --max 3 --format lines
```

- Expected: three lines, my three newest bookmarks. HTTP 401 means the token is bad (run `auth` again); another HTTP error names the cause in its detail, usually no credits or a missing scope.
- The import, without writing:

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" x --max 3 --dry-run
```

- Expected: three `+ 06 - Inputs/Captures/@handle - ….md` lines and `x: 3 new · … (dry run)`. Nothing changes in the vault.
- The real import of the same three:

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" x --max 3 --no-ai
```

- Check in the vault: three notes in `06 - Inputs/Captures/`, `platform: x`, with the post text and its images. `<leader> c`, then `f` on the x chip, shows them in the queue.
- Run the same command again. Expected: `0 new · … 3 seen before`. The dedupe works.
- Delete one of the three with `d` in the Captures pane and run it again. Expected: it does not come back.
- `uv run --script "99 - Meta/scripts/feeds/saved_import.py" seen` shows `x: 3`.

## Use

```bash
uv run --script "99 - Meta/scripts/feeds/saved_import.py" x                      # the 50 newest
uv run --script "99 - Meta/scripts/feeds/saved_import.py" x --since 2026-10-01   # posts since a date
uv run --script "99 - Meta/scripts/feeds/saved_import.py" x --max 0              # every bookmark the API gives
uv run --script "99 - Meta/scripts/feeds/saved_import.py" x --folder <id>        # one folder (x_bookmarks.py folders)
```

- Without `--no-ai`, `capture_ai.py` runs on the queue after the import, the same as for phone captures.
- The `feeds` MCP server (`x_bookmarks`, `x_bookmark_folders`) uses the same token, so agents can read the bookmarks too.
- Folders are a Premium feature of X; without Premium, `folders` returns an empty list.

## References

- [[HOWTO - Capture from the phone]] · [[HOWTO - Import Instagram saves]] · [[HOWTO - Import Pinterest pins]] · [[Feed and News Design]]
