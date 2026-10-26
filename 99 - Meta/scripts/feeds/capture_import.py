# /// script
# requires-python = ">=3.11"
# dependencies = ["yt-dlp"]
# ///
"""capture_import.py - turn phone captures into capture notes of the vault.

Sources:
  drop    the iCloud Drive folder the iPhone Shortcut "→ Vault" writes to: one
          JSON file per share, {"url": ..., "note": ..., "created": ...}.
          Plain .txt files work too: the first URL is the link, the rest the note.
  notes   the Apple Notes folder "Vault". A note that holds a link is imported
          as that link; any other note is a thought (type Ideas, subtype spark).

Each capture becomes one note in 06 - Inputs/Captures/ (file_class capture,
status inbox, maturity capture). Then capture_ai.py runs the local models on
the queue (summary, form, author, paras) when Ollama is up; --no-ai skips it. Adapters by platform: youtube (yt-dlp, with
the transcript), x (api.fxtwitter.com, no login), instagram (yt-dlp, or the
Open Graph tags, or the bare link), web (Open Graph tags). A url already in
the vault is skipped. Imported drop files move to <drop>/_done/, imported
Apple Notes to the folder "Vault - Imported". A capture that fails stays where
it is for the next run.

Run:
    uv run --script "99 - Meta/scripts/feeds/capture_import.py"            # both sources
    uv run --script "99 - Meta/scripts/feeds/capture_import.py" --dry-run
    uv run --script "99 - Meta/scripts/feeds/capture_import.py" --only drop --no-transcript
    uv run --script "99 - Meta/scripts/feeds/capture_import.py" --url https://youtu.be/... --note "why"

Env:
    CAPTURES_DROP              drop folder (default iCloud Drive/Captures)
    CAPTURES_NOTES_FOLDER      Apple Notes folder (default Vault)
    CAPTURES_COOKIES_BROWSER   browser whose login yt-dlp reuses for Instagram (safari, chrome, firefox)

YouTube changes often: when it breaks, add --upgrade to the uv run line.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

VAULT = Path(__file__).resolve().parents[3]
OUT_DIR = VAULT / "06 - Inputs" / "Captures"
ICLOUD = Path.home() / "Library" / "Mobile Documents" / "com~apple~CloudDocs"
DROP = Path(os.environ.get("CAPTURES_DROP", ICLOUD / "Captures"))
NOTES_FOLDER = os.environ.get("CAPTURES_NOTES_FOLDER", "Vault")
NOTES_DONE = f"{NOTES_FOLDER} - Imported"
UA = "capture_import/1.0 (personal vault importer)"

SUBTYPES = {
    "video": ("[[Resources]]", "[[External Knowledge - Resources - video|video]]"),
    "post": ("[[Resources]]", "[[External Knowledge - Resources - post|post]]"),
    "bookmark": ("[[Resources]]", "[[External Knowledge - Resources - bookmark|bookmark]]"),
    "spark": ("[[Ideas]]", "[[Your Brain - Ideas - spark|spark]]"),
}
URL_RE = re.compile(r"https?://[^\s<>\"']+")
HASHTAG = re.compile(r"(?<![\w&/\\])#([^\s#\d.,;:!?)\]][^\s#.,;:!?)\]]*)")
CANONICAL_TAGS = {"learnable", "sentations_request", "rfm", "todo"}
TRACKING = {"si", "igsh", "igshid", "feature", "s", "t", "ref", "ref_src", "fbclid", "gclid", "pp"}


class CaptureError(RuntimeError):
    pass


@dataclass
class Capture:
    """One raw capture: a link or a thought, with my note from the share."""

    url: str = ""
    note: str = ""
    created: datetime = field(default_factory=datetime.now)
    title: str = ""  # Apple Notes thoughts only
    origin: str = "drop"  # drop | notes | cli
    ref: str = ""  # drop file path or Apple Notes id


@dataclass
class Note:
    """A capture note ready to write."""

    title: str
    platform: str
    kind: str  # key of SUBTYPES
    url: str = ""
    authors: list[str] = field(default_factory=list)
    abstract: list[str] = field(default_factory=list)
    embed: str = ""
    content: str = ""
    images: list[str] = field(default_factory=list)
    transcript: list[str] = field(default_factory=list)
    created: datetime = field(default_factory=datetime.now)
    warning: str = ""


# URLs


def platform_of(url: str) -> str:
    host = urllib.parse.urlsplit(url).netloc.lower().removeprefix("www.").removeprefix("m.")
    if host in {"youtube.com", "youtu.be", "music.youtube.com"}:
        return "youtube"
    if host in {"x.com", "twitter.com", "mobile.twitter.com", "fxtwitter.com", "vxtwitter.com", "fixupx.com"}:
        return "x"
    if host in {"instagram.com", "instagr.am"}:
        return "instagram"
    return "web"


def normalize(url: str) -> str:
    """One spelling per resource, so the dedupe compares like with like."""
    url = url.strip().rstrip(").,;")
    parts = urllib.parse.urlsplit(url)
    platform = platform_of(url)
    path = parts.path
    query = [(k, v) for k, v in urllib.parse.parse_qsl(parts.query) if k not in TRACKING and not k.startswith("utm_")]
    if platform == "youtube":
        vid = dict(query).get("v")
        if parts.netloc.endswith("youtu.be"):
            vid = path.strip("/").split("/")[0]
        elif m := re.match(r"/(shorts|live|embed)/([\w-]+)", path):
            vid = m.group(2)
        if vid:
            return f"https://www.youtube.com/watch?v={vid}"
        return urllib.parse.urlunsplit(("https", "www.youtube.com", path, urllib.parse.urlencode(query), ""))
    if platform == "x":
        return urllib.parse.urlunsplit(("https", "x.com", path.rstrip("/"), "", ""))
    if platform == "instagram":
        m = re.match(r"(?:/[\w.]+)?/(p|reel|reels|tv)/([\w-]+)", path)
        if m:
            kind = "reel" if m.group(1) in {"reel", "reels"} else "p"
            return f"https://www.instagram.com/{kind}/{m.group(2)}/"
        return urllib.parse.urlunsplit(("https", "www.instagram.com", path, "", ""))
    netloc = parts.netloc.lower()
    return urllib.parse.urlunsplit((parts.scheme.lower() or "https", netloc, path, urllib.parse.urlencode(query), ""))


def known_urls() -> set[str]:
    """Every url: value in the frontmatter of the vault, normalized."""
    seen = set()
    for path in VAULT.rglob("*.md"):
        if any(p.startswith(".") for p in path.relative_to(VAULT).parts):
            continue
        try:
            text = path.read_text(errors="ignore")
        except OSError:
            continue
        if not text.startswith("---"):
            continue
        front = text[3 : text.find("\n---", 3)]
        if m := re.search(r"^url:\s*[\"']?([^\"'\n]+)", front, re.M):
            seen.add(normalize(m.group(1)))
    return seen


# HTTP


def fetch(url: str, *, limit: int = 3_000_000) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en,es;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read(limit)
    except urllib.error.HTTPError as err:
        raise CaptureError(f"GET {url} -> HTTP {err.code}") from err
    except urllib.error.URLError as err:
        raise CaptureError(f"GET {url} -> {err.reason}") from err


class MetaParser(HTMLParser):
    """The <title> and the <meta> tags of a page."""

    def __init__(self):
        super().__init__()
        self.meta: dict[str, str] = {}
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta":
            key = (a.get("property") or a.get("name") or "").lower()
            if key and a.get("content") and key not in self.meta:
                self.meta[key] = html.unescape(a["content"] or "").strip()
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def page_meta(url: str) -> MetaParser:
    parser = MetaParser()
    parser.feed(fetch(url).decode("utf-8", errors="replace"))
    return parser


# Adapters


class _Quiet:
    """yt-dlp logger that keeps its errors out of the terminal; the adapter reports them."""

    def debug(self, msg):
        pass

    warning = error = debug


def ytdlp_info(url: str, cookies: bool = False) -> tuple[dict, object]:
    import yt_dlp

    opts: dict[str, object] = {"quiet": True, "no_warnings": True, "skip_download": True, "socket_timeout": 30, "logger": _Quiet()}
    if cookies and os.environ.get("CAPTURES_COOKIES_BROWSER"):
        opts["cookiesfrombrowser"] = (os.environ["CAPTURES_COOKIES_BROWSER"],)
    ydl = yt_dlp.YoutubeDL(opts)
    try:
        return ydl.extract_info(url, download=False), ydl
    except yt_dlp.utils.DownloadError as err:
        raise CaptureError(str(err).removeprefix("ERROR: ")[:300]) from err


def stamp(seconds: float) -> str:
    seconds = int(seconds)
    h, rest = divmod(seconds, 3600)
    return f"{h}:{rest // 60:02d}:{rest % 60:02d}" if h else f"{rest // 60:02d}:{rest % 60:02d}"


def transcript(info: dict, ydl, url: str) -> list[str]:
    """The captions as one bullet per minute, each with a link to its time."""
    lang = (info.get("language") or "en").split("-")[0]
    subs, auto = info.get("subtitles") or {}, info.get("automatic_captions") or {}
    tracks = None
    for source, key in ((subs, lang), (auto, f"{lang}-orig"), (auto, lang), (subs, "en"), (subs, "es"), (auto, "en")):
        if key in source:
            tracks = source[key]
            break
    if not tracks:
        return []
    track = next((t for t in tracks if t.get("ext") == "json3"), None)
    if not track:
        return []
    events = json.loads(ydl.urlopen(track["url"]).read()).get("events", [])
    blocks: list[tuple[int, list[str]]] = []
    for ev in events:
        text = "".join(s.get("utf8", "") for s in ev.get("segs") or []).replace("\n", " ").strip()
        if not text:
            continue
        start = ev.get("tStartMs", 0) // 1000
        if not blocks or start - blocks[-1][0] >= 60:
            blocks.append((start, []))
        blocks[-1][1].append(text)
    return [f"[{stamp(s)}]({url}&t={s}s) {re.sub(r'\s+', ' ', ' '.join(t))}" for s, t in blocks]


def youtube(url: str, with_transcript: bool) -> Note:
    info, ydl = ytdlp_info(url)
    handle = info.get("uploader_id") or ""
    author = handle if handle.startswith("@") else info.get("channel") or info.get("uploader") or ""
    lines, warning = [], ""
    if with_transcript:
        try:
            lines = transcript(info, ydl, url)
        except Exception as err:  # the video still imports without its transcript
            warning = f"no transcript ({type(err).__name__})"
    abstract = []
    if info.get("upload_date"):
        d = info["upload_date"]
        abstract.append(f"Published {d[:4]}-{d[4:6]}-{d[6:]}")
    if info.get("duration"):
        abstract.append(f"Duration {stamp(info['duration'])}")
    return Note(
        title=info.get("title") or url,
        platform="youtube",
        kind="video",
        url=url,
        authors=[author] if author else [],
        abstract=abstract,
        embed=f"![]({url})",
        content=(info.get("description") or "").strip(),
        transcript=lines,
        warning=warning,
    )


def x_post(url: str) -> Note:
    m = re.search(r"/status(?:es)?/(\d+)", url)
    if not m:
        raise CaptureError("not a post url (no /status/<id>)")
    data = json.loads(fetch(f"https://api.fxtwitter.com/status/{m.group(1)}"))
    tweet = data.get("tweet")
    if not tweet:
        raise CaptureError(f"fxtwitter: {data.get('message', 'no tweet')}")
    handle = "@" + tweet["author"]["screen_name"]
    text = tweet.get("text", "").strip()
    quote = tweet.get("quote")
    if quote:
        qtext = "\n".join(f"> {line}" for line in quote.get("text", "").splitlines())
        text += f"\n\n> [!quote] @{quote['author']['screen_name']}\n{qtext}"
    media = tweet.get("media") or {}
    images = [p["url"] for p in media.get("photos") or []]
    images += [v["thumbnail_url"] for v in media.get("videos") or [] if v.get("thumbnail_url")]
    abstract = []
    if ts := tweet.get("created_timestamp"):
        abstract.append(f"Published {datetime.fromtimestamp(ts):%Y-%m-%d}")
    if tweet.get("replying_to"):
        abstract.append(f"Reply to @{tweet['replying_to']}")
    return Note(
        title=f"{handle} - {first_words(tweet.get('text', ''))}",
        platform="x",
        kind="post",
        url=url,
        authors=[handle],
        abstract=abstract,
        content=text,
        images=images,
    )


def instagram(url: str) -> Note:
    try:
        info, _ = ytdlp_info(url, cookies=True)
        handle = "@" + (info.get("channel") or info.get("uploader_id") or info.get("uploader") or "").lstrip("@")
        caption = (info.get("description") or "").strip()
        abstract = []
        if info.get("timestamp"):
            abstract.append(f"Published {datetime.fromtimestamp(info['timestamp']):%Y-%m-%d}")
        return Note(
            title=f"{handle} - {first_words(caption) or info.get('title', '')}",
            platform="instagram",
            kind="post",
            url=url,
            authors=[handle] if handle != "@" else [],
            abstract=abstract,
            content=caption,
            images=[info["thumbnail"]] if info.get("thumbnail") else [],
        )
    except CaptureError:
        pass
    handle, caption, image = "", "", ""
    try:
        meta = page_meta(url).meta
        desc = meta.get("og:description", "")
        if m := re.search(r"-\s*([\w.]+) on [^:]+:\s*[\"“](.*)[\"”]\s*$", desc, re.S):
            handle, caption = "@" + m.group(1), m.group(2).strip()
        image = meta.get("og:image", "")
    except CaptureError:
        pass
    code = url.rstrip("/").rsplit("/", 1)[-1]
    return Note(
        title=f"{handle or 'Instagram'} - {first_words(caption) or code}",
        platform="instagram",
        kind="post",
        url=url,
        authors=[handle] if handle else [],
        content=caption,
        images=[image] if image else [],
    )


def web(url: str) -> Note:
    page = page_meta(url)
    meta = page.meta
    title = meta.get("og:title") or page.title.strip() or url
    author = meta.get("author") or meta.get("article:author") or meta.get("og:site_name") or ""
    if author.startswith("http"):
        author = ""
    abstract = []
    if pub := meta.get("article:published_time"):
        abstract.append(f"Published {pub[:10]}")
    return Note(
        title=title,
        platform="web",
        kind="bookmark",
        url=url,
        authors=[author] if author else [],
        abstract=abstract,
        content=meta.get("og:description") or meta.get("description") or "",
        images=[meta["og:image"]] if meta.get("og:image") else [],
    )


def thought(cap: Capture) -> Note:
    body = cap.note.strip()
    first = body.splitlines()[0] if body else ""
    title = cap.title or first_words(first, 8) or f"Thought {cap.created:%Y-%m-%d %H%M}"
    if body.startswith(title):
        body = body[len(title) :].strip()
    return Note(title=title, platform="apple-notes" if cap.origin == "notes" else "", kind="spark", content=body)


def build(cap: Capture, with_transcript: bool) -> Note:
    if not cap.url:
        note = thought(cap)
    else:
        adapter = {"youtube": lambda u: youtube(u, with_transcript), "x": x_post, "instagram": instagram, "web": web}
        note = adapter[platform_of(cap.url)](cap.url)
    note.created = cap.created
    return note


# Rendering


def first_words(text: str, n: int = 10) -> str:
    text = re.sub(r"https?://\S+", "", text)
    words = re.sub(r"\s+", " ", text).strip().split(" ")
    out = " ".join(words[:n])
    return out + "…" if len(words) > n else out


def safe_title(title: str) -> str:
    title = re.sub(r'[\[\]#^|\\/:*?"<>]', " ", title)
    title = re.sub(r"\s+", " ", title).strip(" .-")
    return title[:90].rstrip(" .-") or "Capture"


def link(name: str) -> str:
    return f"[[{safe_title(name)}]]"


def yaml_str(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def render(note: Note, my_note: str) -> str:
    type_, subtype = SUBTYPES[note.kind]
    lines = [
        "---",
        "file_class: capture",
        "paras:",
        f"type: {yaml_str(type_)}",
        "subtypes:",
        f"  - {yaml_str(subtype)}",
        "rate:",
        "tags:",
        "status: inbox",
        "maturity: capture",
        f"created: {note.created:%Y-%m-%d %H:%M}",
        f"url: {yaml_str(note.url) if note.url else ''}",
        "author:" + "".join(f"\n  - {yaml_str(link(a))}" for a in note.authors),
        f"platform: {note.platform}",
        "---",
        f"# [[{note.title}]]",
        "",
    ]
    if note.kind == "spark":
        body = no_tags(note.content or my_note)
        first = next((ln.strip("-# \t") for ln in body.splitlines() if ln.strip()), "")
        lines += ["> [!abstract] Spark", f"> - {first_words(first, 20) or note.title}", "", body, ""]
        return "\n".join(lines).rstrip() + "\n"
    head = {"video": "Video", "post": "Post", "bookmark": "Page"}[note.kind]
    by = f" by {link(note.authors[0])}" if note.authors else ""
    bullets = ([f"Why: {one_line(my_note)}"] if my_note else []) + note.abstract
    lines.append(f"> [!abstract] {head}{by}")
    lines += [f"> - {b}" for b in bullets or [note.url]]
    lines.append("")
    if note.embed:
        lines += [note.embed, ""]
    if note.content and note.kind == "video":
        lines.append("> [!info]- Description")
        lines += [f"> {line}".rstrip() for line in no_tags(note.content).splitlines()]
        lines.append("")
    elif note.content:
        lines += ["## Content", "", no_tags(note.content), ""]
    lines += [f"![]({img})" for img in note.images]
    if note.images:
        lines.append("")
    if note.transcript:
        lines.append("> [!quote]- Transcript")
        lines += [f"> - {no_tags(t)}" for t in note.transcript]
        lines.append("")
    lines += ["## Annotations", ""]
    return "\n".join(lines)


def no_tags(text: str) -> str:
    """Escape #hashtags so Obsidian does not read them as tags; only the four canonical tags stay."""
    return HASHTAG.sub(lambda m: m.group(0) if m.group(1).lower() in CANONICAL_TAGS else "\\" + m.group(0), text)


def one_line(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def write(note: Note, my_note: str, dry: bool) -> Path:
    note.title = safe_title(note.title)
    path = OUT_DIR / f"{note.title}.md"
    n = 2
    while path.exists():
        path = OUT_DIR / f"{note.title} ({n}).md"
        n += 1
    note.title = path.stem
    if not dry:
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        path.write_text(render(note, my_note))
    return path


# Sources


def parse_created(value: str | None, fallback: datetime) -> datetime:
    if not value:
        return fallback
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone().replace(tzinfo=None)
    except ValueError:
        return fallback


def split_text(text: str) -> tuple[str, str]:
    """First URL of a free text, and the text without it."""
    m = URL_RE.search(text)
    if not m:
        return "", text.strip()
    return m.group(0), (text[: m.start()] + text[m.end() :]).strip()


def from_drop() -> tuple[list[Capture], list[str]]:
    if not DROP.exists():
        return [], [f"drop folder not found: {DROP} (create it, or set CAPTURES_DROP)"]
    caps, notes = [], []
    pending = sorted(DROP.glob(".*.icloud"))
    if pending:
        subprocess.run(["brctl", "download", str(DROP)], capture_output=True)
        notes.append(f"{len(pending)} drop file(s) still downloading from iCloud; run again later")
    for path in sorted(p for p in DROP.iterdir() if p.is_file() and p.suffix in {".json", ".txt"}):
        mtime = datetime.fromtimestamp(path.stat().st_mtime)
        text = path.read_text(errors="replace").strip()
        if path.suffix == ".json":
            try:
                data = json.loads(text)
            except json.JSONDecodeError:
                data = {"url": text}
            raw = str(data.get("url") or "")
            url, rest = split_text(raw)
            note = "\n".join(x for x in (rest, str(data.get("note") or "").strip()) if x)
            created = parse_created(data.get("created"), mtime)
        else:
            url, note = split_text(text)
            created = mtime
        caps.append(Capture(url=url, note=note, created=created, origin="drop", ref=str(path)))
    return caps, notes


JXA_READ = """
function run(argv) {
  const Notes = Application('Notes');
  const folders = Notes.folders.whose({name: argv[0]})();
  if (!folders.length) return JSON.stringify({missing: true});
  return JSON.stringify({notes: folders[0].notes().map(n => ({
    id: n.id(), name: n.name(), body: n.body(), created: n.creationDate().toISOString()}))});
}
"""

JXA_MOVE = """
function run(argv) {
  const Notes = Application('Notes');
  let target = Notes.folders.whose({name: argv[0]})();
  if (!target.length) { Notes.make({new: 'folder', withProperties: {name: argv[0]}}); target = Notes.folders.whose({name: argv[0]})(); }
  for (const id of argv.slice(1)) Notes.move(Notes.notes.byId(id), {to: target[0]});
  return 'ok';
}
"""


def osascript(script: str, *args: str) -> str:
    res = subprocess.run(["osascript", "-l", "JavaScript", "-e", script, *args], capture_output=True, text=True, timeout=120)
    if res.returncode:
        raise CaptureError(f"Apple Notes: {res.stderr.strip()[:300]}")
    return res.stdout.strip()


class NoteHTML(HTMLParser):
    """Apple Notes body HTML to Markdown: blocks, lists, bold, italic, links."""

    def __init__(self):
        super().__init__()
        self.out: list[str] = []
        self.depth = 0
        self.href = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in {"div", "p", "br", "h1", "h2", "h3"}:
            self.out.append("\n")
        if tag in {"h1", "h2", "h3"}:
            self.out.append("#" * (int(tag[1]) + 1) + " ")
        elif tag in {"ul", "ol"}:
            self.depth += 1
        elif tag == "li":
            self.out.append("\n" + "\t" * (self.depth - 1) + "- ")
        elif tag == "b":
            self.out.append("**")
        elif tag == "i":
            self.out.append("*")
        elif tag == "a":
            self.href = a.get("href", "")
            self.out.append("[")

    def handle_endtag(self, tag):
        if tag in {"ul", "ol"}:
            self.depth -= 1
            self.out.append("\n")
        elif tag == "b":
            self.out.append("**")
        elif tag == "i":
            self.out.append("*")
        elif tag == "a":
            self.out.append(f"]({self.href})")

    def handle_data(self, data):
        self.out.append(data.replace("\xa0", " "))

    def markdown(self) -> str:
        text = "".join(self.out).replace("****", "")
        text = re.sub(r"[ \t]+\n", "\n", text)
        text = re.sub(r"^(\t*- .*)\n\n+(?=\t*- )", r"\1\n", text, flags=re.M)
        return re.sub(r"\n{3,}", "\n\n", text).strip()


def from_notes() -> tuple[list[Capture], list[str]]:
    data = json.loads(osascript(JXA_READ, NOTES_FOLDER) or "{}")
    if data.get("missing"):
        return [], [f'Apple Notes folder "{NOTES_FOLDER}" not found (create it, or set CAPTURES_NOTES_FOLDER)']
    caps = []
    for n in data.get("notes", []):
        parser = NoteHTML()
        parser.feed(n["body"])
        body = parser.markdown()
        name = n["name"].strip()
        lines = body.splitlines()
        if lines and re.sub(r"[#*\s]", "", lines[0]) == re.sub(r"\s", "", name):
            body = "\n".join(lines[1:]).strip()
        created = parse_created(n["created"], datetime.now())
        url, rest = split_text(body or name)
        if url and len(rest) < 280:
            caps.append(Capture(url=url, note=rest if body else "", created=created, origin="notes", ref=n["id"]))
        else:
            caps.append(Capture(note=body, title=name, created=created, origin="notes", ref=n["id"]))
    return caps, []


# Main


def local_ai(budget: float | None) -> list[str]:
    """The captures pipeline of ai.toml on the queue: form, source, summary, paras. Never fails the import."""
    import capture_ai

    try:
        if budget is None:
            budget = capture_ai.vault_ai.load().pipeline(capture_ai.PIPELINE).get("budget", 400)
        done = capture_ai.enrich(capture_ai.queue(), budget=budget)
    except capture_ai.OllamaDown as err:
        return [f"local AI skipped: {err}"]
    except Exception as err:  # the import already worked; the AI pass retries on the next run
        return [f"local AI failed: {type(err).__name__}: {str(err)[:200]}"]
    return [f"local AI: {len(done)} captures enriched"] if done else []


def main() -> int:
    ap = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    ap.add_argument("--only", choices=["drop", "notes"], help="one source only")
    ap.add_argument("--url", action="append", default=[], help="import this link directly (repeatable)")
    ap.add_argument("--note", default="", help="my note for --url")
    ap.add_argument("--no-transcript", action="store_true", help="skip YouTube transcripts")
    ap.add_argument("--dry-run", action="store_true", help="show what would be written, change nothing")
    ap.add_argument("--no-ai", action="store_true", help="skip the local AI pass (capture_ai.py)")
    ap.add_argument("--ai-budget", type=float, help="seconds for the local AI pass (default: budget in ai.toml)")
    args = ap.parse_args()

    caps: list[Capture] = []
    messages: list[str] = []
    if args.url:
        caps += [Capture(url=u, note=args.note, origin="cli") for u in args.url]
    else:
        for name, source in (("drop", from_drop), ("notes", from_notes)):
            if args.only in (None, name):
                try:
                    found, notes = source()
                except CaptureError as err:
                    found, notes = [], [str(err)]
                caps += found
                messages += notes

    seen = known_urls()
    done_drop: list[Path] = []
    done_notes: list[str] = []
    counts = {"new": 0, "dup": 0, "fail": 0}
    for cap in caps:
        if cap.url:
            cap.url = normalize(cap.url)
        label = cap.url or f"thought: {first_words(cap.title or cap.note, 6)}"
        if cap.url and cap.url in seen:
            print(f"= {label} (already in the vault)")
            counts["dup"] += 1
        else:
            try:
                note = build(cap, not args.no_transcript)
            except Exception as err:  # one bad capture never stops the batch; it stays for the next run
                print(f"! {label}: {type(err).__name__}: {str(err)[:200]}")
                counts["fail"] += 1
                continue
            path = write(note, cap.note, args.dry_run)
            seen.add(cap.url)
            counts["new"] += 1
            extra = f" · transcript {len(note.transcript)} min" if note.transcript else ""
            extra += f" · {note.warning}" if note.warning else ""
            print(f"+ {path.relative_to(VAULT)}{extra}")
        if cap.origin == "drop":
            done_drop.append(Path(cap.ref))
        elif cap.origin == "notes":
            done_notes.append(cap.ref)

    if not args.dry_run:
        if done_drop:
            (DROP / "_done").mkdir(exist_ok=True)
            for p in done_drop:
                p.rename(DROP / "_done" / p.name)
        if done_notes:
            try:
                osascript(JXA_MOVE, NOTES_DONE, *done_notes)
            except CaptureError as err:
                messages.append(f"imported, but could not move the Apple Notes: {err}")
    if not args.dry_run and not args.no_ai:
        messages += local_ai(args.ai_budget)
    for m in messages:
        print(f"· {m}")
    mode = " (dry run)" if args.dry_run else ""
    print(f"{counts['new']} new · {counts['dup']} already in the vault · {counts['fail']} failed{mode}")
    return 1 if counts["fail"] else 0


if __name__ == "__main__":
    sys.exit(main())
