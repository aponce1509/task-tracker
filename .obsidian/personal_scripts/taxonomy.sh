#!/usr/bin/env bash
# taxonomy.sh - CLI to manage the second-brain taxonomy (clusters -> types -> subtypes).
#
# Source of truth : .obsidian/personal_scripts/taxonomy.json
# Generated notes : 02 - Categories/_types/ and 02 - Categories/_subtypes/
#
# Mutating commands edit the JSON through guarded jq filters, then regenerate
# the notes and flag orphaned files. Never hand-edit the generated notes.
#
# Run: taxonomy.sh help

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

TAX="${TAXONOMY_JSON:-$ROOT_DIR/.obsidian/personal_scripts/taxonomy.json}"
SUBTYPES_DIR="${SUBTYPES_DIR:-$ROOT_DIR/02 - Categories/_subtypes}"
TYPES_DIR="${TYPES_DIR:-$ROOT_DIR/02 - Categories/_types}"
GENERATOR="$SCRIPT_DIR/subtypes_generation.sh"

AUTO_GEN=1

info() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
taxonomy.sh - manage the second-brain taxonomy (clusters -> types -> subtypes)

Source of truth: .obsidian/personal_scripts/taxonomy.json. Mutating commands
edit the JSON, regenerate the notes and flag orphaned files; never hand-edit
the generated notes.

Usage: taxonomy.sh <command> [arguments] [--no-gen]

Inspect
  tree                                       Print the taxonomy as a tree
  counts                                     Print cluster/type/subtype counts
  orphans                                    List generated files no longer present in the JSON
  verify                                     Validate JSON, note files and orphans (exit 1 on problems)

Add
  add-cluster <cluster>
  add-type <cluster> <type>
  add-subtype <cluster> <type> <slug> <description>

Edit
  set-desc <cluster> <type> <slug> <description>
  rename-cluster <old> <new>
  rename-type <cluster> <old> <new>
  rename-subtype <cluster> <type> <old> <new>

Remove
  rm-cluster <cluster>
  rm-type <cluster> <type>
  rm-subtype <cluster> <type> <slug>

Sync
  generate                                   Regenerate notes from the JSON
  clean [-f|--force]                         Delete orphaned generated files (dry run without -f)
  sweep <term> [term...]                     Search vault notes for references (fixed strings, OR)

Options
  --no-gen    Do not regenerate after a mutation (pair with the generate command)

Env overrides: TAXONOMY_JSON, SUBTYPES_DIR, TYPES_DIR
EOF
}

need_args() { # need_args <min> <max|-> <usage>
  local min="$1" max="$2" usage_msg="$3"
  shift 3
  local n=$#
  if ((n < min)); then die "usage: $usage_msg"; fi
  if [[ "$max" != "-" ]] && ((n > max)); then die "usage: $usage_msg"; fi
}

apply_jq() { # apply_jq <jq args...> <filter> ; writes atomically, aborts on guard error
  local tmp
  tmp="$(mktemp)"
  if jq "$@" "$TAX" >"$tmp"; then
    mv "$tmp" "$TAX"
  else
    rm -f "$tmp"
    die "edit aborted - taxonomy.json is untouched"
  fi
}

do_generate() {
  [[ -f "$GENERATOR" ]] || die "generator not found: $GENERATOR"
  bash "$GENERATOR" "$TAX" "$SUBTYPES_DIR" >/dev/null
  local t s
  t="$(find "$TYPES_DIR" -maxdepth 1 -type f -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
  s="$(find "$SUBTYPES_DIR" -maxdepth 1 -type f -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
  info "notes regenerated from taxonomy.json ($t type files, $s subtype files in place)"
}

expected_subtype_files() {
  jq -r --arg dir "$SUBTYPES_DIR" '
    to_entries[] as $c
    | ($c.key | gsub("/"; " & ")) as $cc
    | $c.value | to_entries[] as $t
    | $t.value | keys[]
    | "\($dir)/\($cc) - \($t.key) - \(.).md"' "$TAX"
}

expected_type_files() {
  jq -r --arg dir "$TYPES_DIR" '[.[] | keys[]] | unique | .[] | "\($dir)/\(.).md"' "$TAX"
}

actual_md_files() {
  find "$1" -maxdepth 1 -type f -name '*.md' 2>/dev/null | LC_ALL=C sort || true
}

collect_orphans() { # files on disk that the JSON no longer generates
  comm -13 <(expected_subtype_files | LC_ALL=C sort) <(actual_md_files "$SUBTYPES_DIR") || true
  comm -13 <(expected_type_files | LC_ALL=C sort) <(actual_md_files "$TYPES_DIR") || true
}

collect_missing() { # files the JSON expects but that do not exist on disk
  comm -23 <(expected_subtype_files | LC_ALL=C sort) <(actual_md_files "$SUBTYPES_DIR") || true
  comm -23 <(expected_type_files | LC_ALL=C sort) <(actual_md_files "$TYPES_DIR") || true
}

after_mutation() {
  if [[ "$AUTO_GEN" -eq 1 ]]; then
    do_generate
    local orphans
    orphans="$(collect_orphans)"
    if [[ -n "$orphans" ]]; then
      info "warning: $(printf '%s\n' "$orphans" | wc -l | tr -d ' ') orphaned generated file(s) from renames/removals"
      info "  list: taxonomy.sh orphans    delete: taxonomy.sh clean -f"
    fi
  else
    info "Skipped regeneration (--no-gen). Run: taxonomy.sh generate"
  fi
}

# ---------------------------------------------------------------- inspect

cmd_tree() {
  need_args 0 0 "taxonomy.sh tree" "$@"
  jq -r '
def tree($p):
  (keys_unsorted) as $ks
  | [ $ks[] as $k
      | ($k == $ks[-1]) as $last
      | "\($p)\(if $last then "└── " else "├── " end)\($k)"
        + (if (.[$k] | type) == "object"
           then "\n" + (.[$k] | tree($p + (if $last then "    " else "│   " end)))
           else "" end)
    ]
  | join("\n");
tree("")' "$TAX"
}

cmd_counts() {
  need_args 0 0 "taxonomy.sh counts" "$@"
  jq -r '"clusters: \(length)   types: \([.[] | length] | add)   subtypes: \([.[][][]] | length)"' "$TAX"
}

cmd_orphans() {
  need_args 0 0 "taxonomy.sh orphans" "$@"
  local orphans
  orphans="$(collect_orphans)"
  if [[ -z "$orphans" ]]; then
    info "No orphaned files."
  else
    printf '%s\n' "$orphans"
  fi
}

cmd_verify() {
  need_args 0 0 "taxonomy.sh verify" "$@"
  if ! jq empty "$TAX" 2>/dev/null; then
    info "taxonomy.json: invalid JSON"
    exit 1
  fi
  info "taxonomy.json: valid JSON"
  info "  $(cmd_counts)"
  local rc=0 missing orphans
  missing="$(collect_missing)"
  orphans="$(collect_orphans)"
  if [[ -z "$missing" ]]; then
    info "generated notes: all expected files exist"
  else
    info "missing generated files (run: taxonomy.sh generate):"
    printf '%s\n' "$missing" | sed 's/^/    /'
    rc=1
  fi
  if [[ -z "$orphans" ]]; then
    info "orphans: none"
  else
    info "orphaned generated files (run: taxonomy.sh clean):"
    printf '%s\n' "$orphans" | sed 's/^/    /'
  fi
  exit "$rc"
}

# -------------------------------------------------------------------- add

cmd_add_cluster() {
  need_args 1 1 "taxonomy.sh add-cluster <cluster>" "$@"
  apply_jq --arg c "$1" '
    if (has($c) | not) then .[$c] = {}
    else error("cluster already exists: \($c)") end'
  after_mutation
}

cmd_add_type() {
  need_args 2 2 "taxonomy.sh add-type <cluster> <type>" "$@"
  apply_jq --arg c "$1" --arg t "$2" '
    if (.[$c] == null) then error("unknown cluster: \($c)")
    elif (.[$c] | has($t)) then error("type already exists: \($t)")
    else .[$c][$t] = {} end'
  after_mutation
}

cmd_add_subtype() {
  need_args 4 4 "taxonomy.sh add-subtype <cluster> <type> <slug> <description>" "$@"
  apply_jq --arg c "$1" --arg t "$2" --arg s "$3" --arg d "$4" '
    if (.[$c] == null) then error("unknown cluster: \($c)")
    elif (.[$c] | has($t) | not) then error("unknown type: \($t) in cluster \($c)")
    elif (.[$c][$t] | has($s)) then error("subtype already exists: \($s)")
    else .[$c][$t][$s] = $d end'
  after_mutation
}

# ------------------------------------------------------------------- edit

cmd_set_desc() {
  need_args 4 4 "taxonomy.sh set-desc <cluster> <type> <slug> <description>" "$@"
  apply_jq --arg c "$1" --arg t "$2" --arg s "$3" --arg d "$4" '
    if (.[$c] == null) then error("unknown cluster: \($c)")
    elif (.[$c] | has($t) | not) then error("unknown type: \($t) in cluster \($c)")
    elif (.[$c][$t] | has($s) | not) then error("subtype not found: \($s)")
    else .[$c][$t][$s] = $d end'
  after_mutation
}

cmd_rename_cluster() {
  need_args 2 2 "taxonomy.sh rename-cluster <old> <new>" "$@"
  apply_jq --arg old "$1" --arg new "$2" '
    if (has($old) | not) then error("unknown cluster: \($old)")
    elif has($new) then error("cluster already exists: \($new)")
    else with_entries(if .key == $old then .key = $new else . end) end'
  after_mutation
  info "check links with: taxonomy.sh sweep \"$1\""
}

cmd_rename_type() {
  need_args 3 3 "taxonomy.sh rename-type <cluster> <old> <new>" "$@"
  apply_jq --arg c "$1" --arg old "$2" --arg new "$3" '
    if (.[$c] == null) then error("unknown cluster: \($c)")
    elif (.[$c] | has($old) | not) then error("unknown type: \($old) in cluster \($c)")
    elif (.[$c] | has($new)) then error("target already exists: \($new)")
    else .[$c] |= with_entries(if .key == $old then .key = $new else . end) end'
  after_mutation
  info "check links with: taxonomy.sh sweep \"$2\""
}

cmd_rename_subtype() {
  need_args 4 4 "taxonomy.sh rename-subtype <cluster> <type> <old> <new>" "$@"
  apply_jq --arg c "$1" --arg t "$2" --arg old "$3" --arg new "$4" '
    if (.[$c] == null) then error("unknown cluster: \($c)")
    elif (.[$c] | has($t) | not) then error("unknown type: \($t) in cluster \($c)")
    elif (.[$c][$t] | has($old) | not) then error("subtype not found: \($old)")
    elif (.[$c][$t] | has($new)) then error("target already exists: \($new)")
    else .[$c][$t] |= with_entries(if .key == $old then .key = $new else . end) end'
  after_mutation
  info "check links with: taxonomy.sh sweep \"$3\""
}

# ----------------------------------------------------------------- remove

cmd_rm_cluster() {
  need_args 1 1 "taxonomy.sh rm-cluster <cluster>" "$@"
  apply_jq --arg c "$1" '
    if (has($c) | not) then error("unknown cluster: \($c)")
    else del(.[$c]) end'
  after_mutation
  info "sweep notes that still link this cluster: taxonomy.sh sweep \"$1\""
}

cmd_rm_type() {
  need_args 2 2 "taxonomy.sh rm-type <cluster> <type>" "$@"
  apply_jq --arg c "$1" --arg t "$2" '
    if (.[$c] == null) then error("unknown cluster: \($c)")
    elif (.[$c] | has($t) | not) then error("unknown type: \($t)")
    else del(.[$c][$t]) end'
  after_mutation
  info "sweep notes that still link this type: taxonomy.sh sweep \"$2\""
}

cmd_rm_subtype() {
  need_args 3 3 "taxonomy.sh rm-subtype <cluster> <type> <slug>" "$@"
  apply_jq --arg c "$1" --arg t "$2" --arg s "$3" '
    if (.[$c] == null) then error("unknown cluster: \($c)")
    elif (.[$c] | has($t) | not) then error("unknown type: \($t) in cluster \($c)")
    elif (.[$c][$t] | has($s) | not) then error("subtype not found: \($s)")
    else del(.[$c][$t][$s]) end'
  after_mutation
  info "sweep notes that still link this subtype: taxonomy.sh sweep \"$3\""
}

# ------------------------------------------------------------------- sync

cmd_generate() {
  need_args 0 0 "taxonomy.sh generate" "$@"
  do_generate
  local orphans
  orphans="$(collect_orphans)"
  if [[ -n "$orphans" ]]; then
    info "warning: $(printf '%s\n' "$orphans" | wc -l | tr -d ' ') orphaned generated file(s) - run: taxonomy.sh clean -f"
  fi
}

cmd_clean() {
  local force=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -f|--force|-y|--yes) force=1; shift ;;
      *) die "usage: taxonomy.sh clean [-f|--force]" ;;
    esac
  done
  local orphans
  orphans="$(collect_orphans)"
  if [[ -z "$orphans" ]]; then
    info "No orphaned files."
    return 0
  fi
  if [[ "$force" -eq 1 ]]; then
    local f
    while IFS= read -r f; do
      rm -f "$f"
      info "removed $f"
    done <<<"$orphans"
  else
    info "Dry run - would remove (pass -f to delete):"
    printf '%s\n' "$orphans" | sed 's/^/    /'
  fi
}

cmd_sweep() {
  need_args 1 - "taxonomy.sh sweep <term> [term...]" "$@"
  command -v rg >/dev/null 2>&1 || die "ripgrep (rg) is required"
  local pat_args=() t out rc
  for t in "$@"; do pat_args+=(-e "$t"); done
  out="$(cd "$ROOT_DIR" && rg -n --glob '*.md' -F "${pat_args[@]}" . 2>/dev/null)" && rc=0 || rc=$?
  case "$rc" in
    0) printf '%s\n' "$out" ;;
    1) info "No references found." ;;
    *) die "ripgrep failed" ;;
  esac
}

# ------------------------------------------------------------------- main

main() {
  command -v jq >/dev/null 2>&1 || die "jq is required (brew install jq)"
  [[ -f "$TAX" ]] || die "taxonomy file not found: $TAX"

  local args=() a
  for a in "$@"; do
    case "$a" in
      --no-gen) AUTO_GEN=0 ;;
      *) args+=("$a") ;;
    esac
  done
  if ((${#args[@]} == 0)); then
    usage
    exit 1
  fi

  local cmd="${args[0]}" i=1
  set --
  while ((i < ${#args[@]})); do
    set -- "$@" "${args[$i]}"
    i=$((i + 1))
  done

  case "$cmd" in
    help|-h|--help) usage ;;
    tree|list) cmd_tree "$@" ;;
    counts) cmd_counts "$@" ;;
    orphans) cmd_orphans "$@" ;;
    verify) cmd_verify "$@" ;;
    add-cluster) cmd_add_cluster "$@" ;;
    add-type) cmd_add_type "$@" ;;
    add-subtype) cmd_add_subtype "$@" ;;
    set-desc) cmd_set_desc "$@" ;;
    rename-cluster) cmd_rename_cluster "$@" ;;
    rename-type) cmd_rename_type "$@" ;;
    rename-subtype) cmd_rename_subtype "$@" ;;
    rm-cluster) cmd_rm_cluster "$@" ;;
    rm-type) cmd_rm_type "$@" ;;
    rm-subtype) cmd_rm_subtype "$@" ;;
    generate) cmd_generate "$@" ;;
    clean) cmd_clean "$@" ;;
    sweep) cmd_sweep "$@" ;;
    *) die "unknown command: $cmd (run 'taxonomy.sh help')" ;;
  esac
}

main "$@"
