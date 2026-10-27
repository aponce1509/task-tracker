# /// script
# requires-python = ">=3.11"
# dependencies = ["yt-dlp", "pyyaml"]
# ///
"""saved_import.py - turn what I save on X, Instagram and Pinterest into capture notes.

The bulk path next to the share sheet: capture_import.py imports one share at a
time, this script pulls the saved lists and writes the same capture notes in
06 - Inputs/Captures/ (status inbox), through the writer of capture_import.py.

Sources:
  x          X bookmarks through the X API (x_bookmarks.py, token from
             `x_bookmarks.py auth`). Each post through api.fxtwitter.com, like a
             share; when that fails, the text the API returned.
  instagram  the "Export your information" download of Instagram (JSON): every
             post and reel link in its saved files (saved_posts, collections).
             Pass the zip or the unzipped folder. There is no API for saves.
  pinterest  the RSS feed of each board in `saved.pinterest` of sources.yaml
             (or --board). Public boards only, the newest ~25 pins of each.
             Pin pages render with JavaScript, so the note comes from the feed.

A link already in the vault is skipped. Every imported or skipped item goes to
$FEEDS_HOME/saved_seen.json (default ~/.config/feeds), so a capture I delete
never comes back. A failed item is not marked and gets another try next run.

Run:
    uv run --script "99 - Meta/scripts/feeds/saved_import.py" x --max 20 --dry-run
    uv run --script "99 - Meta/scripts/feeds/saved_import.py" x --since 2026-10-01
    uv run --script "99 - Meta/scripts/feeds/saved_import.py" instagram ~/Downloads/instagram-export.zip --max 5
    uv run --script "99 - Meta/scripts/feeds/saved_import.py" pinterest
    uv run --script "99 - Meta/scripts/feeds/saved_import.py" pinterest --board https://www.pinterest.com/<user>/<board>/
    uv run --script "99 - Meta/scripts/feeds/saved_import.py" seen          # counts of the seen file
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Callable

import yaml

import capture_import as ci
import x_bookmarks as xb

SOURCES = Path(__file__).resolve().parent / "sources.yaml"
IG_LINK = re.compile(r"https?://(?:www\.)?instagram\.com/(?:[\w.]+/)?(?:p|reel|reels|tv)/[\w-]+/?")


def seen_path() -> Path:
    return xb.feeds_home() / "saved_seen.json"


def load_seen() -> dict[str, list[str]]:
    try:
        return json.loads(seen_path().read_text())
    except (OSError, ValueError):
        return {}


def save_seen(seen: dict[str, list[str]]) -> None:
    path = seen_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(seen, indent=1))


# Sources: each yields (id, url, builder); the builder returns the Note to write.


def from_x(args) -> list[tuple[str, str, Callable[[], ci.Note]]]:
    items = xb.fetch_bookmarks(limit=args.max, since=args.since, folder=args.folder)

    def builder(item):
        def build():
            try:
                return ci.x_post(item["url"])
            except ci.CaptureError:
                handle = "@" + item["author"]
                return ci.Note(
                    title=f"{handle} - {ci.first_words(item['text'])}",
                    platform="x",
                    kind="post",
                    url=item["url"],
                    authors=[handle],
                    abstract=[f"Published {item['created_at'][:10]}"] if item.get("created_at") else [],
                    content=item["text"],
                )

        return build

    return [(item["id"], item["url"], builder(item)) for item in items]


def _export_texts(path: Path):
    """The text of every JSON file of the export whose name says saved."""
    if path.is_dir():
        for f in path.rglob("*.json"):
            if "saved" in f.name:
                yield f.read_text(errors="ignore")
    elif zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as z:
            for name in z.namelist():
                if name.endswith(".json") and "saved" in Path(name).name:
                    yield z.read(name).decode(errors="ignore")
    else:
        raise ci.CaptureError(f"{path} is neither a folder nor a zip")


def from_instagram(args) -> list[tuple[str, str, Callable[[], ci.Note]]]:
    urls: dict[str, None] = {}
    for text in _export_texts(Path(args.export).expanduser()):
        for m in IG_LINK.finditer(text.replace("\\/", "/")):
            urls[ci.normalize(m.group(0))] = None
    if not urls:
        raise ci.CaptureError("no saved post links found: is it the JSON export, with Saved selected?")
    done = set(load_seen().get("instagram", []))
    links = [u for u in urls if u not in done][: args.max or None]
    return [(u, u, (lambda u=u: ci.instagram(u))) for u in links]


def boards(args) -> list[str]:
    if args.board:
        return args.board
    data = yaml.safe_load(SOURCES.read_text()) or {}
    return (data.get("saved") or {}).get("pinterest") or []


def board_feed(board: str) -> str:
    board = board.strip().rstrip("/")
    return board if board.endswith(".rss") else board + ".rss"


def pin_note(item: ET.Element, board_name: str) -> ci.Note:
    title = html.unescape(item.findtext("title") or "")
    desc = html.unescape(item.findtext("description") or "")
    link = (item.findtext("link") or "").strip()
    image = re.search(r'<img src="([^"]+)"', desc)
    sources = [u for u in re.findall(r'href="([^"]+)"', desc) if "pinterest.com/pin/" not in u]
    text = html.unescape(re.sub(r"<[^>]+>", "", desc)).strip() or title
    abstract = [f"Board: {board_name}"]
    if pub := item.findtext("pubDate"):
        try:
            abstract.append(f"Pinned {parsedate_to_datetime(pub):%Y-%m-%d}")
        except (TypeError, ValueError):
            pass
    abstract += [f"Source: {u}" for u in sources[:1]]
    return ci.Note(
        title=f"Pin - {ci.first_words(title) or link.rstrip('/').rsplit('/', 1)[-1]}",
        platform="pinterest",
        kind="post",
        url=link,
        abstract=abstract,
        content=text,
        images=[re.sub(r"/\d+x/", "/736x/", image.group(1))] if image else [],
    )


def from_pinterest(args) -> list[tuple[str, str, Callable[[], ci.Note]]]:
    found = []
    names = boards(args)
    if not names:
        raise ci.CaptureError("no boards: add them to saved.pinterest in sources.yaml or pass --board")
    for board in names:
        root = ET.fromstring(ci.fetch(board_feed(board)))
        board_name = root.findtext("channel/title") or board
        for item in root.iter("item"):
            guid = (item.findtext("guid") or item.findtext("link") or "").strip()
            found.append((guid, (item.findtext("link") or "").strip(), (lambda i=item, b=board_name: pin_note(i, b))))
    return found


# Main


def run(source: str, found: list[tuple[str, str, Callable[[], ci.Note]]], args) -> int:
    seen = load_seen()
    done = set(seen.get(source, []))
    in_vault = ci.known_urls()
    counts = {"new": 0, "dup": 0, "fail": 0, "old": 0}
    for item_id, url, build in found:
        if item_id in done:
            counts["old"] += 1
            continue
        if ci.normalize(url) in in_vault:
            print(f"= {url} (already in the vault)")
            counts["dup"] += 1
            done.add(item_id)
            continue
        try:
            note = build()
            note.url = ci.normalize(note.url or url)
        except Exception as err:  # one bad item never stops the batch; it gets another try next run
            print(f"! {url}: {type(err).__name__}: {str(err)[:200]}")
            counts["fail"] += 1
            continue
        path = ci.write(note, "", args.dry_run)
        in_vault.add(note.url)
        done.add(item_id)
        counts["new"] += 1
        print(f"+ {path.relative_to(ci.VAULT)}")
    if not args.dry_run:
        seen[source] = sorted(done)
        save_seen(seen)
        if counts["new"] and not args.no_ai:
            for m in ci.local_ai(None):
                print(f"· {m}")
    mode = " (dry run)" if args.dry_run else ""
    print(
        f"{source}: {counts['new']} new · {counts['dup']} already in the vault · "
        f"{counts['old']} seen before · {counts['fail']} failed{mode}"
    )
    return 1 if counts["fail"] else 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    sub = ap.add_subparsers(dest="source", required=True)
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--dry-run", action="store_true", help="show what would be written, change nothing")
    common.add_argument("--no-ai", action="store_true", help="skip the local AI pass (capture_ai.py)")
    x = sub.add_parser("x", parents=[common], help="X bookmarks through the API")
    x.add_argument("--max", type=int, default=50, help="newest bookmarks to load, 0 for all (about 800)")
    x.add_argument("--since", help="only posts created on or after this date (YYYY-MM-DD)")
    x.add_argument("--folder", help="bookmark folder id (x_bookmarks.py folders)")
    ig = sub.add_parser("instagram", parents=[common], help="the saved posts of an Instagram data export")
    ig.add_argument("export", help="the export zip or its unzipped folder")
    ig.add_argument("--max", type=int, default=0, help="import only the first N links (default all)")
    pin = sub.add_parser("pinterest", parents=[common], help="the pins of my Pinterest boards, by RSS")
    pin.add_argument("--board", action="append", help="board url (repeatable); default saved.pinterest of sources.yaml")
    sub.add_parser("seen", help="how many items of each source are marked as seen")
    args = ap.parse_args(argv)

    if args.source == "seen":
        for source, ids in sorted(load_seen().items()):
            print(f"{source}: {len(ids)}")
        print(seen_path())
        return 0
    collect = {"x": from_x, "instagram": from_instagram, "pinterest": from_pinterest}[args.source]
    try:
        found = collect(args)
    except (ci.CaptureError, xb.FeedError) as err:
        print(f"! {err}", file=sys.stderr)
        return 2
    return run(args.source, found, args)


if __name__ == "__main__":
    sys.exit(main())
