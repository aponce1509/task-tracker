New. The `#todo` extraction of `_I00019`, usable alone or from `/end-day` and `/complete-issue`.

- Argument: `today | <note> | all`, default today
- Load: `note-issue`, `obsidian-vault-notes`
- Steps
	- Find the `#todo` lines in scope (`obsidian search` on `tag:#todo`)
	- Show each line with its note and its context line
	- Per line the user picks: issue / done now / delete / keep
	- Issue → `create-issue.sh` with the line as context and a link back; remove the tag
	- Done or delete → remove the tag or the line
- Output: the decisions and the issues created
- Rules
	- `all` runs in batches of 10
	- Never create an issue without the user's pick
