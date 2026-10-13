Drives [[WORKFLOWS - Complete Issue]]. Chains existing pieces into one close.

- Argument: `<issue>`, default the most recent `wip` issue
- Load: `note-issue`, `project-journaling`
- Steps
	- Check the tasks; open ones → new issue or drop, user picks
	- Run `/postmortem`
	- Spin-offs from the post-mortem: debt issues (`--role debt`), concepts (`/new-concept`), reusable notes
	- `/todo-sweep <issue>`
	- `status: done` and move to `08 - Issues/complete/` (or the script of `_I00003` once it exists)
	- `project-journaling`: log the completion with the link
- Output: tasks state, post-mortem, spin-offs, done-rule state, journal line
- Rules
	- Done-rule is atomic: property and folder change together or not at all
	- The journal entry happens only after the move succeeds
