# System - Taxonomy (clusters, types, subtypes)

Identity of a note = ONE `type` at a time + multi-value `subtypes`. Canonical
source: [[Information Architecture & Taxonomy Model]].

> [!important] The taxonomy is GENERATED, not hand-written
> 1. Source of truth: `.obsidian/personal_scripts/taxonomy.json`
>    (clusters → types → subtypes, each subtype with a description).
> 2. Type notes → `02 - Categories/_types/` · Subtype notes →
>    `02 - Categories/_subtypes/` - never hand-create or hand-edit them.
> 3. Aliases: the subtype slug when unique vault-wide; `<Type> <slug>` when it
>    collides, so `[[links]]` are never ambiguous.

All operations go through the CLI (it resolves the vault from its own path,
run it from anywhere; guards abort on typos and mutations regenerate the
generated notes automatically):

```bash
CLI=".obsidian/personal_scripts/taxonomy.sh"
bash "$CLI" help
```

In the examples below: `c` = cluster, `t` = type, `s` = subtype slug,
`d` = description.

## Choosing type and subtypes for a note

- The `type` answers "what IS this note?" - structural identity, exactly one
  at a time. It determines the expected schema of the note.
- A note may change type as it matures (e.g. a `hypothesis` rewritten into a
  `design-doc`). Rewrite it in place: set the new `type` and `subtypes`
  together, adapt the frontmatter to the new schema (class fields), raise
  `maturity` if it applies, and fix links that used the old subtype alias
  (`bash "$CLI" sweep "<old-subtype>"`). Do not split into a new note just to
  change type.
- `subtypes` classify within that identity and enable grouping in Bases.
  Read the subtype descriptions in `taxonomy.json` before choosing.
- Link subtypes with the alias form: `"[[Knowledge - Roadmaps - course|course]]"`.
- MoCs and indexes provide navigation, never classification.

Inspect the current taxonomy:

```bash
bash "$CLI" tree                     # clusters → types → subtypes
bash "$CLI" counts                   # how many of each
bash "$CLI" orphans                  # generated files no longer in the JSON
bash "$CLI" verify                   # JSON + expected files + orphans
bash "$CLI" sweep "HowTos"           # notes referencing a term (fixed strings, OR)
```

## The taxonomy at a glance

| Cluster | Types |
| --- | --- |
| Your Brain | Ideas, Reflections, Inquiries, Mental Models |
| External Knowledge | Medias, Resources |
| Normative (what should be true) | Requirements, Specs, Decisions, Standards |
| Descriptive (what is true) | Architectures, Project Contexts |
| Operational | Issues, Solutions, HowTos, Meetings |
| Knowledge | Roadmaps, Core Knowledge, Syntheses, Emergent Thoughts, Annotations |
| Artifacts | Assets |
| Logging | Journals |
| Navigation & Meta | Indexes, MoCs |

Run `bash "$CLI" tree` for the full subtype list with descriptions - the JSON
prevails on any mismatch.

## Adding a cluster, type or subtype

> [!warning] Approval gate
> A new type/subtype needs explicit user approval and must be non-redundant,
> consistent with the philosophy, and enable a real query -
> [[WORKFLOWS - New Tags & Types]]. Meditate first; propose, don't impose.

```bash
bash "$CLI" add-cluster "Regulated"
bash "$CLI" add-type "Regulated" "Playbooks"
bash "$CLI" add-subtype "Regulated" "Playbooks" "incident-response" \
  "Paging steps and escalation paths."
```

The new type/subtype notes appear immediately in `02 - Categories/`; aliases
are managed by the generator. After adding, link the affected notes using the
long form `[[<file>|<alias>]]`.

## Renaming or re-describing

```bash
# Change a description
bash "$CLI" set-desc "Regulated" "Playbooks" "incident-response" "Updated text."

# Renames (description and position in the JSON are kept)
bash "$CLI" rename-subtype "Regulated" "Playbooks" "incident-response" "oncall"
bash "$CLI" rename-type "Regulated" "Playbooks" "Runsheets"
bash "$CLI" rename-cluster "Regulated" "Compliance"
```

Renames leave the old generated files behind and break links to the old name:

```bash
bash "$CLI" orphans                    # list leftovers
bash "$CLI" sweep "incident-response"  # notes still linking the old name
```

Update the matched notes to the new name; prefer the long link form
`[[<file>|<alias>]]`.

## Removing a cluster, type or subtype

```bash
bash "$CLI" rm-subtype "Regulated" "Playbooks" "oncall"
bash "$CLI" rm-type "Regulated" "Playbooks"
bash "$CLI" rm-cluster "Regulated"
```

> [!warning] Removing does not fix notes
> Sweep (`bash "$CLI" sweep "<name>"`), migrate or reclassify the matches,
> then clean the old generated files.

## Orphan cleanup

```bash
bash "$CLI" orphans                    # list generated files no longer in the JSON
bash "$CLI" clean                      # dry run - show what would be deleted
bash "$CLI" clean -f                   # delete them
```

## Sync and recovery

```bash
bash "$CLI" generate                   # regenerate all notes from the JSON
```

Use `generate` after `--no-gen` batches. `verify` should end with
`generated notes: all expected files exist` and `orphans: none`.

- `--no-gen` anywhere: e.g. `bash "$CLI" --no-gen rm-type "Operational" "Playbooks"`.
- Env overrides for non-standard setups: `TAXONOMY_JSON`, `SUBTYPES_DIR`, `TYPES_DIR`.
- Rollback: `git restore -- .obsidian/personal_scripts/taxonomy.json "02 - Categories"`.
