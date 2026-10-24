---
description: Sweep the todo tags of today's notes, one note or the whole vault - each line becomes an issue, gets done now, is deleted or kept
argument-hint: "[today | <note> | all], default today"
---

Sweep the `#todo` lines of: $ARGUMENTS (default `today`).

A `#todo` line is a todo to extract. Left alone it rots. Each line gets one outcome, and the tag leaves the note with it.

## Load first

- `11 - Projects/second-brain/_0_final/Tag System & Ontology.md` (what `#todo` means) and the "Todo sweep" step of `workflows/WORKFLOWS - End Day.md`. They win over anything else here.
- The `note-issue` skill and the `obsidian-vault-notes` skill.

## Steps

1. Scope.
	- `today`: the notes changed today (`find . -name '*.md' -newermt "$(date +%Y-%m-%d)" -not -path './.*'`).
	- A note or an issue: that note only.
	- `all`: the whole vault, batches of 10 lines.
2. Find the lines: `rg -n '(^|\s)#todo(\s|$)' <scope>`. Skip mentions in backticks and the files under `99 - Meta/`.
3. Show each line with its note and the line above it for context. Per line I pick:
	- issue → `/create-issue` with the line as context and a link back to the note; then remove the tag from the line;
	- done now → do it when it takes two minutes, then remove the tag;
	- delete → remove the line;
	- keep → no change.
4. Apply each pick before showing the next line.

## Output

One line per todo: `<note> → issue [[...]] | done | deleted | kept`.

## Rules

- Never create an issue without my pick.
- Remove only the tag, not the text, unless I pick delete.
- `all` stops after each batch of 10 and asks before the next.
