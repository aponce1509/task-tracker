---
description: Create a second-brain issue with enough context to follow it later, through create-issue.sh and the note-issue skill
argument-hint: <what needs doing, or a note/meeting to take it from>
---

Create one issue (or a small set of related issues) for: $ARGUMENTS

An issue in this vault is read weeks later, without this conversation. Its value is the context: a reader must understand the problem, where it shows and what "done" means from the note alone.

## Load first

- The `note-issue` skill: the script, the body shape and the guardrails.
- `11 - Projects/second-brain/_0_final/The Issue System.md`: the spec. It wins over anything else here.

## Steps

1. Gather context.
	- If $ARGUMENTS names a note, meeting or issue, read it and the notes it links.
	- Find the PAR: `ls "01 - PAR"`; an active project is the usual home.
	- Check for duplicates: `obsidian search query="<key words>" path="08 - Issues"`. If one exists, stop and show it.
2. Fill the gaps. You need four facts: the problem, the PAR, the definition of done, and any issue it depends on. Ask the user for what is missing, in one message with all the questions. Do not guess a PAR or a priority.
3. Propose, then wait for approval. Show:
	```
	Title:      <short, imperative>
	PAR:        <par>      Subtype: <bug|task|improvement|incident|open-problem|recurring>
	Priority:   <0|1|2>    Depends on: <_I0000N ...|none>
	Context:    <2-4 lines>
	Tasks:
	- [ ] ...
	  - ...
	```
	Split into several issues only when the parts have a different PAR or a different "done". Otherwise they are tasks of one issue.
4. Create with the script (Obsidian must be running):
	`bash .obsidian/personal_scripts/create-issue.sh --title "..." --project <par> --subtype <s> --priority <p> [--role <core|milestone|pattern|debt>] [--depends _I0000N]`
	Read the path it prints. If it fails, report the error and stop; never create the file by hand.
5. Write the body with the Edit tool, under the template's H1: the `> [!abstract]` callout (optional short title, two bullets, no empty `>` line), the context, the tasks. If the source is a meeting, link it in the context and add the issue under the meeting's `## Todos`. Leave the `## Post-Mortem` helper points as they are; `/postmortem` cleans them when closing.

## Output

End with one line per issue: `[[<issue note>]] — <subtype>, P<priority>, <PAR>`, then any open question.

## Rules

- Write as the user writes ([[How I Like My Notes]]): no sentences addressed to the user inside the note, because the note must read as the user's own.
- Never invent the `_I` number or the file: the template numbers it, and two writers would collide.
