#!/usr/bin/env bash
# create-issue.sh - Create a second-brain issue through the Templater pipeline.
#
# Wraps `obsidian templater:create-from-template` around
# 99 - Meta/Templates/02 - Issues - Template.md:
#   - answers the template prompt ("Task Name?") in the running Obsidian app
#   - waits for the note to be numbered, renamed and moved into 08 - Issues/
#   - optionally fills properties afterwards: --project, --subtype,
#     --priority, --depends
#
# Run: create-issue.sh --title "Fix the flux capacitor"
#      create-issue.sh --title "Refactor vault scripts" --project second-brain \
#        --subtype improvement --priority 1 --depends _I00005 --open

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

ISSUES_DIR="$ROOT_DIR/08 - Issues"
SUBTYPES_DIR="$ROOT_DIR/02 - Categories/_subtypes"
TEMPLATE="${ISSUE_TEMPLATE:-02 - Issues - Template.md}"
OBSIDIAN_BIN="${OBSIDIAN_BIN:-obsidian}"
WATCHER_TIMEOUT_MS=90000
SETTLE_ATTEMPTS=180 # x 0.5s = 90s

info() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
create-issue.sh - create a second-brain issue (Templater pipeline)

Drives the running Obsidian app: arms a watcher that answers the template's
"Task Name?" prompt, then waits for 02 - Issues - Template.md to number,
rename and move the note into 08 - Issues/.

Usage: create-issue.sh --title "Short description" [options]

Options
  -t, --title <text>      Issue title (asked interactively when omitted)
  -p, --project <name>    PAR note linked from paras: (e.g. second-brain)
  -s, --subtype <slug>    bug | task | improvement | incident | open-problem | recurring
      --priority <0-2>    0 (High), 1 (Medium), 2 (Low)
  -d, --depends <issue>   Issue this one depends on (repeatable); accepts a
                          number (_I00005) or the full note name
      --open              Open the created issue in Obsidian
  -h, --help              Show this help

Env overrides: ISSUE_TEMPLATE, OBSIDIAN_BIN
EOF
}

js_escape() { # escape a value for a single-quoted JS string literal
  printf '%s' "$1" | tr -d '\n' | sed -e 's/\\/\\\\/g' -e "s/'/\\\\'/g"
}

obsidian_cli() { (cd "$ROOT_DIR" && "$OBSIDIAN_BIN" "$@"); }

main() {
  local title="" project="" subtype="" priority="" open_flag=0
  local -a depends=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -t|--title)
        [[ -n "${2:-}" ]] || die "--title needs a value"
        title="$2"; shift 2 ;;
      -p|--project)
        [[ -n "${2:-}" ]] || die "--project needs a value"
        project="$2"; shift 2 ;;
      -s|--subtype)
        [[ -n "${2:-}" ]] || die "--subtype needs a value"
        subtype="$2"; shift 2 ;;
      --priority)
        [[ -n "${2:-}" ]] || die "--priority needs a value"
        priority="$2"; shift 2 ;;
      -d|--depends)
        [[ -n "${2:-}" ]] || die "--depends needs a value"
        depends+=("$2"); shift 2 ;;
      --open) open_flag=1; shift ;;
      -h|--help) usage; exit 0 ;;
      *) die "unknown option: $1 (run create-issue.sh --help)" ;;
    esac
  done

  if ! command -v "$OBSIDIAN_BIN" >/dev/null 2>&1; then
    if [[ -x /Applications/Obsidian.app/Contents/MacOS/obsidian ]]; then
      OBSIDIAN_BIN=/Applications/Obsidian.app/Contents/MacOS/obsidian
    else
      die "obsidian CLI not found (Obsidian > Settings > General > Command line interface)"
    fi
  fi
  pgrep -x Obsidian >/dev/null 2>&1 || die "Obsidian is not running - open it and retry"
  [[ -d "$ISSUES_DIR" ]] || die "issues folder not found: $ISSUES_DIR"
  if [[ ! -f "$ROOT_DIR/$TEMPLATE" && ! -f "$ROOT_DIR/99 - Meta/Templates/$TEMPLATE" ]]; then
    die "template not found: $TEMPLATE"
  fi

  if [[ -z "$title" ]]; then
    printf 'Issue title: ' >&2
    IFS= read -r title || true
  fi
  title="$(printf '%s' "$title" | sed -E -e 's/^[[:space:]]+//' -e 's/[[:space:]]+$//')"
  title="$(printf '%s' "$title" | sed -E -e 's/^_I[0-9]{5}[[:space:]]+//' -e 's#[/:]#-#g')"
  [[ -n "$title" ]] || die "empty title"
  [[ ! -e "$ISSUES_DIR/$title.md" ]] || die "already exists: 08 - Issues/$title.md"

  if [[ -n "$priority" ]]; then
    [[ "$priority" =~ ^[0-2]$ ]] || die "--priority must be 0, 1 or 2"
  fi

  local subtype_link=""
  if [[ -n "$subtype" ]]; then
    local sub_file
    sub_file="$(find "$SUBTYPES_DIR" -maxdepth 1 -name "*- Issues - $subtype.md" -print -quit 2>/dev/null)"
    [[ -n "$sub_file" ]] || die "unknown issue subtype: $subtype (see 02 - Categories/_subtypes)"
    subtype_link="[[$(basename "$sub_file" .md)|$subtype]]"
  fi

  local -a dep_links=()
  if [[ ${#depends[@]} -gt 0 ]]; then
    local dep dep_count dep_file
    for dep in "${depends[@]}"; do
      dep="${dep%.md}"
      dep_count="$(find "$ISSUES_DIR" -maxdepth 1 -name "$dep*.md" -print 2>/dev/null | wc -l | tr -d ' ')"
      [[ "$dep_count" != "0" ]] || die "--depends: no issue matches '$dep'"
      [[ "$dep_count" == "1" ]] || die "--depends: '$dep' is ambiguous ($dep_count matches)"
      dep_file="$(find "$ISSUES_DIR" -maxdepth 1 -name "$dep*.md" -print -quit 2>/dev/null)"
      dep_links+=("[[$(basename "$dep_file" .md)]]")
    done
  fi

  local js_title watcher
  js_title="$(js_escape "$title")"
  watcher="$(
    cat <<JS
(function () {
  window.__ocIssueWatcher = 'polling';
  (async () => {
    const deadline = Date.now() + $WATCHER_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const input = document.querySelector('.modal-container input.templater-prompt-input');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, '$js_title');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 120));
        const btn = document.querySelector('.modal-container .templater-button-div button');
        if (!btn) { window.__ocIssueWatcher = 'no-submit-button'; return; }
        btn.click();
        window.__ocIssueWatcher = 'answered';
        return;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    window.__ocIssueWatcher = 'timeout';
  })();
  return 'watcher-started';
})()
JS
  )"

  info "Arming the prompt watcher ..."
  obsidian_cli eval code="$watcher" >/dev/null 2>&1 \
    || die "could not run 'obsidian eval' - check the CLI in Obsidian settings"

  local before after out
  before="$(find "$ISSUES_DIR" -maxdepth 1 -name '_I*.md' -print 2>/dev/null | LC_ALL=C sort)"

  info "Creating issue: $title"
  out="$(obsidian_cli templater:create-from-template template="$TEMPLATE" file="08 - Issues/$title.md" 2>&1)" || true
  case "$out" in
    *Error:*) die "$out" ;;
  esac

  local i new_file=""
  for ((i = 0; i < SETTLE_ATTEMPTS; i++)); do
    after="$(find "$ISSUES_DIR" -maxdepth 1 -name '_I*.md' -print 2>/dev/null | LC_ALL=C sort)"
    new_file="$(comm -13 <(printf '%s\n' "$before") <(printf '%s\n' "$after") | head -1)"
    if [[ -n "$new_file" && -s "$new_file" ]]; then break; fi
    sleep 0.5
  done

  if [[ -z "$new_file" || ! -s "$new_file" ]]; then
    local state
    state="$(obsidian_cli eval code="window.__ocIssueWatcher || 'unknown'" 2>/dev/null || true)"
    state="${state#=> }"
    state="${state//\'/}"
    case "$state" in
      answered) die "prompt answered, but no issue settled in 08 - Issues/ within 90s - check Obsidian" ;;
      no-submit-button) die "found the prompt but not its submit button - answer it manually in Obsidian" ;;
      *) die "prompt not answered (watcher: ${state:-unknown}) - answer it manually in Obsidian" ;;
    esac
  fi

  local rel="${new_file#"$ROOT_DIR"/}"

  if [[ -n "$project" || -n "$subtype_link" || -n "$priority" || ${#dep_links[@]} -gt 0 ]]; then
    local assign="" list="" d
    if [[ -n "$project" ]]; then
      assign+="fm.paras = ['[[$(js_escape "$project")]]'];"
    fi
    if [[ -n "$subtype_link" ]]; then
      assign+="fm.subtypes = ['$(js_escape "$subtype_link")'];"
    fi
    if [[ -n "$priority" ]]; then
      assign+="fm.priority = $priority;"
    fi
    if [[ ${#dep_links[@]} -gt 0 ]]; then
      for d in "${dep_links[@]}"; do
        if [[ -n "$list" ]]; then list+=","; fi
        list+="'$(js_escape "$d")'"
      done
      assign+="fm.dependencies = [$list];"
    fi
    local patch_js
    patch_js="(async () => { const f = app.vault.getAbstractFileByPath('$(js_escape "$rel")'); if (!f) return 'file-not-found'; await app.fileManager.processFrontMatter(f, (fm) => { $assign }); return 'patched'; })()"
    obsidian_cli eval code="$patch_js" >/dev/null 2>&1 || true
    sleep 1.2
  fi

  info ""
  info "Created: $rel"
  if [[ -n "$project" ]]; then info "  project    : $project"; fi
  if [[ -n "$subtype" ]]; then info "  subtype    : $subtype"; fi
  if [[ -n "$priority" ]]; then info "  priority   : $priority"; fi
  if [[ ${#dep_links[@]} -gt 0 ]]; then info "  depends on : ${dep_links[*]}"; fi

  if [[ "$open_flag" -eq 1 ]]; then
    obsidian_cli open path="$rel" >/dev/null 2>&1 || true
  fi
  obsidian_cli eval code="delete window.__ocIssueWatcher; 'ok'" >/dev/null 2>&1 || true
}

main "$@"
