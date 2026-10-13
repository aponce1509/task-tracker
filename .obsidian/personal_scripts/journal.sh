#!/usr/bin/env bash
# journal.sh - Project journal CLI for the second brain.
#
# Journals are the performance tracker + logbook of a project: a list of
# completed tasks with time taken, plus a chronological track of what was
# done, with comments, good things and bad things. Written as bullets, never
# tables - and ONLY edited through this script: the format must stay
# machine-parseable (the Log exports to Excel/CSV later), and a human must
# always see what to touch without breaking it.
#
# Entry format (bullets, human-first):
#
#   - 2026-10-13 14:30: Description with [[links]] inline when they exist
#     - kind::: done
#     - dur::: 45
#     - good::: whatever went well
#     - bad::: whatever went wrong
#     - extra lines in any format may follow the keys
#
# Links are never a key of their own - they live in the description.
#
# Run:  bash .obsidian/personal_scripts/journal.sh help
#
# Quick tour:
#   journal.sh new second-brain -d "Build journal of the second brain project"
#   journal.sh log --kind done --what "Implemented the parser" --dur 45 \
#     --link "[[_I00012 Implement all the queries]]" \
#     --good "Clean design" --bad "Regex escaping cost 30 min"
#   journal.sh link last "[[Meeting - Kickoff]]"      # link after the fact
#   journal.sh good "Script came out small"           # last entry
#   journal.sh append 1 "See the benchmark table below"
#   journal.sh debt "Subtypes generator is monolithic"
#   journal.sh product "CSV export recipe"
#   journal.sh reflect "Went smoother than expected"
#   journal.sh export --out journal.csv               # Excel-ready
#   journal.sh close

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ROOT_DIR="${JOURNAL_ROOT:-$ROOT_DIR}"

PROJECTS_DIR="$ROOT_DIR/11 - Projects"
PAR_DIR="$ROOT_DIR/01 - PAR"

info() { printf '%s\n' "$*"; }
warn() { printf 'warn: %s\n' "$*" >&2; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

trim() {
  local s="$*"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

one_line() { printf '%s' "$1" | tr -d '\n\r'; }

# Get a frontmatter value (empty when absent). Only reads the YAML block.
fm_get() {
  local file="$1" key="$2"
  awk -v k="$key" '
    NR == 1 && $0 == "---" { infm = 1; next }
    infm && $0 == "---" { exit }
    infm && index($0, k ":") == 1 { sub("^" k ": *", ""); print; exit }
  ' "$file"
}

is_journal_file() { [[ "$(fm_get "$1" file_class)" == "journal" ]] || return 1; }

journal_is_open() { [[ "$(fm_get "$1" status)" != "done" ]]; }

# First wikilink of the frontmatter = the project (paras comes first).
journal_project() {
  awk '
    NR == 1 && $0 == "---" { infm = 1; next }
    infm && $0 == "---" { exit }
    infm && /\[\[/ { s = $0; sub(/.*\[\[/, "", s); sub(/\]\].*/, "", s); print s; exit }
  ' "$1"
}

# ---------------------------------------------------------------------------
# File resolution: a positional path/name, a --project PAR name, or (when
# exactly one open journal exists) nothing at all.
# ---------------------------------------------------------------------------
all_journal_files() {
  find "$PROJECTS_DIR" -maxdepth 3 -name 'Journal*.md' -print 2>/dev/null | LC_ALL=C sort
}

resolve_journal() { # $1 = positional value ("" allowed), $2 = --project value
  local pos="${1:-}" proj="${2:-}" candidate
  local -a open=()

  if [[ -n "$pos" ]]; then
    if [[ -f "$pos" ]]; then
      candidate="$pos"
    elif [[ -f "$ROOT_DIR/$pos" ]]; then
      candidate="$ROOT_DIR/$pos"
    else
      # positional may be the journal's note name (e.g. "Journal - second-brain")
      while IFS= read -r f; do
        if [[ "$(basename "$f" .md)" == "$pos" ]]; then
          candidate="$f"
          break
        fi
      done < <(all_journal_files)
    fi
  fi

  if [[ -n "${candidate:-}" ]]; then
    is_journal_file "$candidate" || die "not a journal file (file_class: journal missing): $candidate"
    printf '%s\n' "$candidate"
    return
  fi

  if [[ -n "$proj" ]]; then
    local dir="$PROJECTS_DIR/$proj"
    [[ -d "$dir" ]] || die "no project folder for '$proj' (expected $dir)"
    while IFS= read -r f; do
      is_journal_file "$f" || continue
      journal_is_open "$f" && open+=("$f")
    done < <(find "$dir" -maxdepth 1 -name 'Journal*.md' -print 2>/dev/null | LC_ALL=C sort)
    case ${#open[@]} in
      1) printf '%s\n' "${open[0]}"; return ;;
      0) die "no open journal for '$proj' - create one: journal.sh new $proj -d \"...\"" ;;
      *) die "several open journals for '$proj' - name one explicitly:
$(printf '  %s\n' "${open[@]}")" ;;
    esac
  fi

  while IFS= read -r f; do
    is_journal_file "$f" || continue
    journal_is_open "$f" && open+=("$f")
  done < <(all_journal_files)
  case ${#open[@]} in
    1) printf '%s\n' "${open[0]}"; return ;;
    0) die "no open journal found under $PROJECTS_DIR - create one: journal.sh new <project> -d \"...\" (or pass the file / --project)" ;;
    *) die "several open journals - name one (file path or --project):
$(printf '  %s\n' "${open[@]}")" ;;
  esac
}

require_open() {
  journal_is_open "$1" || die "journal is closed (status: done) - reopen first: journal.sh reopen"
}

# ---------------------------------------------------------------------------
# Log entries. An entry starts at a top-level bullet "- <date> <time>: ...";
# its keys are nested "  - key::: value" bullets; anything else (indented) is
# free content of that entry.
# ---------------------------------------------------------------------------
insert_after() { # <file> <lineno> <newline(s)>
  local file="$1" ln="$2" newline="$3"
  LN="$ln" NEW="$newline" awk '
    { print }
    NR == ENVIRON["LN"] { print ENVIRON["NEW"] }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

replace_line() { # <file> <lineno> <newline>
  local file="$1" ln="$2" newline="$3"
  LN="$ln" NEW="$newline" awk '
    NR == ENVIRON["LN"] { print ENVIRON["NEW"]; next }
    { print }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

# "start:end" line ranges of every Log entry (file order; entry 1 first).
entry_range() { # <file>
  awk '
    /^## Log$/ { inlog = 1; next }
    !inlog { next }
    /^## / { exit }
    /^- [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]: / {
      if (start) print start ":" end
      start = NR; end = NR; next
    }
    { if (start && NF) end = NR }
    END { if (start) print start ":" end }
  ' "$1"
}

entry_count() { entry_range "$1" | wc -l | tr -d ' '; }

# Line number after which new bullets are appended (end of section content).
section_append_ln() { # <file> <heading>
  awk -v h="## $2" '
    $0 == h { ins = NR; insec = 1; next }
    insec && /^## / { exit }
    insec && NF { ins = NR }
    END { print ins + 0 }
  ' "$1"
}

section_append() { # <file> <heading> <line>
  local ln
  ln="$(section_append_ln "$1" "$2")"
  [[ "$ln" -gt 0 ]] 2>/dev/null || die "section not found: ## $2"
  insert_after "$1" "$ln" "$3"
}

section_items() { # <heading> <file> - print bullet items of a section
  awk -v h="## $1" '
    $0 == h { insec = 1; next }
    insec && /^## / { exit }
    insec && /^- / { print substr($0, 3) }
  ' "$2"
}

fm_set_status() { # <file> <value>
  awk -v v="$2" '
    NR == 1 && $0 == "---" { infm = 1; print; next }
    infm == 1 && $0 == "---" { infm = 2; print; next }
    infm == 1 && /^status:/ { print "status: " v; next }
    { print }
  ' "$1" > "$1.tmp" && mv "$1.tmp" "$1"
}

valid_date() { [[ "$1" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; }
valid_time() { [[ "$1" =~ ^[0-9]{2}:[0-9]{2}$ ]]; }
valid_wikilink() { # [[Note]], [[Note|alias]], [[Note#Heading]]...
  [[ "$1" =~ ^\[\[[^][]+((\|[^][]*)|(#[^][]*))?\]\]$ ]]
}

_entry_target() { # <file> <n|last> -> n
  local file="$1" n="$2" total range
  total="$(entry_count "$file")"
  if [[ "$total" -eq 0 ]]; then
    die "the Log has no entries yet"
  fi
  if [[ "$n" == "last" ]]; then
    printf '%s' "$total"
  elif [[ "$n" =~ ^[0-9]+$ ]] && [[ "$n" -ge 1 && "$n" -le "$total" ]]; then
    printf '%s' "$n"
  else
    die "entry must be a number 1..$total or 'last' (got: $n)"
  fi
}

entry_nth_range() { # <file> <n> -> "start:end" (n must be valid)
  entry_range "$1" | sed -n "$2p"
}

# Create or update a "  - key::: value" bullet inside entry <n>. Keys stay
# grouped: a missing key is inserted right after the last key bullet (or
# directly under the entry line when the entry has no keys yet).
set_entry_key() { # <file> <n> <key> <value>
  local file="$1" n="$2" key="$3" value="$4"
  local range start end ln kln anchor
  range="$(entry_nth_range "$file" "$n")"
  [[ -n "$range" ]] || die "log entry not found: $n (see 'journal.sh show')"
  start="${range%%:*}"
  end="${range##*:}"
  local newline="  - ${key}::: $(one_line "$value")"
  ln="$(sed -n "${start},${end}p" "$file" | grep -n "^  - ${key}::: " | tail -1 | cut -d: -f1 || true)"
  if [[ -n "$ln" ]]; then
    replace_line "$file" "$((start + ln - 1))" "$newline"
  else
    kln="$(sed -n "${start},${end}p" "$file" | grep -n -E '^  - [a-z-]+::: ' | tail -1 | cut -d: -f1 || true)"
    anchor="$start"
    [[ -z "$kln" ]] || anchor=$((start + kln - 1))
    insert_after "$file" "$anchor" "$newline"
  fi
}

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
cmd_new() {
  local project="" name="" description="" folder="" file ts
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -n|--name) name="$2"; shift 2 ;;
      -d|--description) description="$2"; shift 2 ;;
      --folder) folder="$2"; shift 2 ;;
      *) project="$1"; shift ;;
    esac
  done
  [[ -n "$project" ]] || die "usage: journal.sh new <project> -d \"<description>\" [--name <name>] [--folder <path>]"
  if [[ ! -f "$PAR_DIR/$project.md" ]]; then
    die "'$project' is not a PAR note (expected 01 - PAR/$project.md)"
  fi

  name="${name:-Journal - $project}"
  folder="${folder:-$PROJECTS_DIR/$project}"
  [[ -n "$description" ]] || die "a journal needs a description (-d \"...\")"
  file="$folder/$name.md"
  if [[ -e "$file" ]]; then
    die "already exists: $file"
  fi

  description="$(one_line "$description")"
  description="${description//\"/\'}"
  mkdir -p "$folder"
  ts="$(date '+%Y-%m-%d %H:%M')"

  {
    cat <<EOF
---
file_class: journal
paras:
  - "[[$project]]"
type: "[[Journals]]"
subtypes:
  - "[[Logging - Journals - project-log|project-log]]"
rate:
tags:
status: wip
maturity: capture
description: "$description"
created: $ts
---
# [[$name]]

$description

> [!important] Editing rules
> Edited only through \`.obsidian/personal_scripts/journal.sh\` (run inside the
> vault). Log entries are append-only; attach a link to an entry already
> logged with \`journal.sh link\`. Hand edits are safe only under
> [[#How it went]] - never touch the Log by hand: it is what converts to
> Excel.

## Log

%% one bullet per event: - YYYY-MM-DD HH:mm: description (wikilinks inline in the description, never as their own key) %%
%% keys as nested bullets: - kind::: done|meeting|milestone|note|product, - dur::: minutes, - good:::, - bad:::, - comment::: %%
%% extra lines in any format may follow the keys (keep the indent) %%

## Tech debt

%% debt discovered while working (journal.sh debt); at close it becomes its own note %%

## Intermediate products

%% products worth extracting (journal.sh product); reviewed at close %%

## How it went

%% human lines on how the project went - written by the human (journal.sh reflect), at close at least %%
EOF
  } > "$file"

  info "Created: ${file#"$ROOT_DIR"/}"
  info "Log the first thing: journal.sh log --kind note --what \"...\""
}

cmd_log() {
  local kind="" what="" dur="" link="" good="" bad="" comment=""
  local date="" time="" pos="" project="" file n ts desc entry
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -k|--kind) kind="$2"; shift 2 ;;
      -w|--what) what="$2"; shift 2 ;;
      --dur) dur="$2"; shift 2 ;;
      -l|--link) link="$2"; shift 2 ;;
      --good) good="$2"; shift 2 ;;
      --bad) bad="$2"; shift 2 ;;
      -c|--comment) comment="$2"; shift 2 ;;
      --date) date="$2"; shift 2 ;;
      --time) time="$2"; shift 2 ;;
      -p|--project) project="$2"; shift 2 ;;
      *) pos="${pos:+$pos }$1"; shift ;;
    esac
  done

  file="$(resolve_journal "$(trim "$pos")" "$project")"
  require_open "$file"

  [[ -n "$what" ]] || die "--what \"<what was done>\" is required"
  case "$kind" in
    "") die "--kind is required: done | meeting | milestone | note | product" ;;
    done|meeting|milestone|note|product) : ;;
    *) die "unknown kind '$kind' - use one of: done meeting milestone note product" ;;
  esac
  if [[ -n "$dur" ]]; then
    [[ "$dur" =~ ^[0-9]+$ ]] || die "--dur must be minutes as a plain number (e.g. 45)"
  fi
  if [[ -n "$link" ]]; then
    valid_wikilink "$link" || die "--link must be a wikilink: [[Note]] or [[Note|alias]]"
  fi
  if [[ -n "$date" ]]; then
    valid_date "$date" || die "--date must be YYYY-MM-DD"
  fi
  if [[ -n "$time" ]]; then
    valid_time "$time" || die "--time must be HH:mm"
  fi

  date="${date:-$(date +%F)}"
  time="${time:-$(date +%H:%M)}"
  ts="$date $time"
  desc="$(one_line "$what")${link:+ $link}"
  entry="- $ts: $desc"
  section_append "$file" "Log" "$entry"
  n=$(entry_count "$file")

  set_entry_key "$file" "$n" "kind" "$kind"
  if [[ -n "$dur" ]]; then
    set_entry_key "$file" "$n" "dur" "$dur"
  fi
  if [[ -n "$good" ]]; then
    set_entry_key "$file" "$n" "good" "$good"
  fi
  if [[ -n "$bad" ]]; then
    set_entry_key "$file" "$n" "bad" "$bad"
  fi
  if [[ -n "$comment" ]]; then
    set_entry_key "$file" "$n" "comment" "$comment"
  fi
  info "entry $n -> ${file#"$ROOT_DIR"/}"
}

cmd_link() {
  local project="" row="last" link=""
  local -a rest=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      --row) row="$2"; shift 2 ;;
      *) rest+=("$1"); shift ;;
    esac
  done
  [[ ${#rest[@]} -ge 1 ]] || die "usage: journal.sh link [file] <n|last> \"[[Note]]\""
  if [[ ${#rest[@]} -ge 2 ]]; then
    row="${rest[0]}"
    link="${rest[1]}"
  else
    link="${rest[0]}"
  fi
  local file n range start line
  file="$(resolve_journal "" "$project")"
  require_open "$file"
  valid_wikilink "$link" || die "link must be a wikilink: [[Note]] or [[Note|alias]]"
  n="$(_entry_target "$file" "$row")"
  range="$(entry_nth_range "$file" "$n")"
  start="${range%%:*}"
  line="$(sed -n "${start}p" "$file")"
  if [[ "$line" == *"$link"* ]]; then
    warn "entry $n already carries that link"
    return
  fi
  replace_line "$file" "$start" "$line $link"
  info "entry $n description now carries $link"
}

# good/bad/comment: create or update the key bullet inside an entry.
_common_cell_cmd() { # <key> <args...>
  local key="$1"; shift
  local project="" row="last" text=""
  local -a rest=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      --row) row="$2"; shift 2 ;;
      *) rest+=("$1"); shift ;;
    esac
  done
  [[ ${#rest[@]} -ge 1 ]] || die "missing text"
  if [[ ${#rest[@]} -ge 2 ]]; then
    row="${rest[0]}"
    text="${rest[1]}"
  else
    text="${rest[0]}"
  fi
  local file n
  file="$(resolve_journal "" "$project")"
  require_open "$file"
  n="$(_entry_target "$file" "$row")"
  set_entry_key "$file" "$n" "$key" "$text"
  info "entry $n $key::: set"
}

cmd_good() { _common_cell_cmd "good" "$@"; }
cmd_bad() { _common_cell_cmd "bad" "$@"; }
cmd_comment() { _common_cell_cmd "comment" "$@"; }

# append: free lines in any format inside an existing entry.
cmd_append() {
  local project="" row="last" text=""
  local -a rest=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      --row) row="$2"; shift 2 ;;
      *) rest+=("$1"); shift ;;
    esac
  done
  [[ ${#rest[@]} -ge 1 ]] || die "usage: journal.sh append [file] <n|last> \"<any line(s)>\""
  if [[ ${#rest[@]} -ge 2 ]]; then
    row="${rest[0]}"
    text="${rest[1]}"
  else
    text="${rest[0]}"
  fi
  local file n range end line
  file="$(resolve_journal "" "$project")"
  require_open "$file"
  n="$(_entry_target "$file" "$row")"
  range="$(entry_nth_range "$file" "$n")"
  end="${range##*:}"
  # keep the given format verbatim, but indent so it stays inside the entry
  local -a lines=()
  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]] ]]; then
      lines+=("$line")
    else
      lines+=("  $line")
    fi
  done <<< "$(printf '%s' "$text" | tr -d '\r')"
  insert_after "$file" "$end" "$(printf '%s\n' "${lines[@]}")"
  info "appended free lines to entry $n"
}

_section_append_cmd() { # <heading> <args...>
  local heading="$1"; shift
  local project="" link="" text=""
  local -a rest=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      -l|--link) link="$2"; shift 2 ;;
      *) rest+=("$1"); shift ;;
    esac
  done
  [[ ${#rest[@]} -ge 1 ]] || die "missing text"
  text="${rest[0]}"
  if [[ -n "$link" ]]; then
    valid_wikilink "$link" || die "--link must be a wikilink"
  fi
  local file
  file="$(resolve_journal "" "$project")"
  require_open "$file"
  section_append "$file" "$heading" "- $(one_line "$text")${link:+ $link}"
  info "${heading} item added"
}

cmd_debt() { _section_append_cmd "Tech debt" "$@"; }
cmd_product() { _section_append_cmd "Intermediate products" "$@"; }

cmd_reflect() {
  local project="" text=""
  local -a rest=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      *) rest+=("$1"); shift ;;
    esac
  done
  [[ ${#rest[@]} -ge 1 ]] || die "usage: journal.sh reflect [file] \"<your line>\""
  text="${rest[0]}"
  local file
  file="$(resolve_journal "" "$project")"
  section_append "$file" "How it went" "- $(one_line "$text")"
  info "reflection line added"
}

cmd_close() {
  local pos="" project="" file stem folder ts project_name debt_note
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      *) pos="${pos:+$pos }$1"; shift ;;
    esac
  done
  file="$(resolve_journal "$(trim "$pos")" "$project")"
  require_open "$file"
  stem="$(basename "$file" .md)"
  folder="$(dirname "$file")"
  project_name="$(journal_project "$file")"
  debt_note="$folder/Tech Debt - ${project_name:-$stem}.md"

  # 1) Tech debt note: create it, or append to the standing project one.
  local debt_items
  debt_items="$(section_items "Tech debt" "$file")"
  if [[ -n "$debt_items" ]]; then
    ts="$(date '+%Y-%m-%d %H:%M')"
    if [[ -f "$debt_note" ]]; then
      section_append "$debt_note" "Items" "> [!info] From [[$stem]] on $(date +%F)."
      while IFS= read -r item; do
        [[ -z "$item" ]] && continue
        if grep -qF -- "- $item" "$debt_note"; then
          warn "already in the tech debt note, skipped: $item"
          continue
        fi
        section_append "$debt_note" "Items" "- $item"
      done <<< "$debt_items"
      info "tech debt appended: ${debt_note#"$ROOT_DIR"/}"
    else
      {
        cat <<EOF
---
file_class: note
paras:
  - "[[$project_name]]"
type: "[[Project Contexts]]"
subtypes:
  - "[[Descriptive - Project Contexts - technical-debt|technical-debt]]"
rate:
tags:
status: inbox
maturity: capture
created: $ts
---
# [[Tech Debt - $project_name]]

Tech debt extracted from [[$stem]] on close. Items accumulate here.

> [!tip] Next step
> Turn each item into an issue (\`create-issue.sh --subtype improvement --role debt\`) or consciously drop it.

## Items

EOF
        while IFS= read -r item; do
          [[ -z "$item" ]] && continue
          printf -- '- %s\n' "$item"
        done <<< "$debt_items"
      } > "$debt_note"
      info "tech debt note created: ${debt_note#"$ROOT_DIR"/}"
    fi
    section_append "$file" "Tech debt" "> [!tip] Closed on $(date +%F) - debt now lives in [[Tech Debt - ${project_name:-$stem}]]."
  else
    info "no tech debt items recorded - no tech debt note created"
  fi

  # 2) Intermediate products extraction checklist.
  local products
  products="$(section_items "Intermediate products" "$file")"
  if [[ -n "$products" ]]; then
    info "intermediate products to extract (their own note if worth keeping):"
    while IFS= read -r p; do
      info "  - $p"
    done <<< "$products"
  else
    info "no intermediate products recorded"
  fi

  # 3) Human lines on how the project went (never written by the machine).
  if ! section_items "How it went" "$file" | grep -q .; then
    if [[ -t 0 ]]; then
      info "How did the project go? Write your lines (one per line, empty line to finish):"
      local line
      while IFS= read -r line; do
        if [[ -z "$line" ]]; then break; fi
        section_append "$file" "How it went" "- $line"
      done
    else
      warn "how it went is empty - the human adds their lines: journal.sh reflect \"...\""
    fi
  fi

  # 4) Close.
  fm_set_status "$file" "done"
  info "closed: ${file#"$ROOT_DIR"/}"
  info "export the log for Excel with: journal.sh export --out \"${stem}.csv\""
}

cmd_reopen() {
  local pos="" project="" file
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      *) pos="${pos:+$pos }$1"; shift ;;
    esac
  done
  file="$(resolve_journal "$(trim "$pos")" "$project")"
  fm_set_status "$file" "wip"
  info "reopened: ${file#"$ROOT_DIR"/}"
}

cmd_show() {
  local pos="" project="" file
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      *) pos="${pos:+$pos }$1"; shift ;;
    esac
  done
  file="$(resolve_journal "$(trim "$pos")" "$project")"
  info "${file#"$ROOT_DIR"/}"
  info "status     : $(fm_get "$file" status)"
  info "created    : $(fm_get "$file" created)"
  info "description: $(fm_get "$file" description)"
  info "entries    : $(entry_count "$file")"
  info ""
  awk '
    /^## Log$/ { inlog = 1; print; next }
    inlog && /^## / { exit }
    inlog { print }
  ' "$file"
}

cmd_find() {
  local any=0 f
  while IFS= read -r f; do
    is_journal_file "$f" || continue
    any=1
    printf '%s · status %s\n' "${f#"$ROOT_DIR"/}" "$(fm_get "$f" status)"
  done < <(all_journal_files)
  if [[ "$any" -eq 0 ]]; then
    info "no journals yet - create one: journal.sh new <project> -d \"...\""
  fi
}

cmd_export() {
  local pos="" project="" out="" file csv
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -p|--project) project="$2"; shift 2 ;;
      -o|--out) out="$2"; shift 2 ;;
      *) pos="${pos:+$pos }$1"; shift ;;
    esac
  done
  file="$(resolve_journal "$(trim "$pos")" "$project")"
  csv="$(awk '
    function flush() {
      if (n) {
        printf "%s,%s,%s,%s,%s,%s,%s,%s,%s\n", n, d, t, kind, q(what), dur, q(good), q(bad), q(comment)
      }
    }
    function q(s) {
      gsub(/"/, "\"\"", s)
      return "\"" s "\""
    }
    function empty() { kind = ""; good = ""; bad = ""; comment = ""; dur = ""; }
    /^## Log$/ { inlog = 1; print "n,date,time,kind,what,dur,good,bad,comment"; next }
    !inlog { next }
    /^## / { exit }
    /^- [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]: / {
      flush()
      n++
      s = $0
      sub(/^- /, "", s)
      i = index(s, ": ")
      stamp = substr(s, 1, i - 1)
      what = substr(s, i + 2)
      split(stamp, st, " ")
      d = st[1]; t = st[2]
      empty()
    }
    /^  - [a-z-]+::: / {
      if (!n) next
      s = $0
      sub(/^  - /, "", s)
      i = index(s, "::: ")
      k = substr(s, 1, i - 1)
      v = substr(s, i + 4)
      if (k == "kind") kind = v
      else if (k == "dur") dur = v
      else if (k == "good") good = v
      else if (k == "bad") bad = v
      else if (k == "comment") comment = v
    }
    END { flush() }
  ' "$file")"
  if [[ -n "$out" ]]; then
    printf '%s\n' "$csv" > "$out"
    info "exported: $out"
  else
    printf '%s\n' "$csv"
  fi
}

usage() {
  cat <<'EOF'
journal.sh - project journal CLI (performance tracking + logbook)

Journals are markdown but ONLY edited through this script: the Log must stay
machine-parseable (it exports to Excel/CSV). Entries are bullets, never
tables:

  - 2026-10-13 14:30: Description with [[links]] inline
    - kind::: done
    - dur::: 45
    - good::: ... - bad::: ... - comment::: ...
    (extra lines in any format)

One journal per project is the default, never a hard constraint (--name for
extra workstream journals). Most commands take the journal file as first
optional argument (path or note name), or --project <par>; with exactly one
open journal in the vault they need no argument.

Commands
  new <project> -d "<description>" [--name <n>] [--folder <path>]
                          Open a journal for a project (PAR note required).
  log [file] --kind <k> --what "<text>" [--dur <min>] [--link "[[...]]"]
            [--good "<t>"] [--bad "<t>"] [--comment "<t>"]
            [--date YYYY-MM-DD] [--time HH:mm]
                          Append an entry; the link (if any) goes into the
                          description. kinds: done | meeting | milestone |
                          note | product. dur = minutes.
  link [file] <n|last> "[[Note]]" [--row <n>]
                          Attach a link to an already logged entry (it is
                          appended to its description).
  good [file] "<text>" [--row <n|last>]
  bad  [file] "<text>" [--row <n|last>]
  comment [file] "<text>" [--row <n|last>]
                          Create/update the key bullet of an entry.
  append [file] <n|last> "<any lines>"
                          Extra free lines inside an entry (any format).
  debt [file] "<item>" [--link "[[...]]"]
                          Record discovered tech debt (own section; a tech
                          debt note is produced on close).
  product [file] "<text>" [--link "[[...]]"]
                          Record an intermediate product (reviewed on close).
  reflect [file] "<line>"
                          Add a human-authored line under "How it went".
  close [file]            Close the journal: creates/appends the tech debt
                          note, lists intermediate products to extract, asks
                          for the human lines, sets status done.
  reopen [file]           Reopen a closed journal (status back to wip).
  show [file]             Print status summary + the Log.
  find                    List every journal with its status.
  export [file] [--out <csv>]
                          Log as CSV (Excel-ready; default stdout).

Env overrides: JOURNAL_ROOT (alternate vault root, for tests)
EOF
}

main() {
  [[ $# -ge 1 ]] || { usage; exit 0; }
  local cmd="$1"; shift
  case "$cmd" in
    help|-h|--help) usage ;;
    new) cmd_new "$@" ;;
    log) cmd_log "$@" ;;
    link) cmd_link "$@" ;;
    good) cmd_good "$@" ;;
    bad) cmd_bad "$@" ;;
    comment) cmd_comment "$@" ;;
    append) cmd_append "$@" ;;
    debt) cmd_debt "$@" ;;
    product) cmd_product "$@" ;;
    reflect) cmd_reflect "$@" ;;
    close) cmd_close "$@" ;;
    reopen) cmd_reopen "$@" ;;
    show) cmd_show "$@" ;;
    find) cmd_find "$@" ;;
    export) cmd_export "$@" ;;
    *) die "unknown command '$cmd' (run journal.sh help)" ;;
  esac
}

main "$@"
