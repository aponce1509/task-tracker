---
description: Parse a raw meeting into take-aways, top callouts, issues that link back, and a project journal entry
argument-hint: <meeting note, path, or pasted raw notes>
---

Parse this meeting: $ARGUMENTS

A meeting note keeps what was said. The raw notes are the record and stay untouched; the parse adds a summary on top, turns todos into issues and logs the meeting in the journal.

## Load first

- The `note-meeting` skill (body, naming, guardrails), plus `note-issue` and `project-journaling` for the fan-out.
- `11 - Projects/second-brain/_0_final/The Meeting System.md`: the spec. It wins over anything else here.

## Steps

1. Locate or create the note.
	- A note or path: read it.
	- Raw text: you need the PAR, the date, the attendees and the purpose. Ask for the missing ones in one message. Then create `<base>/<PAR>/Logs/_M/_M<NNNNN> <Meeting name>.md` (base from the PAR's `paraType`: Project → `11 - Projects`, Area → `12 - Areas`, Resource → `13 - Resources`; next number from the files in that folder). Put the raw text under `## Notes` verbatim, `status: inbox`, `maturity: capture`.
2. Extract.
	- Short notes (about one screen): do it yourself.
	- Long notes or a transcript: delegate to the `meeting-extractor` subagent (Claude Code: Agent tool; OpenCode: task tool). It starts with no context, so pass the note path, the PAR, and the user's context.
3. Show the proposal and wait for approval:
	```
	Summary:     <2 lines: why we met, what we decided>
	Callouts:    <warning|question|info, only if the meeting raised one>
	Take aways:  - ...
	Todos → issues:
	  1. <title> — <subtype>, P<priority>
	Questions:   <facts that could not be placed>
	```
4. Write the approved summary, callouts and take-aways into the note. `## Notes` does not change.
5. Create each approved issue with the `note-issue` skill (`create-issue.sh`). Each issue links the meeting; `## Todos` links each issue.
6. Log the meeting: `bash .obsidian/personal_scripts/journal.sh log --project <par> --kind meeting --what "<one line>" --link "[[<meeting note>]]"`. If the PAR has no journal, report it and ask before opening one.
7. Set `status: done` and `maturity: distilled`.

## Output

The meeting link, the issues created, the journal entry, and anything still open.

## Rules

- Never invent decisions, owners or dates. A wrong decision in the record is worse than a missing one.
- Ideas and comments stay in the meeting note unless the user asks for their own note.
- Write as the user writes ([[How I Like My Notes]]).
