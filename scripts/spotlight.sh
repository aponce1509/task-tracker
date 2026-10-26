#!/usr/bin/env bash
# spotlight.sh — read-only board of the spotlight rows of The Maintenance System.
#
# Spec: 11 - Projects/second-brain/_0_final/The Maintenance System.md
#       (table "Under the spotlight": row, signal, workflow that clears it)
#
# One awk pass reads the frontmatter of every note; the kind audits, the
# engine audit (--quick), taxonomy verify and sync-skills status run in
# parallel. No LLM, no Obsidian app needed, never writes.
#
# Rows: Inbox, Capture devices, Raw captures, References, Orphans, Thin
# indexes, Syllabi, Unrecalled, Todo flags, Rfm flags, Issues, PARs,
# Journals, Legacy and engines, Links (only with --links), AI guidance.
#
# Light: ok = nothing to do · !  = look this week · !! = past the limit ·
#        -  = information only (captures are fine by design)
#
# Usage: spotlight.sh [par] [--links] [--tsv] [--root DIR]
#   par      scope Raw captures to one PAR (default: every active PAR)
#   --links  also count unresolved links (needs the obsidian CLI and app)
#   --tsv    print the raw rows (name, detail, light, workflows), for the dashboard
# Exit 0 always: the board reports, the workflows decide.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAR=""
LINKS=0
while [ $# -gt 0 ]; do
	case "$1" in
	--root) ROOT="$2"; shift 2 ;;
	--tsv) TSV=1; shift ;;
	--links) LINKS=1; shift ;;
	-h|--help) sed -n '2,23p' "$0"; exit 0 ;;
	-*) echo "unknown argument: $1" >&2; exit 2 ;;
	*) PAR="$1"; shift ;;
	esac
done

cd "$ROOT" || exit 2
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

SKILLS="99 - Meta/skills"

# Signals that are scripts: run them side by side.
bash "$SKILLS/note-concept/scripts/audit.sh" --quiet >"$TMP/concept" 2>&1 &
bash "$SKILLS/note-index-moc/scripts/audit.sh" --quiet >"$TMP/index" 2>&1 &
bash "$SKILLS/note-syllabus/scripts/audit.sh" --quiet >"$TMP/syllabus" 2>&1 &
python3 "$SKILLS/system-reference-maintance/scripts/audit.py" --quick >"$TMP/engine" 2>&1 &
{ bash .obsidian/personal_scripts/taxonomy.sh verify >/dev/null 2>&1; echo $? >"$TMP/taxonomy"; } &
{ bash scripts/sync-skills.sh status >/dev/null 2>&1; echo $? >"$TMP/sync"; } &
if [ "$LINKS" = 1 ]; then
	{ obsidian unresolved total 2>/dev/null | tail -1 >"$TMP/links"; } &
fi

# The notes: everything but trash, config, templates and generated categories.
find . -name '*.md' \
	-not -path './.*' -not -path './99 - Meta/Templates/*' \
	-not -path './02 - Categories/*' -not -path './node_modules/*' \
	-not -path './copilot/*' -print >"$TMP/notes"
find . -name '*.md' -not -path './.*' -mtime -7 -print >"$TMP/recent7"
find . -name '*.md' -not -path './.*' -mtime -14 -print >"$TMP/recent14"

# One record per note: path, status, maturity, created, active, paraType,
# file_class, paras (joined by |), dependencies (joined by |).
tr '\n' '\0' <"$TMP/notes" | xargs -0 awk '
	function flush() {
		if (f != "") print f "\t" st "\t" mat "\t" cr "\t" act "\t" pt "\t" fc "\t" paras "\t" deps
	}
	FNR == 1 { flush(); f = FILENAME; st = mat = cr = act = pt = fc = paras = deps = ""; infm = ($0 == "---"); list = ""; next }
	!infm { next }
	$0 == "---" { infm = 0; next }
	/^[A-Za-z_]+:/ {
		key = $0; sub(/:.*/, "", key); val = $0; sub(/^[^:]+: */, "", val); gsub(/"/, "", val)
		list = ""
		if (key == "status") st = val
		else if (key == "maturity") mat = val
		else if (key == "created") cr = substr(val, 1, 10)
		else if (key == "active") act = val
		else if (key == "paraType") pt = val
		else if (key == "file_class") { fc = val; list = "fc" }
		else if (key == "paras") { paras = val; list = "paras" }
		else if (key == "dependencies") { deps = val; list = "deps" }
		next
	}
	/^ *- / && list != "" {
		val = $0; sub(/^ *- */, "", val); gsub(/"/, "", val)
		if (list == "paras") paras = paras "|" val
		else if (list == "deps") deps = deps "|" val
		else if (list == "fc") fc = fc "|" val
	}
	END { flush() }
' >"$TMP/fm"

TODAY="$(date +%Y-%m-%d)"
D14="$(date -v-14d +%Y-%m-%d 2>/dev/null || date -d '14 days ago' +%Y-%m-%d)"

days_since() { # YYYY-MM-DD -> whole days until today
	local then now
	then=$(date -j -f %Y-%m-%d "$1" +%s 2>/dev/null || date -d "$1" +%s 2>/dev/null) || { echo "?"; return; }
	now=$(date -j -f %Y-%m-%d "$TODAY" +%s 2>/dev/null || date -d "$TODAY" +%s)
	echo $(((now - then) / 86400))
}

ROWS="$TMP/rows"
: >"$ROWS"
row() { printf '%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" >>"$ROWS"; }

# Inbox: status inbox outside the issues (issues have their own inbox state)
# and the news notes (a 30-day inbox that purges itself).
inbox_all=$(awk -F'\t' '$2 == "inbox" && $1 !~ /^\.\/(08 - Issues|06 - Inputs\/News)\//' "$TMP/fm" | wc -l | tr -d ' ')
inbox_old=$(awk -F'\t' -v d="$D14" '$2 == "inbox" && $1 !~ /^\.\/(08 - Issues|06 - Inputs\/News)\// && $4 != "" && $4 < d' "$TMP/fm" | wc -l | tr -d ' ')
oldest=$(awk -F'\t' '$2 == "inbox" && $1 !~ /^\.\/(08 - Issues|06 - Inputs\/News)\// && $4 ~ /^[0-9]{4}-/ { print $4 }' "$TMP/fm" | sort | head -1)
age="-"; [ -n "$oldest" ] && age="$(days_since "$oldest")d"
light="ok"; [ "$inbox_old" -gt 0 ] && light="!"; [ "$inbox_old" -gt 5 ] && light="!!"
row "Inbox" "$inbox_all notes, $inbox_old older than 14d, oldest $age" "$light" "/guide-inbox-clean · /sweep"

row "Capture devices" "phone importer only, manual look for the rest (_I00025)" "-" "/sweep"

# Raw captures: maturity capture per active PAR, or the PAR given.
if [ -n "$PAR" ]; then
	pars="$PAR"
else
	pars=$(awk -F'\t' '$1 ~ /^\.\/01 - PAR\/[^\/]+\.md$/ && $5 == "true" { n = $1; sub(/.*\//, "", n); sub(/\.md$/, "", n); print n }' "$TMP/fm" | sort)
fi
caps=""
while IFS= read -r p; do
	[ -z "$p" ] && continue
	n=$(awk -F'\t' -v p="[[$p" '$3 == "capture" && index($8, p "]]") || index($8, p "|")' "$TMP/fm" | wc -l | tr -d ' ')
	caps="$caps$p $n, "
done <<<"$pars"
row "Raw captures" "${caps%, }" "-" "/review-captures"

refs=$(awk -F'\t' '$1 ~ /^\.\/06 - Inputs\// && $1 !~ /^\.\/06 - Inputs\/News\// && $3 == "capture"' "$TMP/fm" | wc -l | tr -d ' ')
row "References" "$refs in 06 - Inputs at capture" "-" "/guide-inbox-clean · /guide-distillation"

# News sync: the time of the feeds_sync.py log is the last run (Mise-en-Place runs it every 2 h).
flog="${FEEDS_HOME:-$HOME/.config/feeds}/logs/sync.log"
if [ -f "$flog" ]; then
	hrs=$((($(date +%s) - $(stat -f %m "$flog" 2>/dev/null || stat -c %Y "$flog")) / 3600))
	last=$(grep '^== ' "$flog" | tail -1 | awk '{print $3}')
	light="ok"; { [ "$hrs" -ge 6 ] || [ "$last" = failed ]; } && light="!"; [ "$hrs" -ge 24 ] && light="!!"
	row "News sync" "last run ${hrs}h ago, $last" "$light" "<leader> F s · Feed and News Design"
else
	row "News sync" "never run" "!" "<leader> F s · Feed and News Design"
fi

wait

count() { # file check -> the count column of a kind audit line
	awk -v c="$2" '$1 == c { print $2; found = 1 } END { if (!found) print 0 }' "$1"
}
light_n() { # count [limit] -> ok, ! or !!
	if [ "$1" = 0 ]; then echo ok; elif [ "$1" -le "${2:-3}" ]; then echo "!"; else echo "!!"; fi
}

orph=$(count "$TMP/concept" orphan); unr=$(count "$TMP/index" unreachable); mu=$(count "$TMP/index" moc-unlinked)
row "Orphans" "concepts $orph, unreachable indexes $unr, unlinked MoCs $mu" "$(light_n $((orph + unr + mu)))" "/link-orphans · /new-concept"

nc=$(count "$TMP/index" no-concept); sg=$(count "$TMP/index" single)
row "Thin indexes" "no-concept $nc, single $sg" "$(light_n $((nc + sg)))" "/link-orphans"

sy=0; for c in stale multi-active no-active no-concepts; do sy=$((sy + $(count "$TMP/syllabus" "$c"))); done
row "Syllabi" "$sy findings (stale, multi-active, no-active, no-concepts)" "$(light_n "$sy" 1)" "note-syllabus · /new-syllabus"

rec=$(count "$TMP/concept" unrecalled)
row "Unrecalled" "$rec concepts no daily note links" "$(light_n "$rec" 5)" "/recall · /day end"

# Flags: a real tag, not a mention in backticks; guidance and diagrams excluded.
FLAG_SCOPE=(--glob '*.md' -g '!.*' -g '!99 - Meta/**' -g '!05 - Diagrams/**' -g '!11 - Projects/second-brain/_0_final/**' -g '!**/AGENTS.md')
todo=$(rg -c '(^|\s)#todo(\s|$)' "${FLAG_SCOPE[@]}" . 2>/dev/null | awk -F: '{ s += $NF } END { print s + 0 }')
row "Todo flags" "$todo #todo lines" "$(light_n "$todo" 5)" "/todo-sweep · /day end"

rfm_old=0
while IFS= read -r line; do
	file="./${line%:*}"; n="${line##*:}"
	grep -Fxq "$file" "$TMP/recent7" || rfm_old=$((rfm_old + n))
done < <(rg -c '(^|\s)#rfm(\s|$)' "${FLAG_SCOPE[@]}" . 2>/dev/null | sed 's|^\./||')
row "Rfm flags" "$rfm_old #rfm lines in notes untouched for 7d" "$(light_n "$rfm_old" 5)" "/weekly-review end"

# Issues: stale wip, done-rule breaks, blocked with every dependency done.
stale=0
while IFS= read -r f; do grep -Fxq "$f" "$TMP/recent7" || stale=$((stale + 1)); done < <(awk -F'\t' '$1 ~ /^\.\/08 - Issues\// && $2 == "wip" { print $1 }' "$TMP/fm")
broken=$(awk -F'\t' '$1 ~ /^\.\/08 - Issues\// && (($2 == "done") != ($1 ~ /\/complete\//))' "$TMP/fm" | wc -l | tr -d ' ')
ls "08 - Issues/complete" 2>/dev/null | sed 's/\.md$//' >"$TMP/complete"
unblock=$(awk -F'\t' 'NR == FNR { done[$0] = 1; next }
	$1 ~ /^\.\/08 - Issues\// && $2 == "blocked" {
		n = split($9, d, "|"); ok = 0; all = 1
		for (i = 1; i <= n; i++) { x = d[i]; if (x !~ /\[\[/) continue; sub(/.*\[\[/, "", x); sub(/[]|].*/, "", x); ok = 1; if (!(x in done)) all = 0 }
		if (ok && all) c++
	} END { print c + 0 }' "$TMP/complete" "$TMP/fm")
row "Issues" "stale wip $stale, done-rule breaks $broken, unblockable $unblock" "$(light_n $((stale + broken + unblock)) 2)" "/start-issue · /complete-issue · /weekly-review end"

# PARs: active projects where neither the PAR note nor a note of it changed in 14 days.
silent=""
while IFS= read -r p; do
	[ -z "$p" ] && continue
	hit=$(awk -F'\t' -v p="[[$p" -v me="./01 - PAR/$p.md" '$1 == me || index($8, p "]]") || index($8, p "|") { print $1 }' "$TMP/fm" | grep -Fxf - "$TMP/recent14" | head -1)
	[ -z "$hit" ] && silent="$silent$p, "
done < <(awk -F'\t' '$1 ~ /^\.\/01 - PAR\/[^\/]+\.md$/ && $5 == "true" && $6 == "Project" { n = $1; sub(/.*\//, "", n); sub(/\.md$/, "", n); print n }' "$TMP/fm")
ns=0; [ -n "$silent" ] && ns=$(echo "${silent%, }" | tr ',' '\n' | wc -l | tr -d ' ')
row "PARs" "$ns silent projects${silent:+: ${silent%, }}" "$(light_n "$ns" 1)" "/weekly-review end · /close-par"

# Journals: completed issues that no journal names.
journals=$(rg -l '^file_class: journal' --glob '*.md' -g '!99 - Meta/**' . 2>/dev/null)
unlogged=0
while IFS= read -r i; do
	[ -z "$i" ] && continue
	num="${i%% *}"
	# shellcheck disable=SC2086
	echo "$journals" | tr '\n' '\0' | xargs -0 grep -Fq "$num" 2>/dev/null || unlogged=$((unlogged + 1))
done <"$TMP/complete"
row "Journals" "$unlogged completed issues not in a journal" "$(light_n "$unlogged" 2)" "/complete-issue"

new=$(sed -n 's/^\([0-9][0-9]*\) new .*/\1/p' "$TMP/engine" | tail -1); new=${new:-?}
tx="ok"; [ "$(cat "$TMP/taxonomy")" != 0 ] && tx="FAIL"
el="ok"; [ "$new" != 0 ] && el="!"; [ "$tx" != ok ] && el="!!"
row "Legacy and engines" "audit.py --quick $new new, taxonomy verify $tx" "$el" "System Maintenance & Review · /new-system-element"

if [ "$LINKS" = 1 ]; then
	lk=$(tr -dc '0-9' <"$TMP/links"); lk=${lk:-?}
	row "Links" "$lk unresolved" "-" "/sweep"
else
	row "Links" "not counted (run with --links)" "-" "/sweep"
fi

sv="ok"; [ "$(cat "$TMP/sync")" != 0 ] && sv="!!"
row "AI guidance" "sync-skills status $( [ "$sv" = ok ] && echo ok || echo off), deeper checks by vault-auditor" "$sv" "/sweep · System Maintenance & Review"

[ -n "${TSV:-}" ] && { cat "$ROWS"; exit 0; }
printf 'Spotlight %s%s\n\n' "$TODAY" "${PAR:+ (par: $PAR)}"
awk -F'\t' '{ printf "%-3s %-19s %s\n     -> %s\n", $3, $1, $2, $4 }' "$ROWS"
exit 0
