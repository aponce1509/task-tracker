#!/usr/bin/env python3
# audit.py - system-reference-maintance audit (read-only).
#
# Verifies that the vault mechanics still match their canonical references:
# the taxonomy (types/subtypes), the Metadata Menu classes (properties),
# the 4 canonical tags, and the Bases coverage. Zero dependencies.
#
# Run from anywhere: python3 "99 - Meta/skills/system-reference-maintance/scripts/audit.py" [vault_root]
# Flags: --verbose · --section=tags|types|properties|bases|cli · --no-obsidian
#        --quick   (types/tags/properties/bases only, short output)
#        --accept  (rewrite audit-baseline.json from the current FAIL/WARN findings)
#
# Baseline model: every FAIL/WARN is either NEW (not in audit-baseline.json, or an
# aggregate count that grew) or KNOWN DEBT (in the baseline). Debt is always listed
# so it stays visible; only NEW findings make the exit code 1.

import json
import re
import subprocess
import sys
from pathlib import Path

# ----- configuration -----
# Tags are NOT configured here: canonical / pending / legacy tags are parsed from
# TAG_REFERENCE (see load_tag_reference). Edit the note, not this script.
FORBIDDEN_KEYS = {"lifecycle", "subtype", "para_type"}  # old names of properties
EXEMPT_KEYS = {"file_class", "aliases", "cssclasses", "title"}  # native/Obsidian
TAG_REFERENCE = "11 - Projects/second-brain/_0_final/Tag System & Ontology.md"
QUERIES_REFERENCE = "11 - Projects/second-brain/_0_final/Search & Base Queries Reference.md"
TYPES_DIR = "02 - Categories/_types"
SUBTYPES_DIR = "02 - Categories/_subtypes"
CLASS_DIR = "99 - Meta/Class"
BASES_DIR = "04 - Bases/final-bases"
SKIP_DIRS = {".obsidian", ".opencode", ".trash", ".git", "node_modules"}
SKIP_PREFIXES = ("99 - Meta/Calendar/", "99 - Meta/Excalidraw/")  # plugin-managed system files, not notes
HABIT_FREE = re.compile(r"^07 - Daily/|^99 - Meta/Templates/(Daily|Weekly) Note - Template\.md$")
# Daily/weekly notes are habit trackers: their properties are free by design
# (daily habit keys like calorias/toothTimes/films are valid there), not drift.

BASELINE_FILE = Path(__file__).resolve().parent.parent / "audit-baseline.json"

findings = []  # dicts: section, level (FAIL|WARN|INFO), msg, key, n


def _add(level, section, msg, key, n):
    findings.append({"section": section, "level": level, "msg": msg,
                     "key": f"{section}|{key or msg}", "n": n})


def fail(section, msg, key=None, n=None):
    _add("FAIL", section, msg, key, n)


def warn(section, msg, key=None, n=None):
    _add("WARN", section, msg, key, n)


def info(section, msg):
    _add("INFO", section, msg, None, None)


# ---------------------------------------------------------------- frontmatter
def split_frontmatter(text):
    if not text.startswith("---\n"):
        return {}, text
    try:
        end = text.index("\n---\n", 3)
    except ValueError:
        try:
            end = text.index("\n---", 3)
        except ValueError:
            return {}, text
    block = text[4:end]
    return parse_block(block), text[end + 5:]


def parse_block(block):
    """Minimal frontmatter parser: top-level scalars + one-level string lists.
    Inline arrays (`key: [a, b]`) become lists; surrounding quotes are stripped."""
    props = {}
    current = None

    def unquote(v):
        v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1].strip()
        return v

    for line in block.splitlines():
        if not line.strip():
            current = None
            continue
        top = re.match(r"^([A-Za-z_][\w ]*):\s*(.*)$", line)
        if top and not line.startswith((" ", "\t")):
            current = top.group(1)
            val = top.group(2).strip()
            if val in ("", "[]"):
                props[current] = []
            elif val.startswith("[") and val.endswith("]"):
                inner = unquote(val[1:-1])
                props[current] = [unquote(x) for x in inner.split(",")] if inner else []
            else:
                props[current] = unquote(val)
            continue
        item = re.match(r"^\s*-\s+(.*)$", line)
        if item and current:
            props.setdefault(current, [])
            if isinstance(props[current], list):
                props[current].append(unquote(item.group(1)))
    return props


def link_target(value):  # "[[Name|alias]]" / "Name|alias" -> (Name, alias)
    if isinstance(value, list):
        value = value[0] if value else ""
    if not isinstance(value, str):
        return "", None
    v = value.strip()
    if v.startswith("[[") and v.endswith("]]"):
        v = v[2:-2]
    elif v.startswith("[") and v.endswith("]"):
        v = v[1:-1]
    if "|" in v:
        target, alias = v.split("|", 1)
        return target.strip(), alias.strip()
    return v, None


# ---------------------------------------------------------------- references
def load_taxonomy(root):
    data = json.loads((root / ".obsidian/personal_scripts/taxonomy.json").read_text())
    types = {}
    subnames = set()  # full generated-note names: "<Cluster> - <Type> - <slug>"
    for cluster, cls in data.items():
        for ctype, subs in cls.items():
            types[ctype] = dict(subs or {})
            for slug in (subs or {}):
                subnames.add(f"{cluster} - {ctype} - {slug}")
    return types, subnames


def load_tag_reference(root):
    """Parse TAG_REFERENCE: (canonical, pending, legacy).
    canonical = backticked #tags in the '## Canonical Tags' section; legacy = `#_name`
    mentions anywhere (deprecated dimensional tags); pending = any other backticked #tag."""
    ref = root / TAG_REFERENCE
    if not ref.exists():
        return set(), set(), set()
    text = ref.read_text()
    canonical = set()
    m = re.search(r"^##\s+Canonical Tags\s*$(.*?)(?=^##\s)", text, re.S | re.M)
    if m:
        canonical = set(re.findall(r"`#([A-Za-z][\w/-]*)`", m.group(1)))
    legacy = {t.lstrip("_") for t in re.findall(r"`#(_[\w-]+)`", text)}
    pending = set(re.findall(r"`#([A-Za-z][\w/-]*)`", text)) - canonical - legacy
    return canonical, pending, legacy


def load_classes(root):
    classes = {}
    for f in sorted((root / CLASS_DIR).glob("*.md")):
        fm, _ = split_frontmatter(f.read_text())
        fields = set()
        for fl in fm.get("fields", []) or []:
            if isinstance(fl, str):
                m = re.match(r"name:\s*(\S+)", fl)
                if m:
                    fields.add(m.group(1))
        classes[f.stem] = {"extends": fm.get("extends", "") or [], "fields": fields}
    return classes


def class_chain(classes, name):
    chain, seen = [], set()
    cur = name
    while cur and cur not in seen and cur in classes:
        seen.add(cur)
        chain.append(cur)
        cur = classes[cur]["extends"]
        if isinstance(cur, list):
            cur = cur[0] if cur else None
    return [c for c in chain if c in classes]


def class_fields(classes, name):
    return set().union(*(classes[c]["fields"] for c in class_chain(classes, name)))


# ---------------------------------------------------------------- checks
def check_types(root, types, subnames, verbose):
    info("types", f"taxonomy.json: {len(types)} types, "
                  f"{sum(len(s) for s in types.values())} subtypes")
    gen_types = {f.stem for f in (root / TYPES_DIR).glob("*.md")}
    gen_subtypes = {f.stem for f in (root / SUBTYPES_DIR).glob("*.md")}
    missing_t = set(types) - gen_types
    orphan_t = gen_types - set(types)
    if missing_t:
        fail("types", f"generated type notes missing for: {sorted(missing_t)}")
    if orphan_t:
        fail("types", f"generated type notes not in taxonomy.json: {sorted(orphan_t)}")
    missing_s = subnames - gen_subtypes
    orphan_s = gen_subtypes - subnames
    if missing_s:
        fail("types", f"generated subtype notes missing: {sorted(missing_s)}")
    if orphan_s:
        fail("types", f"generated subtype notes not in taxonomy.json: {sorted(orphan_s)}")
    if not missing_t and not orphan_t and not missing_s and not orphan_s:
        info("types", "generated _types/_subtypes in sync with taxonomy.json")

    used_types, used_subs, empty_type = {}, {}, []
    for f in iter_notes(root):
        fm, _ = split_frontmatter(f.read_text())
        t, _alias = link_target(fm.get("type", "") or "")
        if t:
            used_types.setdefault(t, []).append(f)
            if t not in types:
                fail("types", f"{rel(root, f)}: type '{t}' not in taxonomy.json")
        else:
            empty_type.append(f)
        for s in fm.get("subtypes", []) or []:
            target, alias = link_target(s)
            if not target:
                continue
            used_subs.setdefault(target, []).append(f)
            if target not in subnames:
                fail("types", f"{rel(root, f)}: subtype '{s}' not in taxonomy.json")
            elif alias and alias != target.split(" - ")[-1]:
                warn("types", f"{rel(root, f)}: subtype alias '{alias}' != slug "
                              f"'{target.split(' - ')[-1]}' ({target})")
    unknown = sorted(set(used_types) - set(types))
    if unknown:
        fail("types", f"type links used but not in taxonomy: {unknown}")
    subs_no_home = sorted(set(used_subs) - subnames)
    if subs_no_home:
        fail("types", f"subtype links used but not in taxonomy: {subs_no_home}")
    info("types", f"type coverage: {len(set(used_types) & set(types))}/{len(types)} types in use; "
                  f"{len(empty_type)} notes with empty type "
                  f"(use --verbose to list)" if empty_type else
                  f"type coverage: {len(set(used_types) & set(types))}/{len(types)} types in use")
    no_sub_issues = [f for f in used_types.get("Issues", [])
                     if not rel(root, f).startswith("99 - Meta/Templates/")
                     and not (split_frontmatter(f.read_text())[0].get("subtypes") or [])]
    if no_sub_issues:
        warn("types", f"{len(no_sub_issues)} issue notes have no subtypes yet "
                      f"(templates exempt; --verbose to list)",
             key="issues-without-subtypes", n=len(no_sub_issues))


def check_tags(root, verbose):
    canonical, pending, legacy_names = load_tag_reference(root)
    if not canonical:
        fail("tags", f"could not parse canonical tags from '{TAG_REFERENCE}' "
                     f"(expected backticked `#tag` bullets under '## Canonical Tags')",
             key="tag-reference-unparseable")
        return
    known = canonical | pending
    tag_re = re.compile(r"(?<![\w#&/])#([A-Za-z_][\w/-]*)")
    seen = {}  # tag -> [files]
    for f in iter_notes(root):
        fm, body = split_frontmatter(f.read_text())
        found = set()
        tag_prop = fm.get("tags", []) or []
        if isinstance(tag_prop, str):  # scalar form: tags: code
            tag_prop = [tag_prop]
        for t in tag_prop:
            if isinstance(t, str):
                found.add(t.lstrip("#"))
        in_fence = False
        for line in body.splitlines():
            if line.lstrip().startswith("```"):
                in_fence = not in_fence
                continue
            if in_fence or "://" in line or line.startswith("#"):  # code, urls, headings
                continue
            line = re.sub(r"`[^`]*`", "", line)  # inline code
            line = re.sub(r"\[\[[^\]]*\]\]", "", line)  # wikilinks (#heading anchors)
            found.update(tag_re.findall(line))
        for t in found:
            if t and not re.fullmatch(r"[0-9A-Fa-f]{3,8}", t):  # hex colours, not tags
                seen.setdefault(t, []).append(f)
    unknown = {t: fs for t, fs in seen.items() if t not in known}
    for t, fs in sorted(unknown.items()):
        where = ", ".join(rel(root, x) for x in fs[:3]) + ("…" if len(fs) > 3 else "")
        if t.lstrip("_") in legacy_names:
            fail("tags", f"legacy dimensional tag #{t} in use ({len(fs)} files) — migrate "
                         f"to its property: {where}", key=f"legacy-tag:{t}", n=len(fs))
        else:
            warn("tags", f"tag #{t} in use ({len(fs)} files) but not registered in "
                         f"Tag System & Ontology — register or migrate: {where}",
                 key=f"unregistered-tag:{t}", n=len(fs))
    for t in sorted(set(seen) & pending):
        warn("tags", f"tag #{t} is only 'pending' in the reference, not canonical "
                     f"(confirm approval)", key=f"pending-tag:{t}", n=len(seen[t]))
    if not unknown and not (set(seen) & pending):
        info("tags", f"only canonical tags in use: {sorted(canonical)}")


def check_properties(root, classes, verbose):
    info("properties", f"classes: {sorted(classes)}")
    active_zone = ("01 - PAR/", "08 - Issues/", "00 - Map of Contents/",
                   "11 - Projects/second-brain/_0_final/", "99 - Meta/Templates/")

    def zone(p):
        return "active" if rel(root, p).startswith(active_zone) else "legacy"

    structure = {}      # file_class -> key usage (seed for the manual class diff)
    stray_keys = {}     # (class, key) -> count, active zones
    old_keys = {}       # (class, key) -> count, legacy zones
    legacy_zones = set()
    for f in iter_notes(root):
        if HABIT_FREE.search(rel(root, f)):
            continue  # daily/weekly habit trackers: properties are free by design
        fm, _ = split_frontmatter(f.read_text())
        fc_raw = fm.get("file_class", "") or ""
        if isinstance(fc_raw, list):
            fc_raw = fc_raw[0] if fc_raw else ""
        fc = fc_raw.strip() if isinstance(fc_raw, str) else ""
        if fc:
            structure.setdefault(fc, set()).update(fm.keys())
        else:
            structure.setdefault("(none)", set()).update(fm.keys())
        if fc and fc not in classes:
            fail("properties", f"{rel(root, f)}: file_class '{fc}' is not a class "
                               f"in 99 - Meta/Class/")
            continue
        eff = fc or "note"
        allowed = class_fields(classes, eff) | EXEMPT_KEYS
        z = zone(f)
        for key in fm:
            if key in FORBIDDEN_KEYS:
                fail("properties", f"{rel(root, f)}: forbidden key '{key}' "
                                   f"(use the schema name; see Common Frontmatter "
                                   f"Schemas)")
            elif key not in allowed:
                if z == "legacy":
                    legacy_zones.add(rel(root, f).split("/")[0] + "/")
                if z == "active":
                    stray_keys[(eff, key)] = stray_keys.get((eff, key), 0) + 1
                else:
                    old_keys[(eff, key)] = old_keys.get((eff, key), 0) + 1
    for (eff, key), n in sorted(stray_keys.items(), key=lambda kv: -kv[1]):
        warn("properties", f"key '{key}' outside class '{eff}' schema ({n} active-zone "
                           f"files) — extend the class or fix the note",
             key=f"stray-key:{eff}:{key}", n=n)
    if old_keys:
        info("properties", f"{len(old_keys)} key/class mismatches in legacy zones "
                           f"({sorted(legacy_zones)}) — pre-engine content, collect")
    for fc, keys in structure.items():
        info("properties", f"file_class {fc}: {len(keys)} distinct keys "
                           f"(check against 99 - Meta/Class + the schemas doc)")
    # issue hygiene: done-rule consistency
    done_conflict = 0
    for f in iter_notes(root, sub="08 - Issues"):
        fm, _ = split_frontmatter(f.read_text())
        status = (fm.get("status", "") or "").strip()
        in_complete = "/complete/" in str(f)
        done_any = status == "done" or in_complete
        done_all = status == "done" and in_complete
        if done_any and not done_all and f.parent.name == "Issues":
            done_conflict += 1
    if done_conflict:
        warn("properties", f"{done_conflict} active-folder issues read as done by one "
                           f"rule only (status/complete/folder disagreement)",
             key="issue-done-conflict", n=done_conflict)


# ---------------------------------------------------------------- bases / cli
def obsidian(args):
    try:
        r = subprocess.run(["obsidian", *args], capture_output=True, text=True,
                           stdin=subprocess.DEVNULL, timeout=60)
        return r.stdout.strip() + (r.stderr.strip() and "\n" + r.stderr.strip())
    except FileNotFoundError:
        return None
    except subprocess.TimeoutExpired:
        return "Error: timeout"


def check_bases(root, types, subnames, verbose):
    bases = sorted((root / BASES_DIR).glob("*.base"))
    ref = root / QUERIES_REFERENCE
    ref_bases = set()
    if ref.exists():
        ref_bases = set(re.findall(r"[\w-]+\.base", ref.read_text()))
    file_names = {b.name for b in bases}
    anywhere = {b.name for b in root.rglob("*.base")}
    in_ref = {n for n in ref_bases if (root / BASES_DIR / n) in bases}
    missing_in_ref = sorted(file_names - in_ref)
    if missing_in_ref:
        for n_ in missing_in_ref:
            warn("bases", f"base '{n_}' not documented in Search & Base Queries "
                          f"Reference", key=f"base-undocumented:{n_}")
    stale_in_ref = sorted(n for n in ref_bases - file_names if n not in anywhere)
    if stale_in_ref:
        for n_ in stale_in_ref:
            warn("bases", f"base '{n_}' documented in the reference but missing from "
                          f"the vault", key=f"base-stale:{n_}")
    covered_types, covered_subs = set(), set()
    for b in bases:
        text = b.read_text()
        covered_types |= set(re.findall(r'type == link\("([^"]+)"\)', text))
        covered_subs |= set(re.findall(r'subtypes\.contains\(link\("([^"]+)"\)\)', text))
    uncovered = sorted(set(types) - covered_types)
    if uncovered:
        for t in uncovered:
            warn("bases", f"type '{t}' has no working view in final-bases",
                 key=f"type-without-view:{t}")
    no_subtype_views = sorted(n for n in subnames
                              if n not in covered_subs)
    if no_subtype_views:
        info("bases", f"per-subtype views not yet generated ({len(no_subtype_views)}/"
                      f"{len(subnames)}) — the per-type wing rollout "
                      f"(model: issues-subtypes.base)")
    if not uncovered and not no_subtype_views:
        info("bases", "full type/subtype coverage in bases")


def check_cli(root):
    cli_ok = obsidian(["version"]) is not None
    if not cli_ok:
        info("cli", "obsidian CLI not available — skipping CLI checks")
        return
    bases = sorted((root / BASES_DIR).glob("*.base"))
    bad, empty, data = [], 0, 0
    for b in bases:
        out = obsidian(["base:query", "path=" + str(b.relative_to(root)),
                        "format=paths"]) or ""
        if out.startswith("Error"):
            bad.append(f"{b.name}: {out.splitlines()[0]}")
        elif out == "[]":
            empty += 1
        else:
            data += 1
    if bad:
        for b_ in bad:
            fail("cli", f"base fails to parse/query: {b_}", key=f"base-broken:{b_}")
    else:
        info("cli", f"all {len(bases)} final bases query OK via CLI "
                    f"({data} with data, {empty} scoped-empty/this.file)")
    unres = obsidian(["unresolved"]) or ""
    links = [l for l in unres.splitlines() if l and not l.startswith(("==", "-"))]
    if links:
        warn("cli", f"{len(links)} unresolved links (run 'obsidian unresolved' "
                    f"for the list; fix or unlink)", key="unresolved-links", n=len(links))


# ---------------------------------------------------------------- walk
def iter_notes(root, sub=None):
    base = root / sub if sub else root
    if not base.exists():
        return
    for f in sorted(base.rglob("*.md")):
        relp = str(f.relative_to(root))
        parts = relp.split("/")
        if sub is None and parts[0] in SKIP_DIRS:
            continue
        if sub is None and any(relp.startswith(p) for p in SKIP_PREFIXES):
            continue
        if sub is None and relp.startswith("99 - Meta/Class/"):
            continue  # class definitions, not notes
        yield f


def rel(root, f):
    return str(f.relative_to(root))


# ---------------------------------------------------------------- baseline
def load_baseline():
    try:
        return json.loads(BASELINE_FILE.read_text()).get("items", {})
    except (OSError, ValueError):
        return {}


def classify(baseline):
    """-> (new, debt, resolved_keys). A finding is debt if its key is baselined and its
    aggregate count did not grow."""
    new, debt, current = [], [], set()
    for f in findings:
        if f["level"] == "INFO":
            continue
        current.add(f["key"])
        if f["key"] in baseline:
            base_n = baseline[f["key"]]
            if f["n"] is not None and base_n is not None and f["n"] > base_n:
                new.append(dict(f, msg=f["msg"] + f"  [grew from {base_n}]"))
            else:
                debt.append(f)
        else:
            new.append(f)
    return new, debt, sorted(set(baseline) - current)


# ---------------------------------------------------------------- main
def main():
    args = sys.argv[1:]
    positional = [a for a in args if not a.startswith("-")]
    root = Path(positional[0] if positional
                else Path(__file__).resolve().parents[4]).resolve()
    verbose = "--verbose" in args
    quick = "--quick" in args
    no_obs = "--no-obsidian" in args or quick
    only = next((a.split("=", 1)[1] for a in args if a.startswith("--section=")), None)
    types, subnames = load_taxonomy(root)
    classes = load_classes(root)
    sections = {
        "types": lambda: check_types(root, types, subnames, verbose),
        "tags": lambda: check_tags(root, verbose),
        "properties": lambda: check_properties(root, classes, verbose),
        "bases": lambda: check_bases(root, types, subnames, verbose),
        "cli": (lambda: None) if no_obs else (lambda: check_cli(root)),
    }
    if only:
        if only not in sections:
            print(f"unknown section '{only}'; choose from {sorted(sections)}")
            sys.exit(2)
        sections = {only: sections[only]}
    for name, fn in sections.items():
        before = len(findings)
        try:
            fn()
        except Exception as e:  # never die mid-audit
            fail(name, f"check crashed: {e.__class__.__name__}: {e}", key=f"crash:{name}")
        if name == "cli" and no_obs:
            info("cli", "skipped (--no-obsidian)")
        elif len(findings) == before:
            info(name, "clean")

    if "--accept" in args:
        items = {f["key"]: f["n"] for f in findings if f["level"] != "INFO"}
        BASELINE_FILE.write_text(json.dumps({"items": dict(sorted(items.items()))},
                                            indent=1, ensure_ascii=False) + "\n")
        print(f"baseline written: {len(items)} accepted findings -> {BASELINE_FILE.name}")
        return

    baseline = load_baseline()
    new, debt, resolved = classify(baseline)
    if only:  # a partial run can't judge baseline entries of other sections
        resolved = [k for k in resolved if k.split("|", 1)[0] in sections]
    marker = {"FAIL": "✗", "WARN": "!", "INFO": "·"}
    print(f"# system-reference-maintance audit — vault: {root}\n")
    print(f"## NEW since baseline ({len(new)})")
    for f in new:
        print(f"[{marker[f['level']]}] {f['section']}: {f['msg']}")
    if not new:
        print("(nothing new — no drift)")
    print(f"\n## KNOWN DEBT still open ({len(debt)}) — address eventually")
    by_section = {}
    for f in debt:
        by_section.setdefault(f["section"], []).append(f)
    for sec, fs in by_section.items():
        if quick and not verbose:
            print(f"- {sec}: {len(fs)} open")
        else:
            for f in fs:
                print(f"[{marker[f['level']]}] {f['section']}: {f['msg']}")
    if resolved:
        print(f"\n## RESOLVED baseline entries ({len(resolved)}) — run --accept to drop")
        for k in resolved:
            print(f"[✓] {k}")
    if not quick:
        print("\n## INFO")
        for f in findings:
            if f["level"] == "INFO":
                print(f"[·] {f['section']}: {f['msg']}")
    print(f"\n{len(new)} new · {len(debt)} known debt · {len(resolved)} resolved")
    sys.exit(1 if new else 0)


if __name__ == "__main__":
    main()
