---
description: Close or pause a project, area or resource - triage, decide its open issues, post-mortem, ending note, journal close, then active false and the archive
argument-hint: "<par> [finished | paused | abandoned]"
---

Close the PAR: $ARGUMENTS

Closing keeps the vault a true picture of my current life. The open work gets a decision, the lessons and reusable parts get a note, and the PAR freezes in the archive.

## Load first

- `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - End PAR.md` and `11 - Projects/second-brain/_0_final/Postmortem Content.md`. They win over anything else here.
- The `project-journaling` skill, the `note-issue` skill, the `note-index-moc` skill.

## Steps

1. Read the PAR note, its folder, its journal (`journal.sh show --project <par>`) and its open issues (`rg -l '\[\[<par>' "08 - Issues" -g '!complete/**'`).
2. Triage. When the PAR is barely developed (few notes, no issue done, no journal entries), propose delete instead of close. Delete only on explicit approval, to `.trash/`.
3. Open work. Per open issue I pick: close (`/complete-issue`), move to another PAR (change `paras`), or keep as debt (`role: debt`). One at a time.
4. Post-mortem, one topic per message, from the question bank: rate 1 to 3, one sentence on what went well, one on what to improve. Write them in the PAR note; `rate:` in the frontmatter.
5. Ending note. Draft the index or MoC of the final solution and the reusable parts, with the `note-index-moc` skill. Wait for approval, then write it in the PAR folder and link it from the PAR note.
6. Journal, project only: `bash .obsidian/personal_scripts/journal.sh close --project <par>`. It asks for the human lines; relay its questions to me, one by one, and pass my answers.
7. Freeze. Show the change and wait for approval: `active: false`, then move the PAR note to `01 - PAR/archive/` (`git mv` when tracked). Check that its links still resolve.

## Output

Issue decisions, the post-mortem, the ending note, the journal close output, the archive path.

## Rules

- Never delete without explicit approval.
- Paused also archives; a paused PAR comes back through `/new-par`, which offers reactivation.
- Never answer a post-mortem question for me.
