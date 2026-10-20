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
  - "[[_I00034 Package the dotfiles personal skills as a plugin with a harness list]]"
---
# [[_I00035 Move vault-bridge to the dotfiles repo]]

> [!abstract] vault-bridge belongs to dotfiles
> - Move the `vault-bridge` skill from the vault to `~/.dotfiles`.
> - It is the only global skill and agents in other repos use it, so it is a personal skill, not a vault asset.

## Description

`vault-bridge` lives in `99 - Meta/skills/vault-bridge/` and is linked into the global skill folders. Its MCP server is `scripts/vault_mcp.py`, registered at user level. With the rule from [[_I00022 Decide how skills and commands are stored across my systems]], global personal skills live in dotfiles.

Done: `vault-bridge` has its source in `~/.dotfiles`, ships with the dotfiles plugin of [[_I00034 Package the dotfiles personal skills as a plugin with a harness list]], and the vault guidance (AGENTS.md, skill tables) points to the new place.

## Tasks

- [x] Decide where `vault_mcp.py` goes
  - It stays in the vault repo: it reads the vault files, so it changes with the vault layout. The skill only points to its path.
- [ ] Move the skill to `~/.dotfiles` and remove the vault copy and its symlink views
- [ ] Update AGENTS.md, the skill tables and `scripts/sync-skills.sh`
- [ ] Check that an agent in another repo still reads issues through the bridge


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