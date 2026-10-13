Drives [[WORKFLOWS - Bi-Monthly Inbox Sweep]]. Orchestrates existing pieces.

- Argument: `[minutes]`, default 15 for the inbox part
- Load: `inbox-triager`, `vault-auditor`, `note-issue`
- Steps
	- Remind the capture devices; wait until the user says they are empty
	- `inbox-triager` on the inbox notes older than two weeks: propose deletions only
	- Approval stop; deletions to `.trash/`
	- Loop `/guide-inbox-clean 5` until the timecap
	- `vault-auditor`: all audits + guidance checks
	- Rank the findings; the user picks the ones that become issues (`/create-issue`)
- Output: purge list, batches done, audit summary, issues created
- Rules
	- No journal entry
	- Never fix an audit finding inside the sweep; it becomes an issue or waits
