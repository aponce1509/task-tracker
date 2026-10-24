---
description: Close a second-brain issue - tasks check, guided post-mortem, spin-offs, todo sweep, done-rule (status and folder together) and the journal entry
argument-hint: "<issue number, name or path>, default the most recent wip issue"
---

Complete the issue: $ARGUMENTS

Closing an issue keeps its lessons and its spin-offs. The post-mortem fills the issue, new work becomes new issues, what I learned becomes concepts, and the journal logs the completion. This command is the only one that runs the post-mortem.

## Load first

- `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - Complete Issue.md` and `The Issue System.md` (conventions and the post-mortem protocol). They win over anything else here.
- `11 - Projects/second-brain/_0_final/Postmortem Content.md`: the question bank behind the protocol.
- The `note-issue` skill and the `project-journaling` skill.

## Steps

1. Resolve the issue. $ARGUMENTS accepts `_I000NN`, a note name or a path. Empty: the most recently modified issue with `status: wip` in `08 - Issues/` (never from `complete/` or `todos/`). Read it, its PAR and its links.
2. Tasks. List the open `- [ ]` tasks. For each, I pick: done now, drop, or move to a new issue (`/create-issue`, the task as context, a link back). Wait for each pick.
3. Post-mortem, one topic per message, guide and never invent answers:
	- Objective moved: which personal or work objective this issue moved.
	- Good things and bad things.
	- Rate 1 to 3.
	- Notes to create. Propose per the taxonomy and create only after explicit confirmation, with the `obsidian-vault-notes` skill: ending note (core note or index of the final solution, reusable pieces), tech debt (Descriptive → Project Contexts → technical-debt), review of the resources and tools used (External Knowledge → Resources), additional requirements (Normative → Requirements), decisions or solutions when a pattern emerges, ideas (Your Brain → Ideas).
4. Fill the issue. Write `## Post-Mortem` in place, nothing below it. The "Notes to create?" sub-list of the template is only inspiration: keep only the links to the notes created, one bullet each, or a single `- Notes created: none`. Set `rate:` when I gave one. Keep entries short.
5. Spin-offs. Offer each, apply only on approval:
	- quick fix or new bug → `/create-issue`, `--role debt` for tech debt;
	- something I learned → `/new-concept`;
	- a solution worth reuse → a note linked from the project MoC (covered by step 3).
6. Todo sweep: the steps of `/todo-sweep <issue>`. No `#todo` line stays in a closed issue.
7. Done-rule. Show the change and wait for approval, then in this order:
	- set `status: done`;
	- move the file to `08 - Issues/complete/` (`git mv` when tracked, `mv` otherwise);
	- if the move fails, set `status` back to its old value and stop with the error.
8. Journal, only after the move succeeds: `bash .obsidian/personal_scripts/journal.sh log --project <par> --kind done --what "<one line>" --link "[[<issue>]]" --good "<good>" --bad "<bad>"`, with `--dur <min>` when I give the time. If the PAR has no journal, report it and ask before opening one. Then tick the "added to the logging" line of the post-mortem.

## Output

One block: tasks state, post-mortem as written, spin-offs created, done-rule state (status and path), the journal line.

## Rules

- The done-rule is atomic: the property and the folder change together or not at all.
- Never answer a post-mortem question for me; a wrong lesson is worse than a missing one.
- The issue reads as my own note: no sentences addressed to me, no change log.
