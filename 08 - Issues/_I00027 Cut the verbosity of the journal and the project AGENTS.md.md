---
file_class: issue
paras:
  - "[[second-brain]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - improvement|improvement]]"
role:
priority: 1
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-14 00:37
dueDate:
dependencies:
---
# [[_I00027 Cut the verbosity of the journal and the project AGENTS.md]]

> [!important] 
> Not sure of how to change both the agent and the task

> [!abstract] Summary
> - Agents write the project journal and the project memory as long paragraphs.
> - Both files get hard to read for me and expensive to load for agents.
> - Set a length rule in the guidance and rewrite both files to it.

> [!info] Append-only exception
> The old journal entries get rewritten once to the new rule. This is a single, approved exception to the append-only rule of the journal.

## Description

- [[Journal - second-brain]]: each entry written by an agent is one long paragraph. The "Properties engine swept to zero" entry has about 600 characters, and an agent detail in it ("Roncero") needed a correction line. Neither the `project-journaling` skill nor `journal.sh` sets a length limit.
- `11 - Projects/second-brain/AGENTS.md`, the build memory: 30 KB in 131 lines. 27 of its 32 status-log entries have more than 400 characters. The File Inventory repeats what [[The Second Brain System]] already indexes. The root `AGENTS.md` (3.8 KB) is fine.
- Done when the guidance holds a length rule for journal entries and status-log entries, the journal entries follow it, and the project AGENTS.md keeps only what [[The Second Brain System]] and git do not.

## Tasks

- [ ] Set the journal entry rule in the `project-journaling` skill and `note-journal.md`
  - One line of about 120 characters or less: what changed and the link. The details live in the linked note.
  - Optional: `journal.sh` warns when an entry is over the limit
- [ ] Rewrite the existing journal entries to the rule
  - One approved edit, through `journal.sh` when it can, by hand only for this exception
  - Keep the `kind`, `good` and `bad` keys; drop the correction line once the entry is right
- [ ] Define what the project AGENTS.md holds
  - Objective, where to start, agent rules, a short status log
  - No inventory that [[The Second Brain System]] already holds
- [ ] Trim the project AGENTS.md
  - File Inventory → a pointer to [[The Second Brain System]]
  - Status log → one line per entry; old entries move to an archive file or go (git keeps the history)
- [ ] Add the status-log length rule to the Agent Rules of the project AGENTS.md


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