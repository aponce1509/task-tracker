# Taxonomy management - clusters, types, subtypes

Companion to rule 4 of `SKILL.md`. The single source of truth is
`.obsidian/personal_scripts/taxonomy.json`; the notes in
`02 - Categories/_types/` and `02 - Categories/_subtypes/` are **generated**
(never hand-edit or hand-create them). All operations go through the CLI:

```bash
CLI=".obsidian/personal_scripts/taxonomy.sh"
bash "$CLI" help
```

- The CLI resolves the vault from its own path - run it from anywhere.
- Guards: a typo in a cluster/type/slug aborts the edit; the JSON is untouched.
- Mutations regenerate the notes automatically (`--no-gen` to skip) and warn
  about orphaned files left behind by renames/removals.
- In the examples: `c` = cluster, `t` = type, `s` = subtype slug, `d` = description.

> [!warning] Approval gate
> A new type/subtype needs explicit user approval and must be non-redundant,
> consistent and enable a real query - [[WORKFLOWS - New Tags & Types]].

## Inspect

```bash
bash "$CLI" tree                     # clusters → types → subtypes
bash "$CLI" counts                   # clusters: 9   types: 25   subtypes: 103
bash "$CLI" orphans                  # generated files no longer present in the JSON
bash "$CLI" verify                   # JSON + expected files + orphans (rc=1 on missing files)
bash "$CLI" sweep "HowTos"           # notes referencing a term (fixed strings, OR)
```

## Add

```bash
bash "$CLI" add-cluster "Regulated"
bash "$CLI" add-type "Regulated" "Playbooks"
bash "$CLI" add-subtype "Regulated" "Playbooks" "incident-response" \
  "Paging steps and escalation paths."
```

The new type/subtype notes appear immediately. Aliases are managed by the
generator (`<slug>`, or `<Type> <slug>` when the slug collides vault-wide).

## Edit

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
bash "$CLI" clean                      # dry run - show what would be deleted
bash "$CLI" clean -f                   # delete them
bash "$CLI" sweep "incident-response"  # notes still linking the old name
```

Update the matched notes to the new name; prefer the long link form
`[[<file>|<alias>]]`.

## Remove

```bash
bash "$CLI" rm-subtype "Regulated" "Playbooks" "oncall"
bash "$CLI" rm-type "Regulated" "Playbooks"
bash "$CLI" rm-cluster "Regulated"
```

> [!warning] Removing does not fix notes. Sweep (`bash "$CLI" sweep "<name>"`),
> migrate or reclassify the matches, then `clean -f` the old generated files.

## Sync

```bash
bash "$CLI" generate                 # regenerate all notes from the JSON
```

Use it after `--no-gen` batches. `verify` should end with
`generated notes: all expected files exist` and `orphans: none`.

## Options & recovery

- `--no-gen` anywhere: e.g. `bash "$CLI" --no-gen rm-type "Operational" "Playbooks"`.
- Env overrides for non-standard setups: `TAXONOMY_JSON`, `SUBTYPES_DIR`, `TYPES_DIR`.
- Rollback: `git restore -- .obsidian/personal_scripts/taxonomy.json "02 - Categories"`.
