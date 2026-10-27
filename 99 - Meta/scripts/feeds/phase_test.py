# /// script
# requires-python = ">=3.11"
# dependencies = ["feedparser>=6", "certifi", "pyyaml", "numpy", "jsonschema"]
# ///
"""phase_test.py - test the phase gate of _I00048 (story drift in long news events) on the stored news.

Read-only: it reads feeds.db and never writes it. The clustering of feeds_sync.py is replayed in memory,
once without the gate and once per gate rule and confidence.

Steps:
  classify  ask the news-phase task of ai.toml (d3) the phase of every stored item. The answers are cached in
            ~/.config/feeds/phase_cache.json, so a second run asks only the new items (about 1 s per item).
  report    print the accuracy of the phases on the gold labels, then per configuration the stories of each
            test event and the normal stories (two outlets or more) that the gate changes.
            --show RULE:CONF prints the stories of the test events and the changed stories of one configuration.

Gate: an item joins the best open story with cosine >= tau whose phase is compatible with its own phase.
  strict  same phase, or one of them is none, or live with result
  coarse  before (preview, live) never joins after (result, reaction); none joins anything
  anchor  coarse, and a result joins only a story that is already after: the first result of an event
          starts a new story even when the story before it has no phase (previews the model called none)
A phase under the confidence is none. A story takes the phase of its first item with a phase.

Usage:
  uv run phase_test.py classify
  uv run phase_test.py report [--show strict:0.6]
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
import time
from collections import Counter
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / "ai"))
import feeds_sync as fs  # noqa: E402  # pyright: ignore[reportMissingImports]
import vault_ai  # noqa: E402  # pyright: ignore[reportMissingImports]

CACHE = fs.HOME / "phase_cache.json"
QUESTION = "Which phase of the news event does this headline report?"
CHOICES = {
    "preview": "Before a scheduled event with an outcome: polls, expectations, what is at stake, voters go to the polls, what to know before it",
    "live": "The event is happening now: voting open, the count under way, the debate in progress",
    "result": "The outcome is known and reported: who won or lost, approves, rejects, concedes defeat",
    "reaction": "After the outcome: reactions, congratulations, celebrations, markets, analysis of why it happened and what comes next",
    "none": "Not a scheduled event with an outcome: an ongoing topic, an incident, a profile, a feature",
}
BEFORE, AFTER = {"preview", "live"}, {"result", "reaction"}
CONFS = [0.5, 0.6, 0.7]

# Gold labels by hand, item id -> phase. Data of 2026-10-23 to 2026-10-26.
# brazil and serbia are the drift cases (previews joined to the result and the day after);
# israel is the control: a story of previews only, which must stay one story.
P, L, R, X = "preview", "live", "result", "reaction"
GOLD = {
    "brazil (517)": {
        1057: P, 982: P, 677: L, 322: R, 232: R, 675: R, 1244: X, 787: R, 786: R, 1052: R, 1202: R, 487: X,
        981: R, 1051: X, 118: X, 1124: X, 116: R, 1107: R, 1006: X, 136: X, 119: X, 424: R, 75: R, 901: R,
        485: R, 1069: X, 74: X, 670: X, 784: X, 320: X, 861: R, 958: X, 324: X, 36: R, 1066: R, 953: X,
        1046: X, 665: R, 223: R, 950: X, 1045: X, 1044: R, 1149: X, 1042: R, 1041: X, 337: X, 1062: X,
        783: X, 871: X, 1313: R, 1321: X, 1351: X, 1355: X, 1325: X, 1415: X, 1419: X,
    },
    "serbia (316)": {
        886: P, 129: P, 496: P, 80: R, 233: R, 426: R, 1238: R, 979: R, 1054: R, 490: R, 801: X, 800: R,
        964: X, 830: X, 672: R, 1070: X, 956: X, 993: X, 990: R, 1043: R, 1040: X, 864: R, 660: X, 798: X,
        1237: X, 483: R, 1300: X, 1348: X, 1373: X,
    },
    "israel (415)": {885: P, 1008: P, 999: P, 477: L, 423: P, 966: P, 959: P, 952: P},
}
GOLD_IDS = {i for g in GOLD.values() for i in g}


def load_items(db: sqlite3.Connection) -> list:
    return db.execute("SELECT id, outlet, title, lede, published, embedding FROM items"
                      " WHERE embedding IS NOT NULL ORDER BY published, id").fetchall()


def read_cache() -> dict:
    return json.loads(CACHE.read_text()) if CACHE.exists() else {}


def classify(items: list) -> None:
    cache = read_cache()
    task = vault_ai.load().task("news-phase")
    todo = [r for r in items if str(r["id"]) not in cache]
    print(f"{len(todo)} items to classify ({len(cache)} cached)")
    start = time.time()
    for n, r in enumerate(todo, 1):
        d = task.decide(fs.item_text(r), QUESTION, CHOICES)
        cache[str(r["id"])] = {"phase": d.choice, "conf": d.confidence, "model": d.model, "title": r["title"]}
        if n % 25 == 0 or n == len(todo):
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1))
            print(f"  {n}/{len(todo)}  {time.time() - start:.0f} s", flush=True)


def phase_of(cache: dict, iid: int, conf: float) -> str:
    c = cache.get(str(iid))
    if not c or c["phase"] == "none" or (c["conf"] is not None and c["conf"] < conf):
        return "none"
    return c["phase"]


def compatible(rule: str, a: str, b: str) -> bool:
    if rule == "anchor" and a == "result" and b == "none":
        return False
    if rule == "off" or a == "none" or b == "none" or a == b:
        return True
    if rule == "anchor" and a == "result":
        return b in AFTER
    if rule == "strict":
        return {a, b} == {"live", "result"}
    return not ({a, b} & BEFORE and {a, b} & AFTER)  # coarse


def replay(items: list, phases: dict[int, str], rule: str) -> tuple[dict[int, int], dict[int, int]]:
    """The online clustering of fs.cluster, from an empty store. Returns item -> story and story -> story it was split from."""
    start, last, sums, sphase = [], [], [], []
    story, prev = {}, {}
    for r in items:
        t, v, ph = fs.parse_iso(r["published"]), fs.vec(r["embedding"]), phases[r["id"]]
        alive = [k for k in range(len(sums)) if t - last[k] <= fs.WINDOW and t - start[k] <= fs.SPAN]
        best, blocked = None, None
        if alive:
            scores = np.stack([sums[k] / np.linalg.norm(sums[k]) for k in alive]) @ v
            for j in np.argsort(-scores):
                if scores[j] < fs.TAU:
                    break
                k = alive[j]
                if compatible(rule, ph, sphase[k]):
                    best = k
                    break
                blocked = k if blocked is None else blocked
        if best is None:
            best = len(sums)
            start.append(t)
            last.append(t)
            sums.append(v.copy())
            sphase.append("none")
            if blocked is not None:
                prev[best] = blocked
        else:
            sums[best] = sums[best] + v
            last[best] = max(last[best], t)
        if sphase[best] == "none":
            sphase[best] = ph
        story[r["id"]] = best
    return story, prev


def groups(story: dict[int, int]) -> dict[int, list[int]]:
    out: dict[int, list[int]] = {}
    for iid, s in story.items():
        out.setdefault(s, []).append(iid)
    return out


def accuracy(cache: dict, conf: float) -> None:
    gold = {i: p for g in GOLD.values() for i, p in g.items()}
    pred = {i: phase_of(cache, i, conf) for i in gold}
    side = lambda p: "before" if p in BEFORE else "after" if p in AFTER else "none"  # noqa: E731
    phased = [i for i in gold if pred[i] != "none"]
    exact = sum(pred[i] == gold[i] for i in gold)
    coarse = sum(side(pred[i]) == side(gold[i]) for i in phased)
    print(f"  conf {conf}: exact {exact}/{len(gold)} ({exact / len(gold):.0%})   with a phase {len(phased)}/{len(gold)}"
          f"   before/after right on those {coarse}/{len(phased)} ({coarse / max(len(phased), 1):.0%})")


def confusion(cache: dict, conf: float) -> None:
    gold = {i: p for g in GOLD.values() for i, p in g.items()}
    labels = list(CHOICES)
    m = Counter((gold[i], phase_of(cache, i, conf)) for i in gold)
    print(f"\n  confusion at conf {conf} (rows gold, columns d3)")
    print("  " + " " * 10 + "".join(f"{x:>10}" for x in labels))
    for g in ["preview", "live", "result", "reaction"]:
        print(f"  {g:10}" + "".join(f"{m[(g, x)]:>10}" for x in labels))


def event_line(story: dict[int, int], ids: dict[int, str]) -> str:
    by = {}
    for iid, p in ids.items():
        by.setdefault(story[iid], Counter())[p] += 1
    mixed = sum(1 for c in by.values() if set(c) & BEFORE and set(c) & AFTER)
    # purity: share of items whose story's majority gold phase is their own
    pure = sum(c.most_common(1)[0][1] for c in by.values()) / len(ids)
    return f"{len(by):>3} stories  {mixed} mix before+after  purity {pure:.0%}"


def outlets(items_by_id: dict, ids: list[int]) -> int:
    return len({items_by_id[i]["outlet"] for i in ids})


def changed(base: dict[int, int], other: dict[int, int], items_by_id: dict) -> list[list[int]]:
    """Baseline stories with two outlets or more and no gold item that the gate splits."""
    out = []
    for ids in groups(base).values():
        if outlets(items_by_id, ids) < 2 or GOLD_IDS & set(ids):
            continue
        if len({other[i] for i in ids}) > 1:
            out.append(ids)
    return out


def report(items: list, show: str | None) -> None:
    cache = read_cache()
    missing = sum(1 for r in items if str(r["id"]) not in cache)
    if missing:
        print(f"warning: {missing} items without a phase (run classify); they count as none\n")
    items_by_id = {r["id"]: r for r in items}

    print(f"Phases on {len(items)} items (d3, before the confidence cut): "
          + ", ".join(f"{k} {v}" for k, v in Counter(c["phase"] for c in cache.values()).most_common()))
    print("\nClassifier on the gold labels")
    for conf in CONFS:
        accuracy(cache, conf)
    confusion(cache, 0.6)

    base, _ = replay(items, {r["id"]: "none" for r in items}, "off")
    n_multi = sum(1 for ids in groups(base).values() if outlets(items_by_id, ids) >= 2)
    print(f"\nClustering (tau {fs.TAU}, window {fs.WINDOW}, span {fs.SPAN}); baseline {len(groups(base))} stories, {n_multi} with two outlets or more")
    configs = [("off", 0.6)] + [(rule, c) for rule in ("strict", "coarse", "anchor") for c in CONFS]
    runs = {}
    for rule, conf in configs:
        phases = {r["id"]: phase_of(cache, r["id"], conf) for r in items}
        runs[(rule, conf)] = replay(items, phases, rule)
    print(f"\n  {'config':12}" + "".join(f"  {name:48}" for name in GOLD) + "  normal stories split")
    for (rule, conf), (story, _) in runs.items():
        name = "off" if rule == "off" else f"{rule}:{conf}"
        split = len(changed(base, story, items_by_id))
        print(f"  {name:12}" + "".join(f"  {event_line(story, ids):48}" for ids in GOLD.values()) + f"  {split}/{n_multi}")

    if show:
        rule, conf = show.split(":")
        story, prev = runs[(rule, float(conf))]
        cache_phase = lambda i: phase_of(cache, i, float(conf))  # noqa: E731
        for name, ids in GOLD.items():
            print(f"\n=== {name} with {show}  (gold / d3 phase)")
            for s, members in sorted(groups({i: story[i] for i in ids}).items()):
                link = f"  split from story {prev[s]}" if s in prev else ""
                print(f"  story {s}{link}")
                for i in sorted(members, key=lambda i: items_by_id[i]["published"]):
                    r = items_by_id[i]
                    print(f"    {ids[i]:8} {cache_phase(i):8} {r['published'][5:16]} {r['title'][:80]}")
        print(f"\n=== normal stories split by {show}")
        for ids in changed(base, story, items_by_id):
            for s, members in groups({i: story[i] for i in ids}).items():
                print(f"  story {s}")
                for i in members:
                    print(f"    {cache_phase(i):8} {items_by_id[i]['title'][:90]}")
            print()


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("step", choices=["classify", "report"])
    ap.add_argument("--show", help="RULE:CONF, for example strict:0.6")
    args = ap.parse_args()
    db = sqlite3.connect(f"file:{fs.DB}?mode=ro", uri=True)
    db.row_factory = sqlite3.Row
    items = load_items(db)
    classify(items) if args.step == "classify" else report(items, args.show)


if __name__ == "__main__":
    main()
