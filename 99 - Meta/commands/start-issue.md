---
description: Start a second-brain issue - context, tasks under thirty minutes, dependencies and the notes I need, then status wip
argument-hint: <issue number, name or path>
---

Start the issue: $ARGUMENTS

Slow down to speed up. Before I touch the problem, the issue has its context, short tasks, its dependencies and the notes I will need.

## Load first

- `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - Start Issue.md` and `The Issue System.md`. They win over anything else here.
- The `note-issue` skill (body shape, guardrails).

## Steps

1. Read the issue, its PAR note and the notes it links. When $ARGUMENTS is empty or matches more than one issue, ask which one.
2. Context. Check that the issue says what happens now and what must happen, in two or three sentences. Ask me for what is missing, all the questions in one message.
3. Dependencies. Read `dependencies:`. When one of them is not in `08 - Issues/complete/`, propose `status: blocked`, name the open dependency and stop after my answer.
4. Tasks. Propose tasks of less than thirty minutes, with sub-bullets for the details.
5. Notes I need. Search the topic (`obsidian search query="<key words>"`) and propose the notes and references the work will use, as a list of links.
6. Show the new body (context, notes I need at the top, tasks) and wait for approval. Write it with the Edit tool, then set `status: wip`.

## Output

Context gaps found, the tasks as written, the dependencies state, the notes list, the new status.

## Rules

- Keep my wording in the description; restructure, do not rewrite.
- Never start the work itself; the command ends at `status: wip`.
- Leave `## Post-Mortem` as it is; `/complete-issue` fills it.
