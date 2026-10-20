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
created: 2026-10-20 11:50
dueDate:
dependencies:
  - "[[_I00022 Decide how skills and commands are stored across my systems]]"
---
# [[_I00034 Package the dotfiles personal skills as a plugin with a harness list]]

> [!abstract] Personal skills as a plugin in dotfiles
> - The personal (global) skills live in `~/.dotfiles` and sync to every harness from one config with the list of harnesses.
> - Today they are copies and symlinks spread over `~/.agents/skills/` and `~/.claude/skills/`, with no single source.

## Description

Personal skills handle personal things: my fixations, my notes system, how I like my dev env. They are config, so they live in `~/.dotfiles` and sync like any other config file.

The dotfiles must use the standard plugin format, not a custom layout. One config holds the list of harnesses to install into. For now: `.agents`, `.devin`, `.claude`.

Done: the personal skills have one source in `~/.dotfiles`, packaged as a plugin. One command installs them into every harness in the config, on a fresh machine too.

## Tasks

- [ ] Find the standard plugin format and how each harness loads it
  - Claude Code plugins, `.agents` (skills.sh), Devin. Try the standard tools before writing a custom sync.
- [ ] List the personal skills to move
  - Input: [[_I00029 Create an index with the inventory of skills]].
- [ ] Add the harness list config (`.agents`, `.devin`, `.claude`)
- [ ] Move the skills into `~/.dotfiles` as a plugin and wire the install/sync
- [ ] Test the bootstrap on a clean home


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