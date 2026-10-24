#!/usr/bin/env bash
# audit.sh — read-only audit of syllabus notes (Roadmaps / course).
#
# Spec: 11 - Projects/second-brain/_0_final/The Syllabus System.md
#
# A syllabus = a note whose frontmatter type is [[Roadmaps]] and that links
# the "Knowledge - Roadmaps - course" subtype. One awk pass reads every note;
# checks:
#   multi-active  more than one [/] module in the vault (lists them all)
#   no-concepts   [x] module with no "Concepts:" line holding a link
#   no-active     learning_status: learning and no [/] module
#   stale         learning_status: learning and no change in 14 days
#   no-main       no bold main source under ## Sources
#   hint          active resource PAR with no syllabus (does not fail)
#
# Usage: audit.sh [--root DIR] [--quiet]   exit 0 clean, 1 findings

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
QUIET=0
while [ $# -gt 0 ]; do
	case "$1" in
	--root) ROOT="$2"; shift 2 ;;
	--quiet) QUIET=1; shift ;;
	-h|--help) sed -n '2,17p' "$0"; exit 0 ;;
	*) echo "unknown argument: $1" >&2; exit 2 ;;
	esac
done

cd "$ROOT"

PRUNE=(-not -path './.obsidian/*' -not -path './.trash/*' -not -path './.git/*'
	-not -path './.claude/*' -not -path './.opencode/*' -not -path './.agents/*'
	-not -path './02 - Categories/*' -not -path './99 - Meta/*')
OLD="$(find . -name '*.md' "${PRUNE[@]}" -mtime +14 | sed 's#^\./##' | tr '\n' '\034')"

find . -name '*.md' "${PRUNE[@]}" -print0 |
	xargs -0 awk -v quiet="$QUIET" -v old="$OLD" '
function base(p,   n) { n = p; sub(/^.*\//, "", n); sub(/\.md$/, "", n); return tolower(n) }
function closemod() { if (mstate == "x" && !mconc) add("no-concepts", f " :: " mname); mstate = "" }
BEGIN { n = split(old, o, "\034"); for (i = 1; i <= n; i++) if (o[i] != "") isold[o[i]] = 1 }
FNR == 1 { if (f != "") closemod()
	f = FILENAME; sub(/^\.\//, "", f); file[++nf] = f
	infm = 0; insub = 0; inpar = 0; incode = 0; sect = ""; mstate = "" }
FNR == 1 && /^---[ \t]*$/ { infm = 1; next }
infm && /^---[ \t]*$/ { infm = 0; next }
infm {
	if ($0 ~ /^type:/) { t = $0; if (match(t, /\[\[[^]]+\]\]/)) type[f] = substr(t, RSTART + 2, RLENGTH - 4) }
	if ($0 ~ /^learning_status:/) { v = $0; sub(/^learning_status:[ \t]*/, "", v); lstat[f] = v }
	if ($0 ~ /^paraType:/) { v = $0; sub(/^paraType:[ \t]*/, "", v); ptype[f] = v }
	if ($0 ~ /^active:[ \t]*true/) active[f] = 1
	if ($0 ~ /^[A-Za-z_]+:/) { insub = ($0 ~ /^subtypes:/); inpar = ($0 ~ /^paras:/) }
	if ((insub || $0 ~ /^subtypes:/) && $0 ~ /Knowledge - Roadmaps - course/) course[f] = 1
	if (inpar || $0 ~ /^paras:/) { l = $0
		while (match(l, /\[\[[^]|]+/)) { paras[f, ++np[f]] = tolower(substr(l, RSTART + 2, RLENGTH - 2)); l = substr(l, RSTART + RLENGTH) } }
	next
}
/^```/ { incode = !incode; next }
incode { next }
/^## / { closemod(); sect = $0; sub(/^## +/, "", sect); next }
sect == "Sources" && /^- .*\*\*[^*]+\*\*/ { mainsrc[f] = 1 }
sect == "Modules" && /^- \[[ \/xX]\] / { closemod()
	mstate = substr($0, 4, 1); if (mstate == "X") mstate = "x"
	mname = $0; sub(/^- \[.\] +/, "", mname); mconc = 0
	if (mstate == "/") { nact++; act[nact] = f " :: " mname; hasact[f] = 1 }
	next }
sect == "Modules" && mstate != "" && /^[ \t]+- / && /Concepts:/ && /\[\[/ { mconc = 1 }
END { closemod()
	n = 0
	for (i = 1; i <= nf; i++) { f = file[i]
		if (type[f] == "Roadmaps" && course[f]) { n++
			for (j = 1; j <= np[f]; j++) covered[paras[f, j]] = 1
			if (lstat[f] == "learning" && !hasact[f]) add("no-active", f)
			if (lstat[f] == "learning" && (f in isold)) add("stale", f)
			if (!mainsrc[f]) add("no-main", f)
		}
	}
	if (nact > 1) for (j = 1; j <= nact; j++) add("multi-active", act[j])
	for (i = 1; i <= nf; i++) { f = file[i]
		if (f ~ /^01 - PAR\// && ptype[f] == "Resource" && active[f] && !(base(f) in covered)) add("hint", f)
	}
	split("multi-active no-concepts no-active stale no-main hint", order, " ")
	label["multi-active"] = "more than one [/] module in the vault"
	label["no-concepts"] = "[x] module with no Concepts line"
	label["no-active"] = "learning syllabus with no [/] module"
	label["stale"] = "learning syllabus with no change in 14 days"
	label["no-main"] = "no bold main source under ## Sources"
	label["hint"] = "active resource PAR with no syllabus (hint)"
	total = 0
	printf "syllabi: %d   active modules: %d\n", n, nact
	for (k = 1; k <= 6; k++) { c = order[k]; printf "%-13s %3d  %s\n", c, cnt[c], label[c]
		if (c != "hint") total += cnt[c]
		if (!quiet) for (j = 1; j <= cnt[c]; j++) printf "  - %s\n", hit[c, j]
	}
	exit (total > 0)
}
function add(c, x) { cnt[c]++; hit[c, cnt[c]] = x }
'
