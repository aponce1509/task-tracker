Drives [[WORKFLOWS - End Day]].

- Argument: none (today)
- Load: `obsidian-vault-notes`, `note-issue`, `project-journaling`
- Steps
	- List the notes modified today (git or file mtime), issues first
	- Draft the Daily Log lines from the modified notes; the user adds the unplanned tasks
	- Issues with all tasks checked → offer `/complete-issue` for each
	- Todo sweep on today's notes: list each `#todo` line, the user picks issue / done / delete
	- `## Learned` has concepts → offer `/recall today`
	- Ask for the `Next:` line; propose one from the open tasks of today's issues
	- Approval stop, then write the log and the bridge
- Output: log draft, issues to close, todo list with choices, bridge
- Rules
	- Never write the bridge without the user's confirmation
	- Never log to the journal here; only `/complete-issue` does
