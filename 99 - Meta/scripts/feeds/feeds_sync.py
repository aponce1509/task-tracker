# /// script
# requires-python = ">=3.11"
# dependencies = ["feedparser>=6", "certifi", "pyyaml", "numpy", "jsonschema"]
# ///
"""feeds_sync.py - pull the news feeds of sources.yaml and group them into stories.

Steps (design: 11 - Projects/create-a-feed/Feed and News Design.md):
  fetch     read every enabled feed of sources.yaml with a conditional GET and
            store the new items (title, lede, url, outlet, lean, date) in SQLite.
  cluster   embed the new items with bge-m3 (Ollama) and join each one to the
            closest open story (24 h since its last item, 36 h since its first) when the cosine is >= tau, else
            start a story. Pairs just under tau are kept as merge candidates.
  enrich    send the stories with two outlets or more to an LLM, in batches:
            group, title, summary, a framing per headline, and a yes/no on the
            pairs just under tau. A story is sent again only when an outlet joins.
  render    write one note per enriched story (two outlets or more, group not
            other) in 06 - Inputs/News/. Only notes with status inbox are
            rewritten; a note set to done moves to _kept/ and is never touched.
  purge     delete the inbox notes and the database rows older than 30 days,
            and the inbox notes of stories that no longer exist (merged).
  export    write ~/.config/feeds/news.json for the News pane of Mise-en-Place.
  stream    fetch the follows of sources.yaml (blogs, podcasts, channels,
            newsletters) of the last stream.days, purge and write
            ~/.config/feeds/stream.json for the Stream pane. No clustering, no LLM.
  sync      fetch + cluster + enrich + render + purge + export + stream (an
            enrich failure is only a warning).
  follow    edit the follows of sources.yaml: add (a feed, a blog page or a
            YouTube channel url), edit, remove, folder (rename), days (span).

Tuning (embeddings are cached, so these are cheap):
  stories   print the stories of a time window, the biggest first.
  pairs     print item pairs of different stories with a cosine in a band.
  recluster drop every story and cluster again, for example with a new --tau.
  status    feed health: last fetch, HTTP status, errors, item counts.

Run:
    uv run --script "99 - Meta/scripts/feeds/feeds_sync.py" sync
    uv run --script "99 - Meta/scripts/feeds/feeds_sync.py" stories --since 24h --min-outlets 2
    uv run --script "99 - Meta/scripts/feeds/feeds_sync.py" recluster --tau 0.75
    uv run --script "99 - Meta/scripts/feeds/feeds_sync.py" pairs --lo 0.65 --hi 0.72
    uv run --script "99 - Meta/scripts/feeds/feeds_sync.py" enrich --llm ollama:llama3.1:8b --dry-run
    uv run --script "99 - Meta/scripts/feeds/feeds_sync.py" follow add https://simonwillison.net --folder Blogs
    uv run --script "99 - Meta/scripts/feeds/feeds_sync.py" follow days 14

Env:
    FEEDS_HOME     folder of the database (default ~/.config/feeds), shared with x_bookmarks.py
    FEEDS_TAU      default tau (default 0.72)
    OLLAMA_HOST    Ollama url (default http://localhost:11434)
    FEEDS_LLM      <provider>:<model> for enrich: claude:haiku (default), opencode:<model>, ollama:<model>
    FEEDS_LLM_FALLBACK  comma list of providers to try when the first fails (default opencode:glm-5.3-flash)
    FEEDS_LANG     language of the titles and summaries (default Spanish)
"""

from __future__ import annotations

import argparse
import concurrent.futures as cf
import html
import json
import os
import re
import sqlite3
import shutil
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from calendar import timegm
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

import certifi
import feedparser
import jsonschema
import numpy as np
import yaml

HERE = Path(__file__).resolve().parent
SOURCES = HERE / "sources.yaml"
HOME = Path(os.environ.get("FEEDS_HOME", Path.home() / ".config" / "feeds"))
DB = HOME / "feeds.db"
OLLAMA = os.environ.get("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
EMBED_MODEL = "bge-m3"
TAU = float(os.environ.get("FEEDS_TAU", "0.72"))
NEAR = 0.08  # a story within NEAR under tau is a merge candidate for the LLM
WINDOW = timedelta(hours=24)  # a story stays open this long after its last item
SPAN = timedelta(hours=36)  # and never longer than this after its first item: a long event splits by day
MAX_AGE = timedelta(days=3)  # older items of a feed are skipped
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) feeds_sync/0.1 (personal reader)"
SSL = ssl.create_default_context(cafile=certifi.where())
TRACKING = {"ref", "ref_src", "cmpid", "ns_mchannel", "ns_source", "ns_campaign", "ns_linkname", "fbclid", "gclid", "smid", "mod", "rss", "int"}
LLM = os.environ.get("FEEDS_LLM", "claude:haiku")
LLM_FALLBACK = [x.strip() for x in os.environ.get("FEEDS_LLM_FALLBACK", "opencode:glm-5.3-flash").split(",") if x.strip()]
LANG = os.environ.get("FEEDS_LANG", "Spanish")
BATCH = 20  # stories per LLM call
MAX_HEADLINES = 8  # headlines per story sent to the LLM, one per outlet
FRAMINGS = ["neutral", "favourable", "critical"]
VAULT = HERE.parents[2]
NEWS_DIR = VAULT / "06 - Inputs" / "News"
KEPT_DIR = NEWS_DIR / "_kept"
KEEP_DAYS = 30  # inbox notes and database rows older than this are purged
EXPORT = HOME / "news.json"
DISMISSED = HOME / "dismissed.json"  # story ids dismissed in the News pane: never rendered again
STREAM_EXPORT = HOME / "stream.json"
STREAM_MARKS = HOME / "stream_marks.json"  # item url -> kept | dismissed, written by the Stream pane
STREAM_DAYS = 7  # default time span of the stream (stream.days in sources.yaml)
STREAM_LIMIT = 30  # newest items stored per fetch of one follow (limit: of the follow)
FOLLOW_KEYS = ["name", "folder", "kind", "url"]  # written first, in this order
LEAN_SIDE = {"left": "L", "centre-left": "L", "centre": "C", "centre-right": "R", "right": "R", "none": ""}

SCHEMA = """
CREATE TABLE IF NOT EXISTS feeds (
    url TEXT PRIMARY KEY, outlet TEXT, etag TEXT, modified TEXT,
    last_fetch TEXT, last_status INTEGER, last_error TEXT, last_new INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY, created TEXT, first_item TEXT, last_item TEXT,
    centroid BLOB, n_items INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY, url TEXT UNIQUE, feed_url TEXT, outlet TEXT, lean TEXT, lang TEXT,
    groups TEXT, title TEXT, lede TEXT, published TEXT, fetched TEXT,
    embedding BLOB, story_id INTEGER REFERENCES stories(id), score REAL,
    near_story INTEGER, near_score REAL
);
CREATE TABLE IF NOT EXISTS merge_checks (
    a INTEGER, b INTEGER, same INTEGER, llm TEXT, checked TEXT, PRIMARY KEY (a, b)
);
CREATE TABLE IF NOT EXISTS stream (
    id INTEGER PRIMARY KEY, url TEXT UNIQUE, feed_url TEXT, title TEXT, lede TEXT, author TEXT,
    thumb TEXT, published TEXT, fetched TEXT
);
CREATE INDEX IF NOT EXISTS stream_published ON stream(published);
CREATE INDEX IF NOT EXISTS items_story ON items(story_id);
CREATE INDEX IF NOT EXISTS items_published ON items(published);
CREATE INDEX IF NOT EXISTS stories_last ON stories(last_item);
"""


class SyncError(RuntimeError):
    pass


@dataclass
class Feed:
    url: str
    outlet: str
    name: str
    lean: str
    lang: str
    groups: list[str]


@dataclass
class Follow:
    url: str
    name: str
    folder: str
    kind: str  # youtube | podcast | blog | newsletter | papers
    limit: int = STREAM_LIMIT


# Config and database


def load_sources() -> dict:
    return yaml.safe_load(SOURCES.read_text())


def news_feeds(cfg: dict, only: set[str] | None = None) -> list[Feed]:
    feeds = []
    for o in cfg.get("news", []):
        if not o.get("enabled", True) or (only and o["id"] not in only):
            continue
        for f in o.get("feeds", []):
            feeds.append(Feed(f["url"], o["id"], o["name"], o.get("lean", "none"), o.get("lang", ""), f.get("groups", [])))
    return feeds


def skip_patterns(cfg: dict) -> list[re.Pattern]:
    return [re.compile(p, re.I) for p in cfg.get("skip_titles", [])]


def outlet_names(cfg: dict) -> dict[str, str]:
    return {o["id"]: o["name"] for o in cfg.get("news", [])}


def connect() -> sqlite3.Connection:
    HOME.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB, timeout=60)  # the Stream pane may write while a sync runs
    db.row_factory = sqlite3.Row
    db.executescript(SCHEMA)
    migrate(db)
    return db


# Columns added after the first schema: (table, column, type).
COLUMNS = [
    ("stories", "grp", "TEXT"), ("stories", "title", "TEXT"), ("stories", "summary", "TEXT"),
    ("stories", "enriched_outlets", "INTEGER"), ("stories", "enriched", "TEXT"), ("stories", "llm", "TEXT"),
    ("items", "framing", "TEXT"),
]


def migrate(db: sqlite3.Connection) -> None:
    for table, col, kind in COLUMNS:
        if col not in {r["name"] for r in db.execute(f"PRAGMA table_info({table})")}:
            db.execute(f"ALTER TABLE {table} ADD COLUMN {col} {kind}")
    db.commit()


def now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(value: str) -> datetime:
    return datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def parse_since(value: str) -> datetime:
    """24h, 3d, 90m or an ISO date."""
    if m := re.fullmatch(r"(\d+)([mhd])", value):
        units = {"m": "minutes", "h": "hours", "d": "days"}
        return now() - timedelta(**{units[m.group(2)]: int(m.group(1))})
    return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)


# Fetch


def canonical(url: str) -> str:
    """One spelling per article: no tracking parameters, no fragment."""
    parts = urllib.parse.urlsplit(url.strip())
    query = [(k, v) for k, v in urllib.parse.parse_qsl(parts.query) if k not in TRACKING and not k.startswith("utm_")]
    return urllib.parse.urlunsplit(("https" if parts.scheme in {"http", "https"} else parts.scheme, parts.netloc.lower(), parts.path, urllib.parse.urlencode(query), ""))


def clean(text: str, limit: int = 500) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"\s+", " ", html.unescape(text)).strip()
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"


def http_get(url: str, etag: str | None, modified: str | None) -> tuple[int, bytes, dict]:
    headers = {"User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8"}
    if etag:
        headers["If-None-Match"] = etag
    if modified:
        headers["If-Modified-Since"] = modified
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20, context=SSL) as resp:
            return resp.status, resp.read(5_000_000), dict(resp.headers)
    except urllib.error.HTTPError as err:
        if err.code == 304:
            return 304, b"", {}
        raise SyncError(f"HTTP {err.code}") from err
    except (urllib.error.URLError, TimeoutError, ConnectionError) as err:
        raise SyncError(str(getattr(err, "reason", err))) from err


def entry_time(entry) -> datetime | None:
    for key in ("published_parsed", "updated_parsed"):
        if t := entry.get(key):
            return datetime.fromtimestamp(timegm(t), timezone.utc)
    return None


def parse_entries(feed: Feed, body: bytes, fetched: datetime, skip: list[re.Pattern]) -> list[dict]:
    parsed = feedparser.parse(body)
    if parsed.bozo and not parsed.entries:
        raise SyncError(f"not a feed: {parsed.bozo_exception}")
    items = []
    for e in parsed.entries:
        link, title = e.get("link"), clean(e.get("title", ""), 300)
        if not link or not title or any(p.search(title) for p in skip):
            continue
        published = entry_time(e) or fetched
        if published > fetched + timedelta(hours=1):  # future dates are feed bugs
            published = fetched
        if fetched - published > MAX_AGE:
            continue
        items.append({
            "url": canonical(link), "feed_url": feed.url, "outlet": feed.outlet, "lean": feed.lean,
            "lang": feed.lang, "groups": json.dumps(feed.groups), "title": title,
            "lede": clean(e.get("summary", "")), "published": iso(published), "fetched": iso(fetched),
        })
    return items


def fetch(db: sqlite3.Connection, feeds: list[Feed], skip: list[re.Pattern], verbose: bool = False) -> int:
    state = {r["url"]: r for r in db.execute("SELECT url, etag, modified FROM feeds")}
    fetched = now()

    def one(feed: Feed):
        s = state.get(feed.url)
        try:
            status, body, headers = http_get(feed.url, s and s["etag"], s and s["modified"])
            items = parse_entries(feed, body, fetched, skip) if status != 304 else []
            return feed, status, items, headers, None
        except SyncError as err:
            return feed, None, [], {}, str(err)

    total = 0
    with cf.ThreadPoolExecutor(max_workers=8) as pool:
        for feed, status, items, headers, error in pool.map(one, feeds):
            new = 0
            for it in items:
                cur = db.execute(
                    "INSERT OR IGNORE INTO items (url, feed_url, outlet, lean, lang, groups, title, lede, published, fetched)"
                    " VALUES (:url, :feed_url, :outlet, :lean, :lang, :groups, :title, :lede, :published, :fetched)", it)
                new += cur.rowcount
            save_state(db, feed.url, feed.outlet, headers, fetched, status, error, new)
            total += new
            if error:
                print(f"  ! {feed.outlet:16} {error}  {feed.url}", file=sys.stderr)
            elif verbose:
                print(f"  {feed.outlet:16} {status}  +{new}  {feed.url}")
    db.commit()
    return total


def save_state(db: sqlite3.Connection, url: str, outlet: str, headers: dict, fetched: datetime,
               status: int | None, error: str | None, new: int) -> None:
    db.execute(
        "INSERT INTO feeds (url, outlet, etag, modified, last_fetch, last_status, last_error, last_new)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(url) DO UPDATE SET outlet = excluded.outlet,"
        " etag = COALESCE(excluded.etag, feeds.etag), modified = COALESCE(excluded.modified, feeds.modified),"
        " last_fetch = excluded.last_fetch, last_status = excluded.last_status,"
        " last_error = excluded.last_error, last_new = excluded.last_new",
        (url, outlet, headers.get("ETag"), headers.get("Last-Modified"), iso(fetched), status, error, new))


# Embeddings and clustering


def embed(texts: list[str]) -> np.ndarray:
    req = urllib.request.Request(
        f"{OLLAMA}/api/embed", data=json.dumps({"model": EMBED_MODEL, "input": texts}).encode(),
        headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            vecs = np.array(json.load(resp)["embeddings"], dtype=np.float32)
    except urllib.error.URLError as err:
        raise SyncError(f"Ollama at {OLLAMA} does not answer ({err.reason}); start it with `ollama serve`") from err
    return vecs / np.linalg.norm(vecs, axis=1, keepdims=True)


def item_text(row) -> str:
    lede = row["lede"] or ""
    return f"{row['title']}. {lede[:300]}" if lede else row["title"]


def embed_missing(db: sqlite3.Connection, batch: int = 64) -> int:
    rows = db.execute("SELECT id, title, lede FROM items WHERE embedding IS NULL ORDER BY id").fetchall()
    for i in range(0, len(rows), batch):
        chunk = rows[i : i + batch]
        vecs = embed([item_text(r) for r in chunk])
        db.executemany("UPDATE items SET embedding = ? WHERE id = ?", [(v.tobytes(), r["id"]) for v, r in zip(vecs, chunk)])
        db.commit()
    return len(rows)


def vec(blob: bytes) -> np.ndarray:
    return np.frombuffer(blob, dtype=np.float32)


def cluster(db: sqlite3.Connection, tau: float = TAU) -> tuple[int, int]:
    """Online single pass, oldest item first. Returns (items placed, stories started)."""
    rows = db.execute("SELECT id, published, embedding FROM items WHERE story_id IS NULL AND embedding IS NOT NULL ORDER BY published, id").fetchall()
    if not rows:
        return 0, 0
    first = parse_iso(rows[0]["published"])
    open_ = db.execute("SELECT id, first_item, last_item, centroid, n_items FROM stories WHERE last_item >= ?", (iso(first - WINDOW),)).fetchall()
    ids = [s["id"] for s in open_]
    start = [parse_iso(s["first_item"]) for s in open_]
    last = [parse_iso(s["last_item"]) for s in open_]
    sums = [vec(s["centroid"]) * s["n_items"] for s in open_]  # centroids are stored as means
    counts = [s["n_items"] for s in open_]
    started = 0
    for r in rows:
        t, v = parse_iso(r["published"]), vec(r["embedding"])
        alive = [k for k in range(len(ids)) if t - last[k] <= WINDOW and t - start[k] <= SPAN]
        best, best_score, near, near_score = None, -1.0, None, None
        if alive:
            cents = np.stack([sums[k] / np.linalg.norm(sums[k]) for k in alive])
            scores = cents @ v
            order = np.argsort(-scores)
            best, best_score = alive[order[0]], float(scores[order[0]])
            if best_score < tau and best_score >= tau - NEAR:
                near, near_score = ids[best], best_score
        if best is not None and best_score >= tau:
            sums[best] = sums[best] + v
            counts[best] += 1
            last[best] = max(last[best], t)
            sid, score = ids[best], best_score
        else:
            cur = db.execute("INSERT INTO stories (created, first_item, last_item, centroid, n_items) VALUES (?, ?, ?, ?, 0)",
                             (iso(now()), r["published"], r["published"], v.tobytes()))
            ids.append(cur.lastrowid)
            sums.append(v.copy())
            counts.append(1)
            start.append(t)
            last.append(t)
            sid, score = cur.lastrowid, 1.0
            started += 1
        db.execute("UPDATE items SET story_id = ?, score = ?, near_story = ?, near_score = ? WHERE id = ?",
                   (sid, score, near, near_score, r["id"]))
    for k, sid in enumerate(ids):
        mean = sums[k] / counts[k]
        db.execute("UPDATE stories SET centroid = ?, n_items = ?, last_item = ?,"
                   " first_item = (SELECT MIN(published) FROM items WHERE story_id = ?) WHERE id = ?",
                   (mean.astype(np.float32).tobytes(), counts[k], iso(last[k]), sid, sid))
    db.commit()
    return len(rows), started


def drop_skipped(db: sqlite3.Connection, skip: list[re.Pattern]) -> int:
    """Delete stored items whose title now matches skip_titles (the list can grow after a fetch)."""
    ids = [(r["id"],) for r in db.execute("SELECT id, title FROM items") if any(p.search(r["title"]) for p in skip)]
    db.executemany("DELETE FROM items WHERE id = ?", ids)
    db.commit()
    return len(ids)


def recluster(db: sqlite3.Connection, tau: float) -> tuple[int, int]:
    db.execute("UPDATE items SET story_id = NULL, score = NULL, near_story = NULL, near_score = NULL")
    db.execute("DELETE FROM stories")
    db.commit()
    return cluster(db, tau)


# LLM enrichment


class LLMError(RuntimeError):
    pass


def strip_fences(text: str) -> str:
    text = text.strip()
    if m := re.search(r"```(?:json)?\s*(.*?)```", text, re.S):
        text = m.group(1).strip()
    return text[text.find("{"):] if "{" in text else text


def call_claude(model: str, system: str, user: str, schema: dict) -> dict:
    """claude -p on the Claude Code login: the subscription, not the API."""
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    cmd = ["claude", "-p", "--model", model, "--tools", "", "--no-session-persistence", "--output-format", "json",
           "--json-schema", json.dumps(schema), "--system-prompt", system]
    out = run(cmd, user, env)
    try:
        data = json.loads(out)
    except json.JSONDecodeError as err:
        raise LLMError(f"claude: no JSON envelope ({out[:200]})") from err
    if data.get("is_error") or "structured_output" not in data:
        raise LLMError(f"claude: {data.get('result') or data.get('subtype') or 'no structured_output'}"[:300])
    return data["structured_output"]


def call_opencode(model: str, system: str, user: str, schema: dict) -> dict:
    """opencode run on OpenCode Go. No schema mode: the schema goes in the prompt and the answer is validated."""
    prompt = f"{system}\n\nAnswer with one JSON object only, no prose, valid against this JSON schema:\n{json.dumps(schema)}\n\n{user}"
    out = run(["opencode", "run", "--standalone", "-m", f"opencode-go/{model}", "--format", "json", prompt], None, None)
    text = "".join(e["part"].get("text", "") for line in out.splitlines() if line.startswith("{")
                   for e in [json.loads(line)] if e.get("type") == "text")
    try:
        return json.loads(strip_fences(text))
    except json.JSONDecodeError as err:
        raise LLMError(f"opencode: answer is not JSON ({text[:200]})") from err


def call_ollama(model: str, system: str, user: str, schema: dict) -> dict:
    body = {"model": model, "stream": False, "format": schema, "options": {"temperature": 0, "num_ctx": 16384},
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]}
    req = urllib.request.Request(f"{OLLAMA}/api/chat", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=900) as resp:
            text = json.load(resp)["message"]["content"]
    except (urllib.error.URLError, TimeoutError) as err:
        raise LLMError(f"ollama: {getattr(err, 'reason', err)}") from err
    try:
        return json.loads(text)
    except json.JSONDecodeError as err:
        raise LLMError(f"ollama: answer is not JSON ({text[:200]})") from err


PROVIDERS = {"claude": call_claude, "opencode": call_opencode, "ollama": call_ollama}


def run(cmd: list[str], stdin: str | None, env: dict | None) -> str:
    if not shutil.which(cmd[0]):
        raise LLMError(f"{cmd[0]}: not on PATH")
    try:
        res = subprocess.run(cmd, input=stdin, capture_output=True, text=True, env=env, timeout=600,
                             stdin=None if stdin is not None else subprocess.DEVNULL)
    except subprocess.TimeoutExpired as err:
        raise LLMError(f"{cmd[0]}: timeout") from err
    if res.returncode != 0:
        raise LLMError(f"{cmd[0]}: exit {res.returncode} {(res.stderr or res.stdout).strip()[-300:]}")
    return res.stdout


def complete(chain: list[str], system: str, user: str, schema: dict, verbose: bool = False) -> tuple[dict, str]:
    """Try each <provider>:<model> of the chain until one returns a valid answer."""
    errors = []
    for spec in chain:
        provider, _, model = spec.partition(":")
        if provider not in PROVIDERS or not model:
            errors.append(f"{spec}: unknown provider (claude, opencode, ollama)")
            continue
        t0 = time.monotonic()
        try:
            out = PROVIDERS[provider](model, system, user, schema)
            jsonschema.validate(out, schema)
        except (LLMError, jsonschema.ValidationError) as err:
            errors.append(f"{spec}: {getattr(err, 'message', err)}"[:300])
            print(f"  ! {errors[-1]}", file=sys.stderr)
            continue
        if verbose:
            print(f"  {spec}: {time.monotonic() - t0:.1f} s")
        return out, spec
    raise LLMError("; ".join(errors))


def enrich_schema(groups: list[str]) -> dict:
    return {
        "type": "object", "additionalProperties": False, "required": ["stories", "pairs"],
        "properties": {
            "stories": {"type": "array", "items": {
                "type": "object", "additionalProperties": False, "required": ["id", "group", "title", "summary", "framing"],
                "properties": {
                    "id": {"type": "integer"},
                    "group": {"type": "string", "enum": groups},
                    "title": {"type": "string"},
                    "summary": {"type": "array", "items": {"type": "string"}, "minItems": 1, "maxItems": 3},
                    "framing": {"type": "array", "items": {
                        "type": "object", "additionalProperties": False, "required": ["h", "label"],
                        "properties": {"h": {"type": "integer"}, "label": {"type": "string", "enum": FRAMINGS}}}},
                }}},
            "pairs": {"type": "array", "items": {
                "type": "object", "additionalProperties": False, "required": ["pair", "same"],
                "properties": {"pair": {"type": "integer"}, "same": {"type": "boolean"}}}},
        },
    }


def enrich_system(cfg: dict) -> str:
    groups = "\n".join(f"- {gid}: {g['description']}" for gid, g in cfg["groups"].items())
    return f"""You prepare stories for a personal news reader. A story is a set of headlines from different outlets that an embedding model put together as one event. Each headline has a number h, the outlet, the title and the first lines of the article.

For each story return:
- id: the story id as given.
- group: the one group below that fits the story best. Sport, culture, crime, weather, science and celebrity news go to other.
- title: a neutral, factual title in {LANG}, at most 90 characters, that says who did what.
- summary: 2 or 3 short bullets in {LANG}. Only facts that the headlines and ledes state; no opinion, no background from memory.
- framing: one entry per headline h, the framing of its title towards the main actor of the story. neutral reports the facts; favourable uses positive words or stresses success or sympathy; critical uses negative words or stresses failure, blame or scandal. When unsure, neutral.

For each pair (A and B are a story above or the titles of another story) return same = true only when both report the same concrete event (the same decision, vote, result or incident), not only the same topic or actor. A preview and the result of the same vote or event are different events.

Groups:
{groups}"""


def headlines(rows: list) -> list:
    """One headline per outlet, the first one it published, at most MAX_HEADLINES."""
    seen, out = set(), []
    for r in rows:
        if r["outlet"] not in seen:
            seen.add(r["outlet"])
            out.append(r)
    return out[:MAX_HEADLINES]


def story_items(db: sqlite3.Connection, sid: int) -> list:
    return db.execute("SELECT id, outlet, lean, title, lede FROM items WHERE story_id = ? ORDER BY published, id", (sid,)).fetchall()


def pending_stories(db: sqlite3.Connection, since: datetime, min_outlets: int, force: bool) -> list[int]:
    """Stories of the window with min_outlets or more, never enriched or with a new outlet since."""
    rows = db.execute(
        "SELECT s.id, s.enriched_outlets, COUNT(DISTINCT i.outlet) n FROM stories s JOIN items i ON i.story_id = s.id"
        " WHERE s.last_item >= ? GROUP BY s.id HAVING n >= ? ORDER BY n DESC, s.last_item DESC",
        (iso(since), min_outlets)).fetchall()
    return [r["id"] for r in rows if force or r["enriched_outlets"] != r["n"]]


def pending_pairs(db: sqlite3.Connection, sids: list[int]) -> list[tuple[int, int]]:
    """Story pairs just under tau (near_story of an item) that touch the batch and were never asked."""
    if not sids:
        return []
    marks = ",".join("?" * len(sids))
    rows = db.execute(
        f"SELECT DISTINCT i.story_id a, i.near_story b FROM items i JOIN stories s ON s.id = i.near_story"
        f" WHERE i.near_story IS NOT NULL AND i.near_story != i.story_id AND (i.story_id IN ({marks}) OR i.near_story IN ({marks}))",
        sids + sids).fetchall()
    asked = {(r["a"], r["b"]) for r in db.execute("SELECT a, b FROM merge_checks")}
    pairs = {tuple(sorted((r["a"], r["b"]))) for r in rows}
    return sorted(p for p in pairs if p not in asked)


def batch_prompt(db: sqlite3.Connection, sids: list[int], pairs: list[tuple[int, int]], names: dict[str, str]) -> tuple[str, dict]:
    """The user message and the map h -> item id of each story."""
    lines, hmap = ["Stories:"], {}
    for sid in sids:
        lines.append(f"\nstory {sid}")
        hmap[sid] = {}
        for h, r in enumerate(headlines(story_items(db, sid)), 1):
            hmap[sid][h] = r["id"]
            lede = clean(r["lede"] or "", 220)
            lines.append(f"  h{h} [{names.get(r['outlet'], r['outlet'])}] {r['title']}" + (f" — {lede}" if lede else ""))
    if pairs:
        lines.append("\nPairs:")
        def side(sid: int) -> str:  # a story of the batch by its id, any other by its first titles
            return f"story {sid}" if sid in hmap else " | ".join(r["title"] for r in headlines(story_items(db, sid))[:2])
        for k, (a, b) in enumerate(pairs, 1):
            lines.append(f"  pair {k}: A = {side(a)}  ·  B = {side(b)}")
    return "\n".join(lines), hmap


def merge_stories(db: sqlite3.Connection, keep: int, drop: int) -> None:
    """Move the items of drop into keep; keep is enriched again on the next run."""
    db.execute("UPDATE items SET story_id = ? WHERE story_id = ?", (keep, drop))
    db.execute("UPDATE items SET near_story = NULL, near_score = NULL WHERE story_id = ? AND near_story IN (?, ?)", (keep, keep, drop))
    db.execute("UPDATE items SET near_story = ? WHERE near_story = ?", (keep, drop))
    embs = [vec(r["embedding"]) for r in db.execute("SELECT embedding FROM items WHERE story_id = ? AND embedding IS NOT NULL", (keep,))]
    db.execute("UPDATE stories SET centroid = ?, n_items = ?, first_item = (SELECT MIN(published) FROM items WHERE story_id = ?),"
               " last_item = (SELECT MAX(published) FROM items WHERE story_id = ?), enriched_outlets = NULL WHERE id = ?",
               (np.mean(embs, axis=0).astype(np.float32).tobytes(), len(embs), keep, keep, keep))
    db.execute("DELETE FROM stories WHERE id = ?", (drop,))


def enrich(db: sqlite3.Connection, cfg: dict, chain: list[str], since: datetime, min_outlets: int = 2,
           limit: int | None = None, batch: int = BATCH, force: bool = False, dry_run: bool = False,
           verbose: bool = False) -> dict:
    """Enrich the pending stories in batches. Returns counts; a failed batch stays pending for the next run."""
    names, groups = outlet_names(cfg), list(cfg["groups"])
    system, schema = enrich_system(cfg), enrich_schema(groups)
    sids = pending_stories(db, since, min_outlets, force)[:limit]
    stats = {"stories": 0, "failed": 0, "merged": 0, "pairs": 0, "seconds": 0.0, "llm": set(), "results": []}
    for i in range(0, len(sids), batch):
        chunk = sids[i : i + batch]
        pairs = pending_pairs(db, chunk)[:batch]
        user, hmap = batch_prompt(db, chunk, pairs, names)
        if verbose:
            print(f"  batch {i // batch + 1}: {len(chunk)} stories, {len(pairs)} pairs, {len(user)} chars")
        t0 = time.monotonic()
        try:
            out, spec = complete(chain, system, user, schema, verbose)
        except LLMError as err:
            print(f"  ! batch {i // batch + 1} failed on every provider: {err}"[:500], file=sys.stderr)
            stats["failed"] += len(chunk)
            continue
        stats["seconds"] += time.monotonic() - t0
        stats["llm"].add(spec)
        stats["results"].append({"llm": spec, "prompt": user, "answer": out})
        if dry_run:
            stats["stories"] += sum(1 for s in out["stories"] if s["id"] in hmap)
            continue
        stamp = iso(now())
        for s in out["stories"]:
            if s["id"] not in hmap:
                continue
            n = db.execute("SELECT COUNT(DISTINCT outlet) FROM items WHERE story_id = ?", (s["id"],)).fetchone()[0]
            db.execute("UPDATE stories SET grp = ?, title = ?, summary = ?, enriched_outlets = ?, enriched = ?, llm = ? WHERE id = ?",
                       (s["group"], s["title"].strip(), json.dumps(s["summary"], ensure_ascii=False), n, stamp, spec, s["id"]))
            for f in s["framing"]:
                if item := hmap[s["id"]].get(f["h"]):
                    db.execute("UPDATE items SET framing = ? WHERE id = ?", (f["label"], item))
            stats["stories"] += 1
        for p in out["pairs"]:
            if not 1 <= p["pair"] <= len(pairs):
                continue
            a, b = pairs[p["pair"] - 1]
            db.execute("INSERT OR REPLACE INTO merge_checks (a, b, same, llm, checked) VALUES (?, ?, ?, ?, ?)", (a, b, int(p["same"]), spec, stamp))
            stats["pairs"] += 1
            if p["same"] and db.execute("SELECT COUNT(*) FROM stories WHERE id IN (?, ?)", (a, b)).fetchone()[0] == 2:
                merge_stories(db, a, b)
                stats["merged"] += 1
        stats["failed"] += sum(1 for sid in chunk if sid not in {s["id"] for s in out["stories"]})
        db.commit()
    return stats


def llm_chain(first: str) -> list[str]:
    return [first] + [x for x in LLM_FALLBACK if x != first]


def enrich_line(st: dict) -> str:
    return (f"enrich: {st['stories']} stories, {st['failed']} failed, {st['pairs']} pairs asked, {st['merged']} merged"
            f" ({', '.join(sorted(st['llm'])) or 'no llm'}, {st['seconds']:.0f} s)")


def coverage(leans: list[str]) -> dict:
    """L / C / R counts of the outlets of a story and its blind spot: 3+ outlets and none from one side."""
    counts = {"L": 0, "C": 0, "R": 0}
    for lean in leans:
        if side := LEAN_SIDE.get(lean, ""):
            counts[side] += 1
    blind = None
    if len(leans) >= 3:
        blind = "R" if counts["R"] == 0 and counts["L"] else "L" if counts["L"] == 0 and counts["R"] else None
    return {**counts, "blindspot": blind}


# Notes


def local(value: str) -> str:
    return parse_iso(value).astimezone().strftime("%Y-%m-%d %H:%M")


def safe_name(text: str) -> str:
    text = re.sub(r'[\\/:*?"<>|#^\[\]]', "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return (text if len(text) <= 90 else text[:90].rsplit(" ", 1)[0]).rstrip(" .,;")


def read_front(path: Path) -> dict:
    text = path.read_text()
    if not text.startswith("---\n") or (end := text.find("\n---", 4)) < 0:
        return {}
    try:
        return yaml.safe_load(text[4:end]) or {}
    except yaml.YAMLError:
        return {}


def yaml_value(v) -> str:
    if v is None or v == "" or v == []:
        return ""
    if isinstance(v, list):
        return "".join(f"\n  - {yaml_value(x)}" for x in v)
    if isinstance(v, bool) or isinstance(v, (int, float)):
        return str(v).lower() if isinstance(v, bool) else str(v)
    v = str(v)
    if re.fullmatch(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}", v):  # dates stay bare, as in every vault note
        return v
    return json.dumps(v, ensure_ascii=False) if re.search(r'[\[\]:#{}"\'&*!|>%@`,]', v) or v != v.strip() else v


def front_text(front: dict) -> str:
    lines = ["---"]
    for k, v in front.items():
        val = yaml_value(v)
        lines.append(f"{k}:{'' if not val or val.startswith(chr(10)) else ' '}{val}")
    return "\n".join(lines) + "\n---\n"


def news_notes() -> dict[int, tuple[Path, dict]]:
    """story_id -> (path, frontmatter) of every news note, kept ones included."""
    notes = {}
    if NEWS_DIR.exists():
        for path in NEWS_DIR.rglob("*.md"):
            front = read_front(path)
            if front.get("file_class") == "news" and isinstance(front.get("story_id"), int):
                notes[front["story_id"]] = (path, front)
    return notes


def dismissed() -> set[int]:
    try:
        return set(json.loads(DISMISSED.read_text()))
    except (OSError, ValueError):
        return set()


def renderable(db: sqlite3.Connection) -> list:
    since = iso(now() - timedelta(days=KEEP_DAYS))
    return db.execute(
        "SELECT s.id, s.grp, s.title, s.summary, s.first_item, s.enriched, s.n_items, COUNT(DISTINCT i.outlet) n"
        " FROM stories s JOIN items i ON i.story_id = s.id WHERE s.grp IS NOT NULL AND s.grp != 'other' AND s.last_item >= ?"
        " GROUP BY s.id HAVING n >= 2", (since,)).fetchall()


def note_body(name: str, story, items: list, names: dict[str, str]) -> tuple[str, dict]:
    outlets = {}
    for it in items:
        outlets.setdefault(it["outlet"], it["lean"])
    cov = coverage(list(outlets.values()))
    lines = [f"# [[{name}]]", f"> [!abstract] {story['title']}"]
    lines += [f"> - {b}" for b in json.loads(story["summary"] or "[]")]
    if cov["blindspot"]:
        side = "the right" if cov["blindspot"] == "R" else "the left"
        lines += ["", f"> [!warning] Blind spot: no outlet of {side} covers this story"]
    lines += ["", f"## Coverage · {cov['L']} L · {cov['C']} C · {cov['R']} R", ""]
    order = {"L": 0, "C": 1, "R": 2, "": 3}
    for it in sorted(items, key=lambda r: (order[LEAN_SIDE.get(r["lean"], "")], names.get(r["outlet"], r["outlet"]), r["published"])):
        side = LEAN_SIDE.get(it["lean"], "") or "-"
        title = it["title"].replace("[", "(").replace("]", ")")
        framing = f" · framing: {it['framing']}" if it["framing"] and it["framing"] != "neutral" else ""
        lines.append(f"- [{side}] {names.get(it['outlet'], it['outlet'])} · [{title}]({it['url']}){framing}")
    lines += ["", "Framing is the LLM label of the headline towards the main actor: a weak hint, never the main signal.", ""]
    return "\n".join(lines), cov


def render(db: sqlite3.Connection, cfg: dict) -> dict:
    """Create or rewrite the inbox note of each renderable story."""
    names = outlet_names(cfg)
    notes = news_notes()
    taken = {p.name for p, _ in notes.values()}
    NEWS_DIR.mkdir(parents=True, exist_ok=True)
    stats = {"created": 0, "updated": 0}
    gone = dismissed()
    for st in renderable(db):
        if st["id"] in gone:
            continue
        path, old = notes.get(st["id"], (None, {}))
        if old and (old.get("status") != "inbox" or KEPT_DIR in path.parents):
            continue  # kept: the note is mine now
        items = db.execute("SELECT outlet, lean, title, url, published, framing FROM items WHERE story_id = ? ORDER BY published",
                           (st["id"],)).fetchall()
        if path is None:
            base = safe_name(f"{local(st['first_item'])[:10]} {st['title']}")
            name, k = base, 2
            while f"{name}.md" in taken:
                name, k = f"{base} ({k})", k + 1
            path = NEWS_DIR / f"{name}.md"
            taken.add(path.name)
        body, cov = note_body(path.stem, st, items, names)
        front = {
            "file_class": "news", "paras": old.get("paras"), "type": "[[Resources]]",
            "subtypes": ["[[External Knowledge - Resources - news|news]]"], "rate": old.get("rate"), "tags": old.get("tags"),
            "status": "inbox", "maturity": "capture", "created": old.get("created") or now().astimezone().strftime("%Y-%m-%d %H:%M"),
            "group": st["grp"], "story_id": st["id"], "outlets": st["n"], "blindspot": cov["blindspot"],
            "first_seen": local(st["first_item"]),
        }
        text = front_text(front) + body
        if path.exists() and path.read_text() == text:
            continue
        stats["updated" if path.exists() else "created"] += 1
        path.write_text(text)
    return stats


def purge(db: sqlite3.Connection) -> dict:
    """Move done notes to _kept/, delete old or orphan inbox notes and old database rows."""
    limit = now() - timedelta(days=KEEP_DAYS)
    live = {r[0] for r in db.execute("SELECT id FROM stories")}
    stats = {"kept": 0, "deleted": 0, "rows": 0}
    kept_ids = set()
    for sid, (path, front) in news_notes().items():
        if front.get("status") != "inbox":
            kept_ids.add(sid)
            if KEPT_DIR not in path.parents:
                KEPT_DIR.mkdir(parents=True, exist_ok=True)
                path.rename(KEPT_DIR / path.name)
                stats["kept"] += 1
            continue
        try:
            seen = datetime.strptime(str(front.get("first_seen")), "%Y-%m-%d %H:%M").astimezone()
        except ValueError:
            seen = now()
        if sid not in live or seen < limit:
            path.unlink()
            stats["deleted"] += 1
    old = [r[0] for r in db.execute("SELECT id FROM stories WHERE last_item < ?", (iso(limit),)) if r[0] not in kept_ids]
    for k in range(0, len(old), 500):
        chunk = old[k : k + 500]
        marks = ",".join("?" * len(chunk))
        stats["rows"] += db.execute(f"DELETE FROM items WHERE story_id IN ({marks})", chunk).rowcount
        db.execute(f"DELETE FROM stories WHERE id IN ({marks})", chunk)
        db.execute(f"DELETE FROM merge_checks WHERE a IN ({marks}) OR b IN ({marks})", chunk + chunk)
    stats["rows"] += db.execute("DELETE FROM items WHERE story_id IS NULL AND published < ?", (iso(limit),)).rowcount
    db.commit()
    if gone := dismissed():
        live = {r[0] for r in db.execute("SELECT id FROM stories")}
        DISMISSED.write_text(json.dumps(sorted(gone & live)))
    return stats


def export(db: sqlite3.Connection, cfg: dict, days: int = 3) -> int:
    """news.json: the stories of the last days for the News pane, the biggest first."""
    names = outlet_names(cfg)
    notes = {sid: (str(p.relative_to(VAULT)), front.get("status") != "inbox") for sid, (p, front) in news_notes().items()}
    rows = db.execute(
        "SELECT s.id, s.grp, s.title, s.summary, s.first_item, s.last_item, i.outlet, i.lean, i.title ititle, i.url, i.published, i.framing, i.groups"
        " FROM stories s JOIN items i ON i.story_id = s.id WHERE s.last_item >= ? ORDER BY s.id, i.published",
        (iso(now() - timedelta(days=days)),)).fetchall()
    stories: dict[int, dict] = {}
    for r in rows:
        s = stories.setdefault(r["id"], {
            "id": r["id"], "group": r["grp"] or (json.loads(r["groups"] or "[]") or ["other"])[0], "enriched": r["grp"] is not None,
            "title": r["title"] or r["ititle"], "summary": json.loads(r["summary"] or "[]"), "first": r["first_item"],
            "last": r["last_item"], "note": notes.get(r["id"], (None, False))[0], "kept": notes.get(r["id"], (None, False))[1], "items": []})
        s["items"].append({"outlet": r["outlet"], "name": names.get(r["outlet"], r["outlet"]), "side": LEAN_SIDE.get(r["lean"], ""),
                           "title": r["ititle"], "url": r["url"], "published": r["published"], "framing": r["framing"]})
    out = []
    for s in stories.values():
        outlets = {}
        for it in s["items"]:
            outlets.setdefault(it["outlet"], it["side"])
        s["outlets"] = len(outlets)
        cov = coverage([{"L": "left", "C": "centre", "R": "right"}.get(x, "none") for x in outlets.values()])
        s["coverage"] = {k: cov[k] for k in ("L", "C", "R")}
        s["blindspot"] = cov["blindspot"]
        out.append(s)
    out.sort(key=lambda s: s["last"], reverse=True)
    out.sort(key=lambda s: s["outlets"], reverse=True)
    groups = [{"id": gid, "label": g["label"]} for gid, g in cfg["groups"].items()]
    tmp = EXPORT.with_suffix(".tmp")
    tmp.write_text(json.dumps({"generated": iso(now()), "groups": groups, "stories": out}, ensure_ascii=False))
    tmp.replace(EXPORT)
    return len(out)


# Stream: the follows of sources.yaml, a 30-day queue with no clustering and no LLM


def stream_days(cfg: dict) -> int:
    return int((cfg.get("stream") or {}).get("days", STREAM_DAYS))


def follows(cfg: dict) -> list[Follow]:
    return [Follow(f["url"], f.get("name") or f["url"], f.get("folder") or "Uncategorized", f.get("kind") or kind_of(f["url"]),
                   int(f.get("limit", STREAM_LIMIT)))
            for f in cfg.get("follows") or [] if f.get("enabled", True)]


def kind_of(url: str, parsed=None) -> str:
    host = urllib.parse.urlsplit(url).netloc.lower()
    if host.endswith("youtube.com"):
        return "youtube"
    if host.endswith("arxiv.org"):
        return "papers"
    if host.endswith(("kill-the-newsletter.com", "substack.com")):
        return "newsletter"
    if parsed is not None and any(str(x.get("type", "")).startswith("audio")
                                  for e in parsed.entries[:5] for x in e.get("enclosures", [])):
        return "podcast"
    return "blog"


def entry_thumb(e) -> str:
    for m in e.get("media_thumbnail") or []:
        if m.get("url"):
            return m["url"]
    for m in e.get("media_content") or []:
        if m.get("url") and (m.get("medium") == "image" or re.search(r"\.(jpe?g|png|webp|gif)(\?|$)", m["url"], re.I)):
            return m["url"]
    if href := (e.get("image") or {}).get("href"):  # podcast episode art
        return href
    body = (e.get("content") or [{}])[0].get("value", "") or e.get("summary", "")
    if m := re.search(r'<img[^>]+src="(https?://[^"]+)"', body):
        return html.unescape(m.group(1))
    return ""


def parse_stream(f: Follow, body: bytes, fetched: datetime, since: datetime) -> list[dict]:
    parsed = feedparser.parse(body)
    if parsed.bozo and not parsed.entries:
        raise SyncError(f"not a feed: {parsed.bozo_exception}")
    items = []
    for e in parsed.entries:
        link, title = e.get("link"), clean(e.get("title", ""), 300)
        if not link or not title:
            continue
        published = min(entry_time(e) or fetched, fetched)
        if published < since:
            continue
        items.append({"url": canonical(link), "feed_url": f.url, "title": title, "lede": clean(e.get("summary", ""), 800),
                      "author": clean(e.get("author", ""), 80), "thumb": entry_thumb(e), "published": iso(published), "fetched": iso(fetched)})
    items.sort(key=lambda it: it["published"], reverse=True)
    return items[: f.limit]


def fetch_stream(db: sqlite3.Connection, fl: list[Follow], since: datetime, full: bool = False, verbose: bool = False) -> int:
    """New items of the follows; full skips the conditional GET (a longer span needs the old items again)."""
    state = {r["url"]: r for r in db.execute("SELECT url, etag, modified FROM feeds")}
    fetched = now()

    def one(f: Follow):
        s = None if full else state.get(f.url)
        try:
            status, body, headers = http_get(f.url, s and s["etag"], s and s["modified"])
            return f, status, parse_stream(f, body, fetched, since) if status != 304 else [], headers, None
        except SyncError as err:
            return f, None, [], {}, str(err)

    total = 0
    with cf.ThreadPoolExecutor(max_workers=8) as pool:
        for f, status, items, headers, error in pool.map(one, fl):
            new = 0
            for it in items:
                new += db.execute(
                    "INSERT OR IGNORE INTO stream (url, feed_url, title, lede, author, thumb, published, fetched)"
                    " VALUES (:url, :feed_url, :title, :lede, :author, :thumb, :published, :fetched)", it).rowcount
            save_state(db, f.url, f"follow:{f.name}", headers, fetched, status, error, new)
            total += new
            if error:
                print(f"  ! {f.name[:16]:16} {error}  {f.url}", file=sys.stderr)
            elif verbose:
                print(f"  {f.name[:16]:16} {status}  +{new}  {f.url}")
    db.commit()
    return total


def stream_marks() -> dict[str, str]:
    try:
        return json.loads(STREAM_MARKS.read_text())
    except (OSError, ValueError):
        return {}


def purge_stream(db: sqlite3.Connection, cfg: dict) -> int:
    """Delete the unkept items older than the span (30 days at least) or of a follow no longer in the list."""
    marks = stream_marks()
    limit = iso(now() - timedelta(days=max(KEEP_DAYS, stream_days(cfg))))
    live = {f.url for f in follows(cfg)}
    gone = [r["url"] for r in db.execute("SELECT url, feed_url, published FROM stream")
            if marks.get(r["url"]) != "kept" and (r["published"] < limit or r["feed_url"] not in live)]
    for k in range(0, len(gone), 500):
        chunk = gone[k : k + 500]
        db.execute(f"DELETE FROM stream WHERE url IN ({','.join('?' * len(chunk))})", chunk)
    db.commit()
    if gone and marks:
        left = {r[0] for r in db.execute("SELECT url FROM stream")}
        if len(kept := {u: m for u, m in marks.items() if u in left}) < len(marks):
            STREAM_MARKS.write_text(json.dumps(kept))
    return len(gone)


def export_stream(db: sqlite3.Connection, cfg: dict) -> int:
    """stream.json: the folders and follows with their counts, and the items of the span, the newest first."""
    days, marks, fl = stream_days(cfg), stream_marks(), follows(cfg)
    by_url = {f.url: f for f in fl}
    state = {r["url"]: r for r in db.execute("SELECT url, last_fetch, last_error FROM feeds")}
    rows = db.execute("SELECT * FROM stream WHERE published >= ? ORDER BY published DESC",
                      (iso(now() - timedelta(days=days)),)).fetchall()
    items, counts = [], {}
    for r in rows:
        if r["feed_url"] not in by_url or marks.get(r["url"]) == "dismissed":
            continue
        counts[r["feed_url"]] = counts.get(r["feed_url"], 0) + 1
        items.append({k: r[k] for k in ("url", "title", "lede", "author", "thumb", "published")} | {"feed": r["feed_url"], "kept": marks.get(r["url"]) == "kept"})
    folders: dict[str, list] = {}
    for f in fl:
        s = state.get(f.url)
        folders.setdefault(f.folder, []).append({"url": f.url, "name": f.name, "kind": f.kind, "count": counts.get(f.url, 0),
                                                 "last_fetch": s and s["last_fetch"], "error": s and s["last_error"]})
    out = {"generated": iso(now()), "days": days, "folders": [{"name": k, "feeds": v} for k, v in folders.items()], "items": items}
    tmp = STREAM_EXPORT.with_suffix(".tmp")
    tmp.write_text(json.dumps(out, ensure_ascii=False))
    tmp.replace(STREAM_EXPORT)
    return len(items)


def run_stream(db: sqlite3.Connection, cfg: dict, fl: list[Follow] | None = None, full: bool = False, verbose: bool = False) -> str:
    n = fetch_stream(db, follows(cfg) if fl is None else fl, now() - timedelta(days=stream_days(cfg)), full, verbose)
    gone = purge_stream(db, cfg)
    return f"stream: {n} new items, {gone} purged, {export_stream(db, cfg)} in the last {stream_days(cfg)} days"


# Follow editing: the stream and follows keys of sources.yaml are rewritten,
# grouped by folder; everything above them is kept as it is.


def get_page(url: str) -> tuple[str, bytes]:
    headers = {"User-Agent": UA, "Accept-Language": "en,es;q=0.8"}
    if "youtube.com" in urllib.parse.urlsplit(url).netloc:
        headers["Cookie"] = "SOCS=CAI"  # skips the EU consent page
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=20, context=SSL) as resp:
            return resp.geturl(), resp.read(5_000_000)
    except urllib.error.HTTPError as err:
        raise SyncError(f"GET {url} -> HTTP {err.code}") from err
    except (urllib.error.URLError, TimeoutError, ConnectionError) as err:
        raise SyncError(f"GET {url} -> {getattr(err, 'reason', err)}") from err


def resolve_feed(url: str):
    """The feed of a url: the url itself, the feed a page links (rel alternate), or a YouTube channel feed."""
    url = url.strip()
    if not re.match(r"https?://", url):
        url = "https://" + url
    final, body = get_page(url)
    parsed = feedparser.parse(body)
    if parsed.entries or parsed.feed.get("title") and not parsed.bozo:
        return final, parsed
    page = body.decode("utf-8", errors="replace")
    links = []
    for tag in re.findall(r"<link\b[^>]*>", page, re.I):
        if re.search(r"""rel=["']?alternate""", tag, re.I) and re.search(r"application/(rss|atom)\+xml", tag, re.I):
            if m := re.search(r"""href=["']([^"']+)""", tag, re.I):
                links.append(urllib.parse.urljoin(final, html.unescape(m.group(1))))
    if not links and (m := re.search(r'"(?:externalId|channelId)":"(UC[\w-]{22})"', page)):
        links.append(f"https://www.youtube.com/feeds/videos.xml?channel_id={m.group(1)}")
    links = [u for u in links if "/comments/" not in u] or links  # WordPress links the comments feed too
    if not links:
        raise SyncError(f"no feed found at {url}")
    final, body = get_page(links[0])
    parsed = feedparser.parse(body)
    if not (parsed.entries or parsed.feed.get("title")):
        raise SyncError(f"not a feed: {links[0]}")
    return final, parsed


def yaml_flow(f: dict) -> str:
    keys = [k for k in FOLLOW_KEYS if f.get(k) not in (None, "")] + [k for k in f if k not in FOLLOW_KEYS]
    return "{" + ", ".join(f"{k}: {json.dumps(f[k], ensure_ascii=False)}" for k in keys) + "}"  # JSON is YAML flow


def write_follows(raw: list[dict], days: int) -> None:
    text = SOURCES.read_text()
    start = re.search(r"^(stream|follows):", text, re.M)
    head = text[: start.start()] if start else text.rstrip() + "\n\n"
    rest = text[start.start():] if start else ""
    tail = re.search(r"^(?!stream:|follows:)[A-Za-z_]+:", rest, re.M)
    lines = [
        "stream:",
        f"  days: {days}  # how far back the Stream pane looks; edited from the pane",
        "",
        "follows:",
        "  # Edited from the Stream pane (feeds_sync.py follow). folder groups the feeds in",
        "  # the pane; kind: youtube | podcast | blog | newsletter | papers (detected when",
        "  # left out); limit: newest items stored per fetch (default 30).",
    ]
    folder = lambda f: f.get("folder") or "Uncategorized"
    order = list(dict.fromkeys(map(folder, raw)))
    raw = sorted(raw, key=lambda f: order.index(folder(f)))  # stable: the order inside a folder is kept
    for name in order:
        lines.append(f"  # {name}")
        lines += [f"  - {yaml_flow(f)}" for f in raw if folder(f) == name]
    new = head + "\n".join(lines) + "\n" + ("\n" + rest[tail.start():] if tail else "")
    check = yaml.safe_load(new)
    if check.get("follows") != raw or stream_days(check) != days:
        raise SyncError("sources.yaml: the rewrite does not read back the same follows; nothing written")
    SOURCES.write_text(new)


def follow_cmd(db: sqlite3.Connection, cfg: dict, args) -> str:
    raw = [dict(f) for f in cfg.get("follows") or []]
    days = stream_days(cfg)
    find = lambda url: next((f for f in raw if f["url"] == url), None)

    def need(url):
        if not (f := find(url)):
            raise SyncError(f"not followed: {url}")
        return f

    if args.action == "list":
        for f in follows(cfg):
            print(f"  {f.folder[:14]:14} {f.kind:10} {f.name[:30]:30} {f.url}")
        return f"follow: {len(raw)} follows · span {days} days"
    if args.action == "add":
        url, parsed = resolve_feed(args.url)
        if find(url):
            raise SyncError(f"already followed: {url}")
        name = args.name or clean(parsed.feed.get("title", ""), 80) or urllib.parse.urlsplit(url).netloc
        entry = {"name": name, "folder": args.folder or "Uncategorized", "kind": kind_of(url, parsed), "url": url}
        write_follows(raw + [entry], days)
        cfg = load_sources()
        added = [f for f in follows(cfg) if f.url == url]
        line = run_stream(db, cfg, added, full=True)
        return f"follow: added {name} ({entry['kind']}) to {entry['folder']} · {line}"
    if args.action == "edit":
        f = need(args.url)
        for key in ("name", "folder", "kind"):
            if value := getattr(args, key):
                f[key] = value
        write_follows(raw, days)
        export_stream(db, load_sources())
        return f"follow: {f['name']} in {f.get('folder') or 'Uncategorized'}"
    if args.action == "remove":
        f = need(args.url)
        write_follows([x for x in raw if x is not f], days)
        cfg = load_sources()
        purge_stream(db, cfg)
        export_stream(db, cfg)
        return f"follow: removed {f.get('name') or f['url']}"
    if args.action == "folder":
        moved = [f for f in raw if (f.get("folder") or "Uncategorized") == args.old]
        if not moved:
            raise SyncError(f"no folder {args.old}")
        for f in moved:
            f["folder"] = args.new
        write_follows(raw, days)
        export_stream(db, load_sources())
        return f"follow: folder {args.old} -> {args.new} ({len(moved)} follows)"
    if args.action == "days":
        if args.days < 1:
            raise SyncError("days must be 1 or more")
        write_follows(raw, args.days)
        return run_stream(db, load_sources(), full=args.days > days)
    raise SyncError(f"unknown action {args.action}")


# Reports


def side_mix(leans: list[str]) -> str:
    c = coverage(leans)
    mark = f" · no {c['blindspot']}" if c["blindspot"] else ""
    return f"{c['L']} L · {c['C']} C · {c['R']} R{mark}"


def stories_report(db: sqlite3.Connection, since: datetime, min_outlets: int, limit: int, names: dict[str, str], as_json: bool) -> None:
    rows = db.execute(
        "SELECT s.id, s.first_item, s.last_item, s.grp, s.title stitle, s.summary, i.outlet, i.lean, i.title, i.url, i.published, i.score, i.framing"
        " FROM stories s JOIN items i ON i.story_id = s.id WHERE s.last_item >= ? ORDER BY s.id, i.published",
        (iso(since),)).fetchall()
    stories: dict[int, dict] = {}
    for r in rows:
        s = stories.setdefault(r["id"], {"id": r["id"], "first": r["first_item"], "last": r["last_item"], "group": r["grp"],
                                         "title": r["stitle"], "summary": json.loads(r["summary"] or "[]"), "items": []})
        s["items"].append({k: r[k] for k in ("outlet", "lean", "title", "url", "published", "score", "framing")})
    picked = []
    for s in stories.values():
        outlets = {}
        for it in s["items"]:
            outlets.setdefault(it["outlet"], it["lean"])
        s["outlets"], s["mix"], s["coverage"] = len(outlets), side_mix(list(outlets.values())), coverage(list(outlets.values()))
        if s["outlets"] >= min_outlets:
            picked.append(s)
    picked.sort(key=lambda s: s["last"], reverse=True)
    picked.sort(key=lambda s: s["outlets"], reverse=True)
    picked = picked[:limit]
    if as_json:
        print(json.dumps(picked, ensure_ascii=False, indent=1))
        return
    for s in picked:
        print(f"\n#{s['id']}  {s['outlets']} outlets · {s['mix']}  ({s['first'][5:16]} → {s['last'][5:16]})")
        if s["title"]:
            print(f"  {s['group']} · {s['title']}")
            for b in s["summary"]:
                print(f"    - {b}")
        for it in s["items"]:
            side = LEAN_SIDE.get(it["lean"], "") or "-"
            framing = f"  ({it['framing']})" if it["framing"] and it["framing"] != "neutral" else ""
            print(f"  [{side}] {names.get(it['outlet'], it['outlet'])[:18]:18} {it['score']:.2f}  {it['title'][:100]}{framing}")
    print(f"\n{len(picked)} stories shown · {len(stories)} stories in the window · {sum(len(s['items']) for s in stories.values())} items")


def pairs_report(db: sqlite3.Connection, since: datetime, lo: float, hi: float, limit: int, names: dict[str, str]) -> None:
    rows = db.execute("SELECT id, outlet, title, story_id, embedding FROM items WHERE published >= ? AND embedding IS NOT NULL",
                      (iso(since),)).fetchall()
    if len(rows) < 2:
        print("not enough items")
        return
    m = np.stack([vec(r["embedding"]) for r in rows])
    sims = m @ m.T
    iu = np.triu_indices(len(rows), k=1)
    vals = sims[iu]
    mask = (vals >= lo) & (vals < hi)
    found = [(float(vals[k]), iu[0][k], iu[1][k]) for k in np.nonzero(mask)[0]
             if rows[iu[0][k]]["story_id"] != rows[iu[1][k]]["story_id"]]
    found.sort(reverse=True)
    for score, a, b in found[:limit]:
        ra, rb = rows[a], rows[b]
        print(f"{score:.2f}  #{ra['story_id']} {names.get(ra['outlet'], ra['outlet'])[:14]:14} {ra['title'][:70]}")
        print(f"      #{rb['story_id']} {names.get(rb['outlet'], rb['outlet'])[:14]:14} {rb['title'][:70]}\n")
    print(f"{len(found)} cross-story pairs in [{lo}, {hi})")


def status_report(db: sqlite3.Connection, cfg: dict) -> None:
    counts = dict(db.execute("SELECT feed_url, COUNT(*) FROM items GROUP BY feed_url").fetchall())
    state = {r["url"]: r for r in db.execute("SELECT * FROM feeds")}
    for f in news_feeds(cfg):
        s = state.get(f.url)
        if not s:
            print(f"  ? {f.outlet:16} never fetched  {f.url}")
            continue
        mark = "!" if s["last_error"] else " "
        print(f"  {mark} {f.outlet:16} {s['last_fetch'][5:16]}  {str(s['last_status'] or '-'):4} +{s['last_new']:<3} {counts.get(f.url, 0):5} items  {s['last_error'] or ''}")
    for f in follows(cfg):
        s = state.get(f.url)
        if not s:
            print(f"  ? {f.name[:16]:16} never fetched  {f.url}")
            continue
        mark = "!" if s["last_error"] else " "
        print(f"  {mark} {f.name[:16]:16} {s['last_fetch'][5:16]}  {str(s['last_status'] or '-'):4} +{s['last_new']:<3} {f.kind:10} {s['last_error'] or ''}")
    n_items, n_stories = db.execute("SELECT (SELECT COUNT(*) FROM items), (SELECT COUNT(*) FROM stories)").fetchone()
    print(f"\n{n_items} items · {n_stories} stories · {DB}")


def main() -> int:
    ap = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    p_fetch = sub.add_parser("fetch", help="fetch the feeds and store new items")
    p_sync = sub.add_parser("sync", help="fetch + cluster + enrich + render + purge + export + stream")
    p_sync.add_argument("--no-enrich", action="store_true", help="skip the LLM step")
    p_sync.add_argument("--llm", default=LLM, help=f"<provider>:<model> for enrich (default {LLM})")
    for p in (p_fetch, p_sync):
        p.add_argument("--outlet", action="append", help="only this outlet id (repeatable)")
        p.add_argument("-v", "--verbose", action="store_true")
    for p in (sub.add_parser("cluster", help="embed and cluster new items"), p_sync, sub.add_parser("recluster", help="drop the stories and cluster again")):
        p.add_argument("--tau", type=float, default=TAU, help=f"join threshold (default {TAU})")
    p_en = sub.add_parser("enrich", help="group, title, summary and framing of the stories by an LLM")
    p_en.add_argument("--llm", default=LLM, help=f"<provider>:<model> (default {LLM}); FEEDS_LLM_FALLBACK follows")
    p_en.add_argument("--no-fallback", action="store_true", help="only --llm, no fallback chain")
    p_en.add_argument("--since", default="48h")
    p_en.add_argument("--min-outlets", type=int, default=2)
    p_en.add_argument("--limit", type=int, help="at most this many stories")
    p_en.add_argument("--batch", type=int, default=BATCH)
    p_en.add_argument("--force", action="store_true", help="also the stories enriched already")
    p_en.add_argument("--dry-run", action="store_true", help="call the LLM, write nothing")
    p_en.add_argument("--out", help="write the prompts and answers to this JSON file")
    p_en.add_argument("-v", "--verbose", action="store_true")
    sub.add_parser("render", help="write the news notes of the enriched stories")
    sub.add_parser("purge", help="delete the inbox notes and rows older than 30 days")
    sub.add_parser("export", help="write news.json for the News pane")
    p_st = sub.add_parser("stories", help="print the stories of a window")
    p_st.add_argument("--since", default="24h")
    p_st.add_argument("--min-outlets", type=int, default=2)
    p_st.add_argument("--limit", type=int, default=40)
    p_st.add_argument("--json", action="store_true")
    p_pa = sub.add_parser("pairs", help="cross-story item pairs with a cosine in [lo, hi)")
    p_pa.add_argument("--since", default="24h")
    p_pa.add_argument("--lo", type=float, default=TAU - NEAR)
    p_pa.add_argument("--hi", type=float, default=TAU)
    p_pa.add_argument("--limit", type=int, default=30)
    p_str = sub.add_parser("stream", help="fetch the follows and write stream.json")
    p_str.add_argument("--full", action="store_true", help="no conditional GET: fetch every feed again")
    p_str.add_argument("-v", "--verbose", action="store_true")
    p_fo = sub.add_parser("follow", help="edit the follows of sources.yaml")
    fo = p_fo.add_subparsers(dest="action", required=True)
    fo.add_parser("list")
    fo_add = fo.add_parser("add", help="a feed, a page that links one, or a YouTube channel url")
    fo_add.add_argument("url")
    fo_edit = fo.add_parser("edit", help="rename, move to a folder or change the kind")
    fo_edit.add_argument("url")
    for f in (fo_add, fo_edit):
        f.add_argument("--name")
        f.add_argument("--folder")
    fo_edit.add_argument("--kind", choices=["youtube", "podcast", "blog", "newsletter", "papers"])
    fo.add_parser("remove").add_argument("url")
    fo_folder = fo.add_parser("folder", help="rename a folder")
    fo_folder.add_argument("old")
    fo_folder.add_argument("new")
    fo.add_parser("days", help="time span of the stream").add_argument("days", type=int)
    sub.add_parser("status", help="feed health")
    args = ap.parse_args()

    cfg = load_sources()
    db = connect()
    try:
        if args.cmd in {"fetch", "sync"}:
            n = fetch(db, news_feeds(cfg, set(args.outlet or []) or None), skip_patterns(cfg), args.verbose)
            print(f"fetch: {n} new items")
        if args.cmd in {"cluster", "sync"}:
            print(f"embed: {embed_missing(db)} items")
            placed, started = cluster(db, args.tau)
            print(f"cluster: {placed} items placed, {started} new stories (tau {args.tau})")
        if args.cmd == "sync" and not args.no_enrich:
            try:
                print(enrich_line(enrich(db, cfg, llm_chain(args.llm), parse_since("48h"))))
            except Exception as err:  # the notes and the pane still update
                print(f"  ! enrich: {err}", file=sys.stderr)
        if args.cmd in {"render", "sync"}:
            st = render(db, cfg)
            print(f"render: {st['created']} notes created, {st['updated']} updated")
        if args.cmd in {"purge", "sync"}:
            st = purge(db)
            print(f"purge: {st['kept']} kept, {st['deleted']} notes deleted, {st['rows']} rows deleted")
        if args.cmd in {"export", "sync"}:
            print(f"export: {export(db, cfg)} stories")
        if args.cmd in {"stream", "sync"}:
            print(run_stream(db, cfg, full=getattr(args, "full", False), verbose=args.verbose))
        if args.cmd == "follow":
            print(follow_cmd(db, cfg, args))
        elif args.cmd == "recluster":
            dropped = drop_skipped(db, skip_patterns(cfg))
            embed_missing(db)
            placed, started = recluster(db, args.tau)
            print(f"recluster: {dropped} items dropped by skip_titles")
            print(f"recluster: {placed} items, {started} stories (tau {args.tau})")
        elif args.cmd == "enrich":
            chain = [args.llm] if args.no_fallback else llm_chain(args.llm)
            st = enrich(db, cfg, chain, parse_since(args.since), args.min_outlets, args.limit, args.batch,
                        args.force, args.dry_run, args.verbose)
            if args.out:
                Path(args.out).write_text(json.dumps(st["results"], ensure_ascii=False, indent=1))
            print(enrich_line(st) + (" [dry run]" if args.dry_run else ""))
            if st["failed"] and not st["stories"]:
                return 1
        elif args.cmd == "stories":
            stories_report(db, parse_since(args.since), args.min_outlets, args.limit, outlet_names(cfg), args.json)
        elif args.cmd == "pairs":
            pairs_report(db, parse_since(args.since), args.lo, args.hi, args.limit, outlet_names(cfg))
        elif args.cmd == "status":
            status_report(db, cfg)
    except SyncError as err:
        print(f"error: {err}", file=sys.stderr)
        return 1
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
