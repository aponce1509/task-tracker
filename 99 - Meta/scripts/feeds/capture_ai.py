"""capture_ai.py - the AI pipeline of the capture inbox: type and subtype, source, summary, paras, groups.

The models, tasks and the pipeline are in `99 - Meta/scripts/ai/ai.toml`;
vault_ai.py reaches them. capture_import.py calls it after each import; it
also runs alone on the queue (06 - Inputs/Captures, status inbox).

Tasks of the `captures` pipeline, each on the model best at it:
  form      decision model (d3): the type and subtype. The platform decides
            YouTube (video), X and Instagram (post); the model picks for a web
            page (article, paper, documentation, tool, bookmark) and for a
            capture without a link (my thought, or pasted material).
  source    chat model: the author of a capture that has none, and the title
            of pasted material. A name that matches a note links to it.
  summary   chat model: 2-4 bullets in the abstract callout, map-reduce for
            long material. My "Why:" bullet stays first.
  paras     embeddings: the typed notes nearest to the capture vote; the PAR is
            written only on a clear vote (see --eval).
  group     embeddings, report only (--groups): the queue in topic groups,
            each with the PAR its nearest notes point to.

It fills only empty fields, changes type and subtype only while they are the
importer's default, and never touches ## Annotations. The original of every
changed capture is kept in .cache/backup/. A capture already done is skipped
while it and the models do not change.

Run:
    python3 "99 - Meta/scripts/feeds/capture_ai.py"                       # the queue
    python3 "99 - Meta/scripts/feeds/capture_ai.py" "06 - Inputs/Captures/x.md" --dry-run
    python3 "99 - Meta/scripts/feeds/capture_ai.py" --tasks form,paras    # only these tasks
    python3 "99 - Meta/scripts/feeds/capture_ai.py" --force               # redo the done ones
    python3 "99 - Meta/scripts/feeds/capture_ai.py" --groups              # the queue in topic groups
    python3 "99 - Meta/scripts/feeds/capture_ai.py" --eval                # paras accuracy of the kNN vote

One run on another model: AI_TASK_SUMMARY=qwen-small (the keys of [models] in ai.toml).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
import time
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "ai"))
import vault_ai  # noqa: E402  # pyright: ignore[reportMissingImports]

VAULT = Path(__file__).resolve().parents[3]
CACHE = Path(__file__).resolve().parent / ".cache"
TAXONOMY = VAULT / ".obsidian" / "personal_scripts" / "taxonomy.json"
PIPELINE = "captures"
OllamaDown = vault_ai.Unavailable  # the name capture_import.py catches

# Folders whose typed notes are the labels of the paras vote. Categories hold
# the taxonomy itself, Meta the templates, the inboxes the unlabeled notes.
SKIP_DIRS = {"02 - Categories", "04 - Bases", "06 - Inputs", "09 - Inbox", "99 - Meta", ".obsidian", ".trash", ".git"}
LINK = re.compile(r"\[\[([^\]|#]+)(?:[^\]]*)\]\]")

# The forms a capture can take. Web pages: subtype -> (callout head, what it is).
WEB_FORMS = {
    "article": ("Article", "a blog post, an essay or a news piece"),
    "paper": ("Paper", "an academic or research paper, or its abstract page"),
    "documentation": ("Docs", "the docs, the reference or a tutorial of a product or library"),
    "tool": ("Tool", "the home page or repository of an app, a library or a service"),
    "bookmark": ("Page", "anything else, or too little text to tell"),
}
# A capture without a link: form -> (type, subtype, callout head, what it is).
LOOSE_FORMS = {
    "spark": ("Ideas", "spark", "Spark", "my own sudden idea"),
    "project-idea": ("Ideas", "project-idea", "Project idea", "my own idea of something to build or do"),
    "open-question": ("Inquiries", "open-question", "Question", "a question I ask myself"),
    "opinion": ("Reflections", "opinion", "Opinion", "my own take on something"),
    "article": ("Resources", "article", "Article", "a pasted article or blog post written by someone else"),
    "paper": ("Resources", "paper", "Paper", "a pasted academic paper, with authors and an abstract"),
    "documentation": ("Resources", "documentation", "Docs", "pasted docs of a product or library"),
    "chats": ("Resources", "chats", "Chat", "a pasted conversation with an AI assistant"),
    "book": ("Medias", "book", "Book", "a pasted passage of a book"),
}


class Config:
    """The pipeline and its tasks, from ai.toml."""

    def __init__(self, only: list[str] | None = None) -> None:
        self.ai = vault_ai.load()
        self.pipe = self.ai.pipeline(PIPELINE)
        self.tasks = {n: self.ai.task(n) for n in (only or self.pipe["tasks"])}

    def __contains__(self, name: str) -> bool:
        return name in self.tasks

    def __getitem__(self, name: str) -> vault_ai.Task:
        return self.tasks[name]

    def signature(self) -> str:
        """What a done capture was done with: a change of task or model redoes it."""
        return ",".join(f"{n}={t.model.key}" for n, t in sorted(self.tasks.items()))


# Vault model

@dataclass
class Note:
    path: Path
    fm: dict
    raw: str
    body: str

    @property
    def title(self) -> str:
        return self.path.stem

    @property
    def type(self) -> str | None:
        v = links(self.fm.get("type"))
        return v[0] if v else None

    @property
    def subtypes(self) -> list[str]:
        # "[[Operational - Issues - task|task]]" -> "task"
        return [s.rsplit(" - ", 1)[-1] for s in links(self.fm.get("subtypes"))]

    @property
    def paras(self) -> list[str]:
        return links(self.fm.get("paras"))

    def text(self, limit: int) -> str:
        return f"# {self.title}\n{self.body.strip()}"[:limit]


def links(value) -> list[str]:
    if not value:
        return []
    items = value if isinstance(value, list) else [value]
    return [m.group(1).strip() for v in items for m in LINK.finditer(str(v))]


def parse_frontmatter(text: str) -> tuple[dict, str, str]:
    """Flat YAML: `key: value` and `key:` followed by `  - item` lines."""
    if not text.startswith("---\n"):
        return {}, "", text
    end = text.find("\n---", 4)
    if end < 0:
        return {}, "", text
    raw = text[4:end]
    body = text[end + 4:].lstrip("\n")
    fm: dict = {}
    key = None
    for line in raw.splitlines():
        m = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if m:
            key, val = m.group(1), m.group(2).strip()
            fm[key] = val.strip('"') if val else []
        elif key and re.match(r"^\s+-\s*", line):
            if not isinstance(fm[key], list):
                fm[key] = [fm[key]] if fm[key] else []
            fm[key].append(re.sub(r"^\s+-\s*", "", line).strip().strip('"'))
    return fm, raw, body


def read(path: Path) -> Note:
    fm, raw, body = parse_frontmatter(path.read_text(errors="ignore"))
    return Note(path, fm, raw, body)


def vault_notes() -> list[Path]:
    out = []
    for path in sorted(VAULT.rglob("*.md")):
        parts = path.relative_to(VAULT).parts
        if parts[0] in SKIP_DIRS or any(p.startswith(".") for p in parts) or "node_modules" in parts:
            continue
        out.append(path)
    return out


def labeled() -> list[Note]:
    out = []
    for path in vault_notes():
        if "Template" in path.name:
            continue
        note = read(path)
        if note.type and note.fm.get("status") != "inbox":
            out.append(note)
    return out


def subtype_link(t: str, s: str) -> str:
    for cluster, types in json.loads(TAXONOMY.read_text()).items():
        if s in (types.get(t) or {}):
            return f"[[{cluster} - {t} - {s}|{s}]]"
    raise KeyError(f"{t}/{s} is not in the taxonomy")


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(VAULT))
    except ValueError:
        return str(path)


class Embeddings:
    """Unit vectors of one embed task, cached by content hash in .cache/embeddings-<model>.json."""

    def __init__(self, task: vault_ai.Task) -> None:
        self.task = task
        self.chars = task.get("embed_chars", 2000)
        self.file = CACHE / f"embeddings-{task.model.name.replace(':', '_')}.json"
        self.data: dict[str, list[float]] = json.loads(self.file.read_text()) if self.file.exists() else {}
        self.dirty = False

    def of(self, notes: list[Note]) -> list[list[float]]:
        texts = [n.text(self.chars) for n in notes]
        keys = [hashlib.sha1(t.encode()).hexdigest() for t in texts]
        todo = [(k, t) for k, t in zip(keys, texts) if k not in self.data]
        for i in range(0, len(todo), 16):
            chunk = todo[i:i + 16]
            for (k, _), v in zip(chunk, self.task.embed([t for _, t in chunk])):
                self.data[k] = v
            self.dirty = True
        return [self.data[k] for k in keys]

    def save(self) -> None:
        if self.dirty:
            CACHE.mkdir(exist_ok=True)
            self.file.write_text(json.dumps(self.data))


# Paras: the kNN vote

Index = list[tuple[Note, list[float]]]


def dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def paras_vote(task: vault_ai.Task, vec: list[float], base: Index, skip: Path | None = None) -> list[tuple[str, float]]:
    """The PARs of the k nearest typed notes, by share of the vote, best first."""
    scored = sorted(((dot(vec, v), n) for n, v in base if n.path != skip), key=lambda x: -x[0])[:task.get("k", 7)]
    scored = [(sim, n) for sim, n in scored if sim >= task.get("sim_min", 0.65)]
    if len(scored) < task.get("min_voters", 2):
        return []
    tally: dict[str, float] = defaultdict(float)
    for sim, n in scored:
        w = max(sim, 0.0) ** 4  # sharpen: the closest neighbours weigh most
        for p in n.paras or ["(none)"]:
            tally[p] += w
    total = sum(tally.values()) or 1.0
    return sorted(((p, w / total) for p, w in tally.items()), key=lambda x: -x[1])


def clear_paras(task: vault_ai.Task, vote: list[tuple[str, float]]) -> list[str]:
    if not vote or vote[0][1] < task.get("clear", 0.8) or vote[0][0] == "(none)":
        return []
    return [vote[0][0]]


# Content of a capture

SYSTEM = (
    "You process captures of a personal Obsidian knowledge vault: videos, posts, web pages, "
    "pasted texts and quick thoughts, in English or Spanish. Answer only with the JSON asked for."
)
STAMP = re.compile(r"^\[?\(?\d{1,2}:\d{2}(?::\d{2})?\)?\]?\s*")


def content(note: Note) -> str:
    """The material to read: the body up to ## Annotations, without callout marks, images and timestamps."""
    body = note.body.split("\n## Annotations", 1)[0]
    out = []
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("# ") or s.startswith("![") or re.match(r"^>\s*\[!", s):
            continue
        s = re.sub(r"^>\s?", "", s).strip()
        s = STAMP.sub("", re.sub(r"^-\s+", "", s))
        if s and not s.startswith("Why:"):
            out.append(s)
    return "\n".join(out)


SUMMARY_RULES = ("Short sentences, active voice, one idea per bullet, the same language as the material. "
                 "Say what it claims or shows, not that it exists: never 'the video talks about' or 'the author'.")


def summarize(task: vault_ai.Task, note: Note, text: str) -> list[str]:
    schema = {"type": "object", "required": ["summary"], "properties": {
        "summary": {"type": "array", "minItems": 2, "maxItems": 4, "items": {"type": "string"}}}}
    size, most = task.get("chunk", 12_000), task.get("max_chunks", 8)
    chunks = [text[i:i + size] for i in range(0, len(text), size)] or [""]
    if len(chunks) > most:  # an even sample keeps the whole arc of a long transcript
        step = len(chunks) / most
        chunks = [chunks[int(i * step)] for i in range(most)]
    if len(chunks) > 1:
        points = []
        for i, c in enumerate(chunks, 1):
            part = task.chat(SYSTEM, f"Part {i} of {len(chunks)} of '{note.title}':\n<<<\n{c}\n>>>\n\n"
                                     "Return the 2 to 4 key points of this part as summary bullets.", schema)
            points += part.get("summary", [])
        text = "\n".join(f"- {p}" for p in points)
    out = task.chat(SYSTEM, f"Material '{note.title}':\n<<<\n{text}\n>>>\n\n"
                            "Write 2 to 4 summary bullets that let me understand it without reading it. "
                            + SUMMARY_RULES, schema)
    return [s.strip() for s in out.get("summary", []) if isinstance(s, str) and s.strip()]


def decide_form(task: vault_ai.Task, note: Note, text: str, forms: dict, question: str) -> tuple[str | None, str]:
    """The form the model picks, or None under min_confidence. Also a line for the log."""
    state = f"Title: {note.title}\nURL: {note.fm.get('url') or '(none)'}\n\n{text[:5000]}"
    d = task.decide(state, question, {k: v[-1] for k, v in forms.items()}, SYSTEM)
    conf = "" if d.confidence is None else f" {d.confidence:.2f}"
    if d.confidence is not None and d.confidence < task.get("min_confidence", 0.0):
        return None, f"{d.choice}{conf} by {d.model}, under min_confidence"
    return d.choice, f"{d.choice}{conf} by {d.model}"


def find_source(task: vault_ai.Task, note: Note, text: str, pasted: bool) -> dict:
    schema = {"type": "object", "required": ["title", "authors"], "properties": {
        "title": {"type": "string"},
        "authors": {"type": "array", "maxItems": 4, "items": {"type": "string"}}}}
    what = "pasted material" if pasted else f"a saved page ({note.fm.get('url', '')})"
    prompt = (f"A capture of {what}, file name '{note.title}':\n<<<\n{text[:6000]}\n>>>\n\n"
              "Return:\n- title: its real title, as written in it.\n"
              "- authors: the people or the organization that wrote it, as written in it, one per item; "
              "[] when it does not say.")
    return task.chat(SYSTEM, prompt, schema)


def split_authors(raw: list) -> list[str]:
    # small models merge a list into one string: "A, B and C"
    return [x.strip() for a in raw if isinstance(a, str) for x in re.split(r",|;| and | y | & ", a) if x.strip()]


def author_link(name: str, known: dict[str, str]) -> str:
    """[[Note]] of an existing note with this name (or @name), else a new link."""
    key = name.lower().lstrip("@")
    return f"[[{known.get(key) or known.get('@' + key) or safe_title(name)}]]"


def known_names() -> dict[str, str]:
    return {p.stem.lower(): p.stem for p in vault_notes()}


# Writing

def set_key(raw: str, key: str, value: str | list[str]) -> str:
    """Replace `key:` and its list items with the new value."""
    block = f"{key}: {value}" if isinstance(value, str) else f"{key}:" + "".join(f'\n  - "{v}"' for v in value)
    pattern = rf"^{key}:[^\n]*(?:\n[ \t]+-[^\n]*)*"
    if re.search(pattern, raw, re.M):
        return re.sub(pattern, lambda _: block, raw, count=1, flags=re.M)
    return raw + "\n" + block


def rewrite_abstract(body: str, head: str | None, bullets: list[str]) -> str:
    """Swap the bullets of the first abstract callout; keep its title (with a new head word) and my Why.
    With no bullets, only the head word changes."""
    m = re.search(r"^> \[!abstract\][^\n]*\n(?:>[^\n]*\n?)*", body, re.M)
    block = [f"> - {b}" for b in bullets]
    if not m:
        h1 = re.search(r"^# .*\n", body, re.M)
        callout = f"> [!abstract] {head or 'Capture'}\n" + "\n".join(block) + "\n\n"
        return body[:h1.end()] + "\n" + callout + body[h1.end():].lstrip("\n") if h1 else callout + body
    lines = m.group(0).rstrip("\n").splitlines()
    title = lines[0]
    if head:
        title = re.sub(r"^(> \[!abstract\])\s*\S+", rf"\1 {head}", title)
    keep = [ln for ln in lines[1:] if ln.startswith("> - Why:")] if bullets else lines[1:]
    return body[:m.start()] + "\n".join([title, *keep, *block]) + "\n" + body[m.end():]


def safe_title(title: str) -> str:
    title = re.sub(r'[\[\]#^|\\/:*?"<>]', " ", title)
    title = re.sub(r"\s+", " ", title).strip(" .-")
    return title[:90].rstrip(" .-")


def linked(name: str) -> bool:
    pat = re.compile(rf"\[\[{re.escape(name)}(?:[|#\]])")
    for path in VAULT.rglob("*.md"):
        if any(part.startswith(".") for part in path.relative_to(VAULT).parts) or path.stem == name:
            continue
        if pat.search(path.read_text(errors="ignore")):
            return True
    return False


@dataclass
class Result:
    path: str
    changes: dict = field(default_factory=dict)
    log: list = field(default_factory=list)
    paras_vote: list = field(default_factory=list)
    seconds: float = 0.0


def enrich_one(cfg: Config, note: Note, vec: list[float] | None, base: Index, known: dict[str, str],
               dry: bool) -> Result:
    t0 = time.time()
    res = Result(rel(note.path))
    text = content(note)
    raw, body, head = note.raw, note.body, None
    has_url = bool(note.fm.get("url"))
    t, s = note.type, note.subtypes
    new_title = None

    # form: type and subtype change only while they are the importer's default; a pick of mine stays.
    if "form" in cfg and has_url and note.fm.get("platform") == "web" and (t, s) == ("Resources", ["bookmark"]):
        form, msg = decide_form(cfg["form"], note, text, WEB_FORMS, "What kind of web page is this?")
        res.log.append(f"form {msg}")
        if form and form != "bookmark":
            raw = set_key(raw, "subtypes", [subtype_link("Resources", form)])
            res.changes["subtypes"] = form
        head = WEB_FORMS[form or "bookmark"][0]
    elif "form" in cfg and not has_url and (t, s) == ("Ideas", ["spark"]):
        form, msg = decide_form(cfg["form"], note, text, LOOSE_FORMS,
                                "Is this my own thought, or material written by someone else that I pasted? Which kind?")
        res.log.append(f"form {msg}")
        t2, s2, head, _ = LOOSE_FORMS[form or "spark"]
        if (t, s) != (t2, [s2]):
            raw = set_key(raw, "type", f'"[[{t2}]]"')
            raw = set_key(raw, "subtypes", [subtype_link(t2, s2)])
            res.changes["type"] = f"{t2}/{s2}"
            t = t2

    # source: the author of a capture that has none; my own thoughts have no source.
    if "source" in cfg and t not in ("Ideas", "Inquiries", "Reflections") and not note.fm.get("author"):
        pasted = not has_url
        src = find_source(cfg["source"], note, text, pasted)
        authors = split_authors(src.get("authors", []))
        if authors:
            raw = set_key(raw, "author", [author_link(a, known) for a in authors])
            res.changes["author"] = authors
        title = safe_title(src.get("title") or "") if pasted else ""
        if title and title != note.title and not (note.path.parent / f"{title}.md").exists():
            new_title = title

    summary: list[str] = []
    if "summary" in cfg and len(text) >= cfg["summary"].get("min_text", 600):
        summary = summarize(cfg["summary"], note, text)
        if summary:
            res.changes["summary"] = summary
    if summary or head:
        body = rewrite_abstract(body, head, summary)

    if "paras" in cfg and vec is not None:
        vote = paras_vote(cfg["paras"], vec, base)
        res.paras_vote = [(p, round(w, 2)) for p, w in vote[:3]]
        paras = clear_paras(cfg["paras"], vote)
        if paras and not note.paras:
            raw = set_key(raw, "paras", [f"[[{p}]]" for p in paras])
            res.changes["paras"] = paras

    path = note.path
    if new_title and not linked(note.title):
        body = body.replace(f"# [[{note.title}]]", f"# [[{new_title}]]", 1)
        path = note.path.with_name(f"{new_title}.md")
        res.changes["renamed"] = new_title

    res.seconds = round(time.time() - t0, 1)
    if dry or not res.changes:
        return res
    backup = CACHE / "backup"
    backup.mkdir(parents=True, exist_ok=True)
    shutil.copy2(note.path, backup / f"{time.strftime('%Y%m%d-%H%M%S')} {note.path.name}")
    note.path.write_text(f"---\n{raw}\n---\n{body}")
    if path != note.path:
        note.path.rename(path)
    res.path = rel(path)
    return res


def load_index(emb: Embeddings) -> Index:
    lab = labeled()
    return list(zip(lab, emb.of(lab)))


def enrich(paths: list[Path], dry: bool = False, force: bool = False, log=print,
           budget: float | None = None, only: list[str] | None = None) -> list[Result]:
    """Run the pipeline on these captures. Raises OllamaDown when the models are not there.
    With a budget (seconds), no capture starts after it runs out; the rest wait for the next run."""
    start = time.time()
    cfg = Config(only)
    sig = cfg.signature()
    done_file = CACHE / "done.json"
    done = json.loads(done_file.read_text()) if done_file.exists() else {}
    todo = [read(p) for p in paths if force or done.get(hashlib.sha1(p.read_bytes()).hexdigest()) != sig]
    if not todo:
        return []
    base: Index = []
    vecs: list = [None] * len(todo)
    if "paras" in cfg:
        emb = Embeddings(cfg["paras"])
        base = load_index(emb)
        vecs = emb.of(todo)
        emb.save()
    known = known_names()
    out = []
    for i, (note, vec) in enumerate(zip(todo, vecs)):
        if budget is not None and time.time() - start > budget:
            log(f"· local AI: time budget spent, {len(todo) - i} captures wait for the next run")
            break
        res = enrich_one(cfg, note, vec, base, known, dry)
        out.append(res)
        keys = ", ".join(k for k in res.changes if k != "summary")
        log(f"~ {res.path} · {'summary' if 'summary' in res.changes else 'no summary'}"
            f"{' · ' + keys if keys else ''}{' · ' + '; '.join(res.log) if res.log else ''} · {res.seconds}s")
        if not dry:
            done[hashlib.sha1((VAULT / res.path).read_bytes()).hexdigest()] = sig
            CACHE.mkdir(exist_ok=True)
            done_file.write_text(json.dumps(done, indent=1))
    return out


def queue() -> list[Path]:
    """The notes of the pipeline, the oldest first, so a spent budget leaves the newest for later."""
    p = vault_ai.load().pipeline(PIPELINE)
    notes = [read(f) for f in (VAULT / p["folder"]).glob("*.md")]
    return [n.path for n in sorted(notes, key=lambda n: str(n.fm.get("created") or ""))
            if n.fm.get("status") == p.get("status", "inbox")]


# Groups

def centroid(vecs: list[list[float]]) -> list[float]:
    return vault_ai.unit([sum(col) for col in zip(*vecs)])


def groups(vecs: list[list[float]], threshold: float) -> list[list[int]]:
    """Single pass: a capture joins the group whose centroid is closest, when it is close enough."""
    out: list[list[int]] = []
    centres: list[list[float]] = []
    for i, v in enumerate(vecs):
        best = max(range(len(out)), key=lambda g: dot(v, centres[g]), default=None)
        if best is not None and dot(v, centres[best]) >= threshold:
            out[best].append(i)
            centres[best] = centroid([vecs[j] for j in out[best]])
        else:
            out.append([i])
            centres.append(v)
    return sorted(out, key=len, reverse=True)


# Commands

def targets(args) -> list[Path]:
    return [Path(p) if Path(p).is_absolute() else VAULT / p for p in args.paths] or queue()


def cmd_enrich(args) -> int:
    only = [t.strip() for t in args.tasks.split(",")] if args.tasks else None
    try:
        results = enrich(targets(args), dry=args.dry_run, force=args.force, only=only,
                         log=(lambda *_: None) if args.json else print)
    except vault_ai.Unavailable as err:
        print(f"! {err}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps([r.__dict__ for r in results], ensure_ascii=False, indent=1))
    else:
        print(f"{len(results)} enriched{' (dry run)' if args.dry_run else ''}")
    return 0


def cmd_groups(args) -> int:
    ai = vault_ai.load()
    task, paras = ai.task("group"), ai.task("paras")
    notes = [read(p) for p in targets(args)]
    if not notes:
        print("the queue is empty")
        return 0
    try:
        emb = Embeddings(task)
        vecs = emb.of(notes)
        # the PAR of a group needs the vault in the same vector space
        base = load_index(emb) if task.model.name == paras.model.name else []
        emb.save()
    except vault_ai.Unavailable as err:
        print(f"! {err}", file=sys.stderr)
        return 2
    for g in groups(vecs, task.get("threshold", 0.6)):
        vote = paras_vote(paras, centroid([vecs[i] for i in g]), base) if base else []
        label = f"{vote[0][0]} {vote[0][1]:.0%}" if vote else "no clear PAR"
        print(f"{len(g)} · {label}")
        for i in g:
            print(f"    {notes[i].title}")
    return 0


def cmd_eval(_args) -> int:
    """Leave-one-out kNN on the typed notes: how often the paras vote is right, by vote share."""
    task = vault_ai.load().task("paras")
    emb = Embeddings(task)
    try:
        base = load_index(emb)
    except vault_ai.Unavailable as err:
        print(f"! {err}", file=sys.stderr)
        return 2
    emb.save()
    buckets: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for note, vec in base:
        vote = paras_vote(task, vec, base, note.path)
        if not vote:
            continue
        top, share = vote[0]
        key = next(f">= {b}" for b in (0.8, 0.7, 0.6, 0.5, 0.0) if share >= b)
        buckets[key][0] += 1
        buckets[key][1] += (top in note.paras) or (top == "(none)" and not note.paras)
    print(f"kNN paras vote with {task.model.name}, leave-one-out on {len(base)} typed notes "
          f"(writes at share >= {task.get('clear', 0.8)}):")
    for key in sorted(buckets, reverse=True):
        n, ok = buckets[key]
        print(f"  share {key:7} {n:4} notes · right {ok / n:.0%}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    ap.add_argument("paths", nargs="*", help="captures (default: the queue of the pipeline)")
    ap.add_argument("--dry-run", action="store_true", help="show what would change, write nothing")
    ap.add_argument("--force", action="store_true", help="redo captures already enriched")
    ap.add_argument("--tasks", help="comma list of tasks (default: the pipeline's)")
    ap.add_argument("--json", action="store_true", help="print the results as JSON")
    ap.add_argument("--groups", action="store_true", help="print the captures in topic groups")
    ap.add_argument("--eval", action="store_true", help="accuracy of the paras vote on the typed notes")
    args = ap.parse_args()
    if args.eval:
        return cmd_eval(args)
    return cmd_groups(args) if args.groups else cmd_enrich(args)


if __name__ == "__main__":
    sys.exit(main())
