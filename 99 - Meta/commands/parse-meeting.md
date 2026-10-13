---
description: Draft - parse a raw meeting note into take-aways, callouts, issues and a journal entry
---

Draft command. Parse the meeting in $ARGUMENTS (a meeting note, a path or pasted raw notes).

- Load the `note-meeting` skill.
- If the user does not give context (PAR, date, attendees, purpose), ask for it.
- Create the meeting note when only raw text was given; keep the raw notes under `## Notes`.
- Extract key points and add callouts
	- Long dumps go to the `meeting-extractor` agent; review its proposal with the user.
	- Write the approved take-aways and top callouts.
- Todos become issues: propose the list, then the `note-issue` skill creates each one with a link back to the meeting.
- Link to the journal: `journal.sh log --kind meeting --link "[[<meeting note>]]"` (the `project-journaling` skill).
- Set `status: done`, `maturity: distilled`.
