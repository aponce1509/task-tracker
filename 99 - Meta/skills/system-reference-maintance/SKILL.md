---
name: system-reference-maintance
description:
  Audit that the vault mechanics still match their canonical references
  after any change - types/subtypes taxonomy, properties and Metadata Menu
  classes, tags, and Bases vs the Search & Base Queries Reference
  cheatsheet. Read-only, it reports findings. Use after any system
  modification, for periodic reviews, or on suspected drift.
---

# System Reference Maintance

Keep the metadata engines honest. Every dimension of a note is governed by a
reference; anything in the vault that the reference does not declare is drift,
and this skill finds it.

## Run

```bash
S="99 - Meta/skills/system-reference-maintance/scripts/audit.py"
python3 $S --quick            # fast drift check: new items + debt counts, no Obsidian needed
python3 $S                    # full report incl. every known-debt item and INFO seeds
python3 $S --verbose --section=tags   # one engine: types|tags|properties|bases|cli
python3 $S --accept           # re-baseline (see below)
```

Python 3 stdlib only. Exit code 1 only when something is **NEW**.

### Baseline model

`audit-baseline.json` (next to `SKILL.md`) holds the accepted known debt. Every
FAIL/WARN is either:

- **NEW** — not in the baseline, or an aggregate count that grew (`[grew from N]`).
  This is drift: a new tag, key, type, undocumented base… Exit 1.
- **KNOWN DEBT** — in the baseline. Always listed (counts under `--quick`) so it
  stays visible and gets paid down eventually; never blocks.
- **RESOLVED** — in the baseline but no longer found. Run `--accept` to drop it.

`--accept` rewrites the baseline from the current findings. Run it ONLY after
every NEW item has been handled (fixed, or the reference extended) or the user
explicitly accepts it as debt. Never accept to silence an unreviewed finding.

Markers: `[✗]` FAIL (contract broken) · `[!]` WARN (pending migration / doc drift /
needs a decision) · `[·]` INFO (coverage, manual-diff seeds).

## What each check verifies (and against what)

| Check | Source of truth | Catches |
| --- | --- | --- |
| `types` | `.obsidian/personal_scripts/taxonomy.json` + generated `02 - Categories/_types/` `_subtypes/` | generated files out of sync (missing/orphans), `type:` and `subtypes:` links whose target is not in the taxonomy, alias ≠ slug (e.g. `topic_index` vs `topic-index`), notes of a type without subtypes |
| `tags` | [[Tag System & Ontology]] (the 4 canonical: `#learnable` `#sentations_request` `#rfm` `#todo`) | tags in use that no reference registers, legacy dimensional `#_*` tags pending migration, registered-but-not-canonical tags to confirm |
| `properties` | `99 - Meta/Class/*.md` (class chains: commons → par/issue/media/…) | `file_class` values that are not classes, keys outside the class schema (per-file-class counts), forbidden legacy keys (`lifecycle`, `subtype`, `para_type`), the legacy `complete:` dual bookkeeping, done-rule disagreement |
| `bases` | `04 - Bases/final-bases/` + [[Search & Base Queries Reference]] | bases documented nowhere / documented but gone, types with no working view (e.g. a filter `type == link("Decissions")` — typo — matches nothing), per-subtype view coverage vs the per-type wing rollout |
| `cli` | the running Obsidian app | every final base parsing headless via `base:query`, unresolved link count |

Two more things the script prints as `INFO` seeds for the manual part below:
distinct keys per `file_class`, and key/class mismatches inside legacy zones
(`01 - PAR/archive`, `06 - Inputs`, `07 - Daily`, `Templates 1`, … —
pre-engine content, collect for bulk migration later).

## The agent's part

1. **Class ↔ schemas-doc diff** — for each `file_class` INFO line, compare the
   distinct keys against `99 - Meta/Class/<class>.md` fields and
   [[Common Frontmatter Schemas & Specific Note Templates]]. Verdicts:
   extend the class (Metadata Menu + the doc), or fix the notes.
2. **Decide every NEW item** — migrate the note, or extend the reference so it
   is declared (see *Extending the references*). Only if neither applies, leave
   it as debt via `--accept`. Do not edit `audit.py` for a new tag/type/key.
3. **Re-read the bases warnings with care** — a view that matches nothing
   (typo in `link("…")`) is FAIL-grade in practice: fix the `.base` or the
   taxonomy name, and update the cheatsheet row.

## Escalation — never fix silently

- Real work (migrations, renames, base restructures, class extensions) →
  `bash .obsidian/personal_scripts/create-issue.sh` with the finding as
  Description. Audit output is the issue body.
- Taxonomy moves → approval gate first ([[WORKFLOWS - New Tags & Types]],
  [[WORKFLOWS - New Properties]]), then the `taxonomy.sh` CLI; generated
  files and `taxonomy.json` are never hand-edited.
- Reference drift → update the reference note in the same sitting (bases →
  cheatsheet; tag → Tag System & Ontology; field → schemas doc).
- Then re-run the audit; done means exit 0 (no NEW). Known debt may remain.

## Extending the references (the script derives from these — edit them, not the script)

| Change | Edit | Audit then reads it from |
| --- | --- | --- |
| new canonical tag | bullet `` - `#tag`: … `` under `## Canonical Tags` in [[Tag System & Ontology]] (after the approval gate) | parsed at runtime |
| pending tag | any other backticked `` `#tag` `` in that note | parsed at runtime |
| deprecate a tag | mention it as `` `#_name` `` in that note | parsed at runtime |
| new type / subtype | `taxonomy.sh` CLI (never hand-edit) | `taxonomy.json` |
| new property | field in `99 - Meta/Class/<class>.md` + schemas doc | class files |
| new base | file in `04 - Bases/final-bases/` + row in [[Search & Base Queries Reference]] | both |

Only path constants, `FORBIDDEN_KEYS`, `EXEMPT_KEYS`, `SKIP_PREFIXES` and the
`active_zone` tuple live in `audit.py`; touch them only when the vault layout
itself changes.

## When to run

- Right after ANY mod (base, template, class, taxonomy, tag, property) —
  before calling the change done.
- Periodic review: bi-monthly rhythm, guided by [[System Maintenance & Review]]
  (the full procedure, checklists and escalation rules).
- Whenever the user suspects drift ("is a new tag escaping?", "does the
  taxonomy still match?", "are the bases coherent?").

Companions: [[The Retrieval system]] (target base design) · [[The Metadata
system]] (the engines being audited) · [[system-tags]] philosophy in
`99 - Meta/skills/obsidian-vault-notes/references/`.
