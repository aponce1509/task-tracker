#!/usr/bin/env bash
# audit.sh — read-only audit of index and MoC notes.
#
# Spec: 11 - Projects/second-brain/_0_final/The Index and MoC System.md
#
# Index = frontmatter type [[Indexes]]; MoC = [[MoCs]]; concept = type
# [[Core Knowledge]]. One awk pass reads every note; checks:
#   prose         index body has prose lines (only bullets, headers, callouts)
#   foreign       topic index that links concepts also links issues/meetings/journals
#   no-concept    topic index with no link to a concept (global index exempt)
#   unreachable   index not reachable from a global index through indexes/MoCs
#   single        index with a single entry
#   moc-issues    MoC that links more issues than concepts
#   moc-unlinked  MoC that no index links
#   hint          concept sharing a PAR with a MoC that the MoC does not link
#                 (reported, never fails the audit)
#
# Usage: audit.sh [--root DIR] [--quiet]   exit 0 clean, 1 findings

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
QUIET=0
while [ $# -gt 0 ]; do
	case "$1" in
	--root) ROOT="$2"; shift 2 ;;
	--quiet) QUIET=1; shift ;;
	-h|--help) sed -n '2,20p' "$0"; exit 0 ;;
	*) echo "unknown argument: $1" >&2; exit 2 ;;
	esac
done

cd "$ROOT"

find . -name '*.md' \
	-not -path './.obsidian/*' -not -path './.trash/*' -not -path './.git/*' \
	-not -path './02 - Categories/*' -not -path './99 - Meta/*' -print0 |
	xargs -0 awk -v quiet="$QUIET" '
function base(p,   n) { n = p; sub(/^.*\//, "", n); sub(/\.md$/, "", n); return tolower(n) }
function target(s,   t) { t = s; sub(/[|#^].*$/, "", t); sub(/^.*\//, "", t); sub(/\.md$/, "", t); return tolower(t) }
function add(c, f) { cnt[c]++; hit[c, cnt[c]] = f }
FNR == 1 { f = FILENAME; sub(/^\.\//, "", f); file[++nf] = f; key[f] = base(f)
	byname[key[f]] = f; infm = 0; inpar = 0; incode = 0; incall = 0 }
FNR == 1 && /^---[ \t]*$/ { infm = 1; next }
infm && /^---[ \t]*$/ { infm = 0; next }
infm {
	if ($0 ~ /^type:/) { t = $0; if (match(t, /\[\[[^]]+\]\]/)) type[f] = substr(t, RSTART + 2, RLENGTH - 4) }
	if ($0 ~ /global-index/) global[f] = 1
	if ($0 ~ /^[A-Za-z_]+:/) inpar = ($0 ~ /^paras:/)
	if ((inpar || $0 ~ /^paras:/)) { l = $0
		while (match(l, /\[\[[^]]+\]\]/)) { paras[f] = paras[f] "|" target(substr(l, RSTART + 2, RLENGTH - 4)) "|"; l = substr(l, RSTART + RLENGTH) } }
	next
}
/^```/ { incode = !incode; next }
incode { next }
{
	s = $0
	if (s ~ /^[ \t]*$/ || s ~ /^#/ || s ~ /^[ \t]*>/ || s ~ /^[ \t]*([-*+]|[0-9]+\.)[ \t]/) { } else prose[f]++
	line = $0
	while (match(line, /\[\[[^]]+\]\]/)) {
		tg = target(substr(line, RSTART + 2, RLENGTH - 4)); line = substr(line, RSTART + RLENGTH)
		if (tg == "" || tg == key[f]) continue
		e = f SUBSEP tg
		if (!(e in seen)) { seen[e] = 1; nout[f]++; out[f, nout[f]] = tg }
	}
}
END {
	for (i = 1; i <= nf; i++) { f = file[i]
		if (type[f] == "Indexes") idx[f] = 1
		if (type[f] == "MoCs") moc[f] = 1
	}
	# reachability over the navigation graph, from every global index
	nq = 0
	for (f in idx) if (global[f]) { reach[f] = 1; q[++nq] = f }
	for (h = 1; h <= nq; h++) { s = q[h]
		for (j = 1; j <= nout[s]; j++) { tg = out[s, j]; if (!(tg in byname)) continue; d = byname[tg]
			if ((d in idx || d in moc) && !(d in reach)) { reach[d] = 1; q[++nq] = d } } }
	ni = 0; nm = 0
	for (f in idx) { ni++
		con = 0; bad = 0
		for (j = 1; j <= nout[f]; j++) { tg = out[f, j]; if (!(tg in byname)) continue; tt = type[byname[tg]]
			if (tt == "Core Knowledge") con++
			if (tt == "Issues" || tt == "Meetings" || tt == "Journals") bad++ }
		if (prose[f] > 0) add("prose", f)
		if (con > 0 && bad > 0 && !global[f]) add("foreign", f)
		if (con == 0 && !global[f]) add("no-concept", f)
		if (!(f in reach)) add("unreachable", f)
		if (nout[f] == 1) add("single", f)
	}
	for (s in idx) for (j = 1; j <= nout[s]; j++) { tg = out[s, j]; if (tg in byname) linkedidx[byname[tg]] = 1 }
	for (f in moc) { nm++
		con = 0; iss = 0
		for (j = 1; j <= nout[f]; j++) { tg = out[f, j]; if (!(tg in byname)) continue; tt = type[byname[tg]]
			if (tt == "Core Knowledge") con++; if (tt == "Issues") iss++; linked[f, tg] = 1 }
		if (iss > con) add("moc-issues", f)
		if (!(f in linkedidx)) add("moc-unlinked", f)
		for (i = 1; i <= nf; i++) { c = file[i]; if (type[c] != "Core Knowledge" || paras[c] == "" || paras[f] == "") continue
			if (((f, key[c]) in linked)) continue
			np = split(paras[c], pp, "|"); share = 0
			for (k = 1; k <= np; k++) if (pp[k] != "" && index(paras[f], "|" pp[k] "|")) share = 1
			if (share) add("hint", f " -> " c) }
	}
	split("prose foreign no-concept unreachable single moc-issues moc-unlinked hint", order, " ")
	label["prose"] = "index with prose lines"
	label["foreign"] = "knowledge index linking issues/meetings/journals"
	label["no-concept"] = "topic index with no concept"
	label["unreachable"] = "index not reachable from a global index"
	label["single"] = "index with a single entry"
	label["moc-issues"] = "MoC with more issues than concepts"
	label["moc-unlinked"] = "MoC that no index links"
	label["hint"] = "concept in the MoC PAR not linked by it (hint)"
	total = 0
	printf "indexes: %d   mocs: %d\n", ni, nm
	for (o = 1; o <= 8; o++) { c = order[o]; printf "%-13s %3d  %s\n", c, cnt[c], label[c]; if (c != "hint") total += cnt[c]
		if (!quiet) for (j = 1; j <= cnt[c]; j++) printf "  - %s\n", hit[c, j]
	}
	exit (total > 0)
}
'
