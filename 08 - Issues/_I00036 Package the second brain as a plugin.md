---
file_class: issue
paras:
  - "[[skills-system]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role:
priority: 1
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-20 11:50
dueDate:
dependencies:
  - "[[_I00022 Decide how skills and commands are stored across my systems]]"
---
# [[_I00036 Package the second brain as a plugin]]

> [!abstract] The second brain as a standard plugin
> - Package the vault skills, commands and agents in the standard plugin format.
> - Today they use a custom layout: canonical folders in `99 - Meta/` plus symlink views kept aligned by `scripts/sync-skills.sh`.

## Description

The vault assets are `99 - Meta/skills/`, `99 - Meta/commands/` and `99 - Meta/agents/`. `.claude/` and `.opencode/` see them through committed symlinks. This works, but it is custom. A standard plugin format makes the install the same as for any other plugin and removes the custom sync.

The vault is a repo, so its skills stay repo assets in git (rule from [[_I00022 Decide how skills and commands are stored across my systems]]).

Done: the vault is a plugin in the standard format. Claude Code and OpenCode load it without the custom symlink sync, or the sync becomes a thin wrapper around the standard tool.

## Tasks

- [ ] Try the standard formats first
  - Claude Code plugin (`.claude-plugin/`), `npx skills`, the OpenCode equivalent.
- [ ] Map the current layout to the plugin layout (skills, commands, agents, per-harness models)
- [ ] Migrate and remove or reduce `scripts/sync-skills.sh`
- [ ] Update AGENTS.md and the `_0_final` notes that describe the layout


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