---
description: Draft - clean a batch of five inbox notes with the inbox-triager agent and apply the approved moves
---

Draft command. Clean the inbox, $ARGUMENTS notes (default 5).

- Take 5 notes from `09 - Inbox/` (oldest first).
- Run the `inbox-triager` agent on the batch; show its table.
- Per note, after approval
	- Review metadata and apply the changes.
	- Formatting and typo fix (the skill of the kind).
	- Issues creation if needed (`note-issue`).
	- If brain dump, open question or reflection: populate the note a bit, in the user's voice.
	- Move the note; create the Project, Area or Resource first if needed.
- Run the engine audit at the end.
