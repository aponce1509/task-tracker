---
file_class: issue
paras:
  - "[[skills-system]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - open-problem|open-problem]]"
role:
priority:
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-13 11:42
dueDate:
dependencies:
---
# [[_I00022 Decide how skills and commands are stored across my systems]]

## Description

- Outcome of [[_I00021 Distribute the second-brain skills beyond OpenCode]]: the second brain now has a standard way to store and distribute agent assets — canonical sources in `99 - Meta/skills/` + `99 - Meta/commands/`, harness views as committed symlinks, `scripts/sync-skills.sh` (`status`/`sync`/`clean`) keeping them aligned.
- Same question at the system level: how to handle my skills (and commands, and soon agents) across ALL my repos and machines.
- Options on the table (user framing, 2026-10-13):
	1. Store them in each repo and install manually.
	2. Save all of them in the dotfiles repo.
	3. Split — only central/generic ones in the dotfiles repo, repo-specific ones in each repo.
- Related context: the skills.sh CLI (`npx skills add <owner>/<repo>` / local paths / packs), and the audience marker idea (`project` | `global`) left as a planned extension in `_I00021`.

- Decision (2026-10-20), a variant of option 3, now the base of [[skills-system]]:
	- Personal skills (my fixations, my notes system, my dev env) live in `~/.dotfiles` and sync like any config file to a list of harnesses (`.agents`, `.devin`, `.claude`).
	- Repo skills are repo assets: they live in the repo and go in git.
	- Standalone skills live in their own repo and each team installs them with `npx skills`.
	- Dotfiles and the second brain use the standard plugin format.

## Tasks

- [x] Compare the options and decide the pattern
- [ ] Write the decision as a normative note, linked from [[skills-system]]
  - The wiring is in [[_I00034 Package the dotfiles personal skills as a plugin with a harness list]] and [[_I00036 Package the second brain as a plugin]].


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