---
description: Draft - create a second-brain issue with enough context, through the note-issue skill
---

Draft command. Create an issue from $ARGUMENTS.

- Load the `note-issue` skill.
- Gather context
	- Read the notes, meeting or conversation that $ARGUMENTS points to.
	- Ask the user when the problem, the PAR or the definition of done is not clear.
- Create the issue description
	- Run `create-issue.sh` with title, PAR, subtype, priority and dependencies.
	- Write the description and the concise tasks with sub-bullets.
- Break down the issue only if really needed
	- Propose the split; create the extra issues only after approval, linked with `--depends`.
