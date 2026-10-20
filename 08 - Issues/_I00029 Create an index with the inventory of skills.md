---
file_class: issue
paras:
  - "[[skills-system]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role:
priority: 0
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-18 09:31
dueDate:
dependencies:
---
# [[_I00029 Create an index with the inventory of skills]]

> [!abstract] One view of all my skills
> - An index note that lists every skill, global (core) and per project, with its source and purpose.
> - Today the skills are spread over several folders and repos, and there is no view of what exists. This index is the input for [[_I00022 Decide how skills and commands are stored across my systems]].

## Description

The skills live in several places:

- Global: `~/.agents/skills/` and `~/.claude/skills/`. Some entries are symlinks (for example `vault-bridge`) and some are copies.
- The vault: `99 - Meta/skills/`, loaded by the harnesses through the `.claude/` and `.opencode/` symlink views.
- Each code repo: its own `.claude/`, `.opencode/` or `.agents/` skills.

No note shows which skills exist, where the source of each one lives, which harness loads it, and whether it is global or bound to one project. Because of this, the storage decision in `_I00022` has no data to start from.

Done: one index note in the vault, with one section for the global skills and one section per project. The global index links to it, and so does `_I00022`.

## Tasks

- [ ] Collect the global (core) skills
  - `~/.agents/skills/`, `~/.claude/skills/`. For each symlink, record where it points.
- [ ] Collect the per-project skills
  - The vault (`99 - Meta/skills/`) and each repo that has `.claude/`, `.opencode/` or `.agents/` skills.
- [ ] Write the index note: one section for the global skills, one section per project
  - For each skill: name, source path, harnesses that load it, purpose in one line.
- [ ] Link the index from the global index and from `_I00022`


## Post-Mortem

- We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
- Objective moved:
- Good things:
- Bad Things:
- Rate (1-3):
- Notes to create?
	- Ending note: core note/index that builds the final solution
	- Reusable in other places
	- Tech debt
	- Review of the resources & tools used
	- Additional requirements
	- Ideas