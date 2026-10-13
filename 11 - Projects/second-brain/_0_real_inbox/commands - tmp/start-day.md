Drives [[WORKFLOWS - Start Day]]. Read-only except the daily note.

- Argument: none (today)
- Load: `task-planner`, `obsidian-vault-notes`
- Steps
	- Open today's daily note (`obsidian daily`), create it from the template when missing
	- Read yesterday's `Next:` line and show it first
	- Run `task-planner`: ordered tree of candidate tasks from the active PARs
	- Read the calendar slots when the user gives them; never invent meetings
	- Propose one objective and 3 to 5 tasks, linked to their issues
	- Approval stop, then write the plan under `## Daily Log`
	- Print one spotlight line: inbox count and the oldest inbox age (from `spotlight.sh`)
- Output: the bridge, the tree, the proposed plan, one spotlight line
- Rules
	- Never process the inbox here
	- Never change issue properties; the plan only links them
