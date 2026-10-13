Replaces [[WORKFLOWS - Bi-Monthly Inbox Sweep]]. Driven by `/guide-inbox-clean` in a loop plus the `vault-auditor` agent.

Truths
- Cadence: every two weeks, next to the periodic review of [[System Maintenance & Review]]
- Timecap: 15 minutes for the inbox, the audit runs apart
- Steps
	- Empty the external intake points into `09 - Inbox/` (phone, voice notes, Apple Notes)
	- Purge: notes with `status: inbox` older than 7 days that feel irrelevant go to `.trash/`
	- Run `/guide-inbox-clean` in batches of 5 until the timecap
	- Run the `vault-auditor` agent: engine audit, concept audit, index and MoC audit, guidance checks
	- Turn the top findings into issues with `/create-issue` (only the ones worth it)
	- Target: the inbox query `["status":inbox]` returns 0
- Changes against the legacy version: the sweep reuses the inbox command, and the audit joins the same session

Open questions
- Is the purge done by me only, or does the triager propose the deletions
- Is "inbox zero" the real target, or "nothing older than two weeks"
- Does the sweep get a journal entry (milestone) or nothing
