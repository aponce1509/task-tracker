Drives [[WORKFLOWS - Start Issue]].

- Argument: `<issue>` (number, name or path)
- Load: `note-issue`
- Steps
	- Read the issue, its PAR and its links
	- Check the context: current vs expected; ask when missing
	- Propose tasks of less than 30 minutes with sub-bullets
	- Check `dependencies:`; any open → propose `status: blocked` and stop
	- Propose the "notes I need" list from search on the issue topic
	- Approval stop, then write; set `status: wip`
- Output: context gaps, proposed tasks, dependencies state, notes list
- Rules
	- Keep the user's wording in the description
	- Never start the work itself
