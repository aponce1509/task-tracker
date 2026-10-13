Replaces [[WORKFLOWS - Out of the Inbox]]. Driven by `/guide-inbox-clean`.

Truths
- Goal stays the same: give the note a home, not perfection
- Trigger: any moment with a few minutes, a batch of 5 notes
- Steps
	- Pick the 5 oldest notes with `status: inbox`
	- `inbox-triager` proposes per note: keep or delete, identity, frontmatter, format, fill, issues, destination
	- Decide note by note: accept, change, skip, delete
	- Apply
		- Delete goes to `.trash/`
		- Metadata: `paras`, `type`, `subtypes`; `status` leaves `inbox`
		- Format and typos by the kind skill
		- Brain dumps, open questions, reflections: populate a bit in my voice
		- Todos that are real work become issues
		- Move to the folder; create the P/A/R first if needed
	- Run the engine audit at the end
- Maturity stays `capture` unless the note is already refined (then `distilled`)
- Changes against the legacy version: the triage is done by the agent, the decision stays with me, one note at a time

Open questions
- Is 5 the right batch size
- Does a note that was deleted need a trace (journal, log)
- Should notes with a special kind (meeting, concept) go to their own command instead (`/parse-meeting`, `/new-concept`)
