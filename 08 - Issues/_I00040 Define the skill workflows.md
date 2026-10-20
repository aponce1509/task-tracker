---
file_class: issue
paras:
  - "[[skills-system]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - open-problem|open-problem]]"
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
# [[_I00040 Define the skill workflows]]

> [!abstract] Workflows for skills
> - Define how I create, test, distribute and update a skill, for each kind: personal, repo, standalone.
> - Today each skill follows its own path, so the result changes from one skill to the next.

## Description

Three kinds of skill, from [[_I00022 Decide how skills and commands are stored across my systems]]:

- Personal: in `~/.dotfiles`, synced to the harness list.
- Repo: in the repo, in git, like any other repo asset.
- Standalone: in their own repo, installed by each team with `npx skills`.

Each kind needs a workflow: where I write it, how I test it (evals, a fresh headless session), how I publish it and how users get the update.

Done: the workflows are defined and written in a note linked from [[skills-system]].

## Tasks

- [ ] List the steps of each workflow: create, test, distribute, update, retire
- [ ] Try the standard tools for each step (skill-creator evals, `claude plugin eval`, `npx skills`)
- [ ] Write the workflows note


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