#!/usr/bin/env bash
# sync-skills.sh — distribute the second-brain agent assets from the vault.
#
# Canonical sources (the only real copies, live inside the vault so Obsidian
# sees them and git distributes them):
#
#   "99 - Meta/skills/<name>/SKILL.md"   agent skills
#   "99 - Meta/commands/<name>.md"       slash commands
#   "99 - Meta/agents/<name>.md"         subagents
#
# Every harness reads them through committed dir-level symlinks, one per agent:
#
#   .opencode/skills    -> ../99 - Meta/skills
#   .claude/skills      -> ../99 - Meta/skills
#   .opencode/commands  -> ../99 - Meta/commands
#   .claude/commands    -> ../99 - Meta/commands
#   .opencode/agents    -> ../99 - Meta/agents
#   .claude/agents      -> ../99 - Meta/agents
#
# This script idempotently repairs those views, migrates legacy layouts
# (real dirs with copies) into the canonical folders, and cleans the junk
# sync tools and Finder tend to leave behind (dangling links, .DS_Store).
# Global installs (~/.agents/skills) are intentionally out of scope for now;
# a per-skill audience marker (project|global) is the planned extension.
#
# Usage:
#   scripts/sync-skills.sh sync   [--codex] [--apply] [--root DIR]
#   scripts/sync-skills.sh clean  [--apply] [--root DIR]
#   scripts/sync-skills.sh status [--root DIR]   (exit 1 if any view is off)
#
# Sync rules:
#   - missing or wrong-target symlinks: fixed immediately (idempotent).
#   - a view that is still a REAL dir: legacy layout. Migration into the
#     canonical folder only with --apply; without it, sync reports and
#     exits 1 instead of touching anything.
#   - the canonical folders must be real dirs (never symlinks): sync refuses
#     to run otherwise, so the source of truth can never loop into itself.
#   - --codex also manages `.agents/skills` (Codex, Cursor and the other
#     AGENTS-standard agents). OpenCode reads that path too but dedupes
#     identical names, so skills stay single-listed.
#
# Clean rules (dry-run by default, --apply to act):
#   - removes .DS_Store / ._ resource forks inside the canonical folders
#   - removes dangling symlinks; flags symlinks pointing outside the vault
#   - NEVER deletes real folders/files; skill dirs without a SKILL.md are
#     reported for a human decision (exit 1).
#
# After any change, git tracks it: review `git status` for the views and
# commit them — the views themselves are the distribution, not this script.

set -euo pipefail

SELF="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SELF/.." && pwd)"
APPLY=0
CODEX=0
DRY="yes"

say() { printf '%s\n' "$*"; }
warn() { printf '  ! %s\n' "$*" >&2; }
ok() { printf '  . %s\n' "$*"; }

usage() {
	cat <<'USAGE'
Usage:
  scripts/sync-skills.sh sync   [--codex] [--apply] [--root DIR]
  scripts/sync-skills.sh clean  [--apply] [--root DIR]
  scripts/sync-skills.sh status [--root DIR]   (exit 1 if any view is off)

  sync    repair/create the harness symlinks (see header for the map);
          migrate legacy real-dir views into 99 - Meta only with --apply
  clean   remove .DS_Store/._* and dangling symlinks in the canonical
          folders; dry-run unless --apply
  status  report every view (ok/missing/wrong/dangling/real_dir/real_file)
USAGE
}

[ -n "${1:-}" ] || { usage >&2; exit 2; }
CMD="$1"; shift

while [ $# -gt 0 ]; do
	case "$1" in
	--apply) APPLY=1; DRY="no"; shift ;;
	--codex) CODEX=1; shift ;;
	--root) ROOT="$(cd "$2" && pwd)"; shift 2 ;;
	-h|--help) usage; exit 0 ;;
	*) warn "unknown option: $1"; usage >&2; exit 2 ;;
	esac
done

SKILLS_SRC="$ROOT/99 - Meta/skills"
COMMANDS_SRC="$ROOT/99 - Meta/commands"
AGENTS_SRC="$ROOT/99 - Meta/agents"

is_symlink() { [ -L "$1" ]; }
is_real_dir() { [ -d "$1" ] && [ ! -L "$1" ]; }
link_target() { readlink "$1" 2>/dev/null || true; }

# state <path> <expected_target> -> ok|missing|wrong|dangling|real_dir|real_file|other
view_state() {
	local p="$1" exp="$2" got
	got="$(link_target "$p")"
	if [ "$got" = "$exp" ]; then
		echo "ok"
	elif is_symlink "$p"; then
		if [ -e "$p" ]; then echo "wrong"; else echo "dangling"; fi
	elif [ -d "$p" ]; then echo "real_dir"
	elif [ -e "$p" ]; then echo "real_file"
	else echo "missing"
	fi
}

# one record per view: kind|view_relpath|relative_target
each_view() {
	printf 'skills|.opencode/skills|../99 - Meta/skills\n'
	printf 'skills|.claude/skills|../99 - Meta/skills\n'
	printf 'commands|.opencode/commands|../99 - Meta/commands\n'
	printf 'commands|.claude/commands|../99 - Meta/commands\n'
	printf 'agents|.opencode/agents|../99 - Meta/agents\n'
	printf 'agents|.claude/agents|../99 - Meta/agents\n'
	[ "$CODEX" = "1" ] && printf 'skills|.agents/skills|../99 - Meta/skills\n'
	return 0
}

src_of_kind() {
	case "$1" in
	skills) echo "$SKILLS_SRC" ;;
	commands) echo "$COMMANDS_SRC" ;;
	agents) echo "$AGENTS_SRC" ;;
	esac
}

check_canonical_real() {
	local d="$1" label="$2"
	if is_symlink "$d" || { [ -e "$d" ] && [ ! -d "$d" ]; }; then
		warn "canonical $label is not a real directory: $d — refusing to sync"
		return 1
	fi
	mkdir -p "$d"
}

repair_view() {
	local rel="$1" target="$2" view state
	view="$ROOT/$rel"
	state="$(view_state "$view" "$target")"
	case "$state" in
	ok)
		ok "$rel -> $target (unchanged)"
		;;
	missing|dangling|wrong)
		mkdir -p "$(dirname "$view")"
		is_symlink "$view" && rm "$view"
		ln -s "$target" "$view"
		ok "$rel -> $target ($state: repaired)"
		;;
	real_dir)
		warn "$rel is a real directory (legacy layout) — entries migration needs --apply:"
		ls -A "$view" | sort -u | sed 's/^/  !       /' >&2
		MIGRATIONS="$MIGRATIONS $rel"
		;;
	*)
		warn "$rel exists but is neither symlink nor dir — fix manually"
		HUMAN=1
		;;
	esac
}

migrate_view() {
	local rel="$1" target="$2" view src kind entry trashdir name
	view="$ROOT/$rel"
	if [ "$APPLY" != "1" ]; then
		warn "no --apply: $rel left untouched"
		return
	fi
	case "$rel" in *skills) kind=skills ;; *agents) kind=agents ;; *) kind=commands ;; esac
	src="$(src_of_kind "$kind")"
	say "migrating $rel into ${src#$ROOT/}/:"
	mkdir -p "$src"
	trashdir="$ROOT/.trash/sync-skills-$(date +%Y%m%d-%H%M%S)"
	for entry in "$view"/* "$view"/.[!.]*; do
		[ -e "$entry" ] || continue
		name="$(basename "$entry")"
		if [ -e "$src/$name" ]; then
			mkdir -p "$trashdir"
			mv "$entry" "$trashdir/$name"
			warn "$name already in canonical — legacy copy moved to ${trashdir#$ROOT/}/"
		else
			mv "$entry" "$src/$name"
			ok "$name -> canonical"
		fi
	done
	rm -rf "$view"
	ln -s "$target" "$view"
	ok "$rel -> now a symlink to $target (git: review + commit)"
}

cmd_sync() {
	HUMAN=0
	MIGRATIONS=""
	say "sync: vault $ROOT"
	check_canonical_real "$SKILLS_SRC" "skills" || exit 2
	check_canonical_real "$COMMANDS_SRC" "commands" || exit 2
	check_canonical_real "$AGENTS_SRC" "agents" || exit 2

	say "views:"
	while IFS='|' read -r kind rel target; do
		repair_view "$rel" "$target"
	done < <(each_view)

	for rel in $MIGRATIONS; do
		# relative target must match the view map so links stay repo-portable
		case "$rel" in
		.opencode/skills|.claude/skills|.agents/skills) target="../99 - Meta/skills" ;;
		.opencode/agents|.claude/agents) target="../99 - Meta/agents" ;;
		*) target="../99 - Meta/commands" ;;
		esac
		migrate_view "$rel" "$target"
	done

	[ -n "$MIGRATIONS" ] && [ "$APPLY" != "1" ] && {
		say "legacy real-dir views found — rerun with --apply to migrate (exit 1)"
		exit 1
	}
	if [ "$HUMAN" = "1" ]; then
		say "sync incomplete — see ! lines above (exit 1)"
		exit 1
	fi
	say "sync done. hints:"
	say "  check: npx skills add \"./99 - Meta/skills\" --list"
	say "  commit any view changes git reports after migration."
}

cmd_clean() {
	HUMAN=0
	say "clean: vault $ROOT (dry-run: $DRY — pass --apply to act)"
	for src in "$SKILLS_SRC" "$COMMANDS_SRC" "$AGENTS_SRC"; do
		[ -d "$src" ] || continue
		say "in ${src#$ROOT/}/:"
		while IFS= read -r -d '' f; do
			if [ "$APPLY" = "1" ]; then
				rm -f "$f"
				say "  removed ${f#$ROOT/}"
			else
				say "  would remove ${f#$ROOT/}"
			fi
		done < <(find "$src" \( -name '.DS_Store' -o -name '._*' \) -print0 2>/dev/null)
		while IFS= read -r -d '' f; do
			if [ ! -e "$f" ]; then
				if [ "$APPLY" = "1" ]; then
					rm -f "$f"
					say "  removed dangling ${f#$ROOT/}"
				else
					say "  would remove dangling ${f#$ROOT/}"
				fi
			else
				targ="$(link_target "$f")"
				case "$targ" in
				/*|..*)
					warn "symlink outside the repo, review manually: ${f#$ROOT/} -> $targ"
					HUMAN=1
					;;
				esac
			fi
		done < <(find "$src" -type l -print0 2>/dev/null)
	done
	if [ -d "$SKILLS_SRC" ]; then
		while IFS= read -r -d '' d; do
			[ -f "$d/SKILL.md" ] || { warn "dir without SKILL.md, human decision: ${d#$ROOT/}"; HUMAN=1; }
		done < <(find "$SKILLS_SRC" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)
	fi
	if [ "$HUMAN" = "1" ]; then
		say "clean found items needing a human decision (exit 1)"
		exit 1
	fi
	say "clean done."
}

cmd_status() {
	local off=0 state
	say "status: vault $ROOT"
	printf '  canonical: %s skills, %s commands, %s agents\n' \
		"$(find "$SKILLS_SRC" -mindepth 1 -maxdepth 1 -type d -not -name '.*' 2>/dev/null | wc -l | tr -d ' ')" \
		"$(find "$COMMANDS_SRC" -mindepth 1 -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')" \
		"$(find "$AGENTS_SRC" -mindepth 1 -maxdepth 1 -type f -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
	while IFS='|' read -r _kind rel target; do
		state="$(view_state "$ROOT/$rel" "$target")"
		printf '  %-10s %-22s want: %s\n' "$state" "$rel" "$target"
		[ "$state" = "ok" ] || off=1
	done < <(each_view)
	[ "$off" = "0" ] && say "all views ok."
	[ "$off" = "1" ] && { warn "some views are off — run sync to repair"; exit 1; }
	return 0
}

case "$CMD" in
sync) cmd_sync ;;
clean) cmd_clean ;;
status) cmd_status ;;
help|-h) usage ;;
*) usage >&2; exit 2 ;;
esac
