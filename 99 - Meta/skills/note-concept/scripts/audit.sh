#!/usr/bin/env bash
# audit.sh — read-only audit of concept notes (Core Knowledge).
#
# Spec: 11 - Projects/second-brain/_0_final/The Concept System.md
#
# A concept = a note whose frontmatter type is [[Core Knowledge]] or that
# links a "Knowledge - Core Knowledge - *" subtype. One awk pass reads every
# note; checks:
#   orphan        no index or MoC links the concept
#   unrecalled    no daily note (07 - Daily/) links the concept
#   no-out        no body link to a concept, a source (Medias/Resources) or an
#                 unresolved note
#   identity      type is not Core Knowledge, or no subtype
#
# Usage: audit.sh [--root DIR] [--quiet]   exit 0 clean, 1 findings

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
QUIET=0
while [ $# -gt 0 ]; do
	case "$1" in
	--root) ROOT="$2"; shift 2 ;;
	--quiet) QUIET=1; shift ;;
	-h|--help) sed -n '2,18p' "$0"; exit 0 ;;
	*) echo "unknown argument: $1" >&2; exit 2 ;;
	esac
done

cd "$ROOT"

find . -name '*.md' \
	-not -path './.obsidian/*' -not -path './.trash/*' -not -path './.git/*' \
	-not -path './.claude/*' -not -path './.opencode/*' -not -path './.agents/*' \
	-not -path './02 - Categories/*' -not -path './99 - Meta/*' -print0 |
	xargs -0 awk -v quiet="$QUIET" '
function base(p,   n) { n = p; sub(/^.*\//, "", n); sub(/\.md$/, "", n); return tolower(n) }
function target(s,   t) { t = s; sub(/[|#^].*$/, "", t); sub(/^.*\//, "", t); sub(/\.md$/, "", t); return tolower(t) }
FNR == 1 { f = FILENAME; sub(/^\.\//, "", f); file[++nf] = f; key[f] = base(f)
	byname[key[f]] = f; infm = 0; fmdone = 0; insub = 0; incode = 0 }
FNR == 1 && /^---[ \t]*$/ { infm = 1; next }
infm && /^---[ \t]*$/ { infm = 0; fmdone = 1; next }
infm {
	if ($0 ~ /^type:/) { t = $0; if (match(t, /\[\[[^]]+\]\]/)) type[f] = substr(t, RSTART + 2, RLENGTH - 4) }
	if ($0 ~ /^maturity:/) { m = $0; sub(/^maturity:[ \t]*/, "", m); mat[f] = m }
	if ($0 ~ /^[A-Za-z_]+:/) insub = ($0 ~ /^subtypes:/)
	if ((insub || $0 ~ /^subtypes:/) && $0 ~ /\[\[/) { nsub[f]++; if ($0 ~ /Knowledge - Core Knowledge - /) cksub[f] = 1 }
	next
}
/^```/ { incode = !incode; next }
incode { next }
{
	line = $0
	while (match(line, /\[\[[^]]+\]\]/)) {
		tg = target(substr(line, RSTART + 2, RLENGTH - 4)); line = substr(line, RSTART + RLENGTH)
		if (tg == "") continue
		e = f SUBSEP tg
		if (!(e in seen)) { seen[e] = 1; nout[f]++; out[f, nout[f]] = tg }
	}
}
END {
	for (i = 1; i <= nf; i++) { f = file[i]
		if (type[f] == "Core Knowledge" || cksub[f]) concept[key[f]] = f
	}
	for (i = 1; i <= nf; i++) { s = file[i]
		nav = (type[s] == "Indexes" || type[s] == "MoCs"); daily = (s ~ /^07 - Daily\//)
		for (j = 1; j <= nout[s]; j++) { tg = out[s, j]
			if (!(tg in concept) || tg == key[s]) continue
			if (nav) navin[tg] = 1
			if (daily) dayin[tg] = 1
		}
	}
	n = 0
	for (k in concept) { f = concept[k]; n++
		if (!(k in navin)) add("orphan", f)
		if (!(k in dayin)) add("unrecalled", f)
		good = 0
		for (j = 1; j <= nout[f]; j++) { tg = out[f, j]
			if (!(tg in byname)) { good = 1; break }
			tt = type[byname[tg]]
			if ((tg in concept && tg != k) || tt == "Medias" || tt == "Resources") { good = 1; break }
		}
		if (!good) add("no-out", f)
		if (type[f] != "Core Knowledge" || nsub[f] == 0) add("identity", f)
	}
	split("orphan unrecalled no-out identity", order, " ")
	label["orphan"] = "no index or MoC links it"
	label["unrecalled"] = "no daily note links it"
	label["no-out"] = "no link to a concept, source or unresolved note"
	label["identity"] = "type not Core Knowledge or no subtype"
	total = 0
	printf "concepts: %d\n", n
	for (o = 1; o <= 4; o++) { c = order[o]; printf "%-11s %3d  %s\n", c, cnt[c], label[c]; total += cnt[c]
		if (!quiet) for (j = 1; j <= cnt[c]; j++) printf "  - %s\n", hit[c, j]
	}
	exit (total > 0)
}
function add(c, f) { cnt[c]++; hit[c, cnt[c]] = f }
'
