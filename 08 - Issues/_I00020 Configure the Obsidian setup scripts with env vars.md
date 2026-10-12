---
file_class: issue
paras:
  - "[[second-brain]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - improvement|improvement]]"
role:
priority:
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-12 17:10
dueDate:
dependencies:
complete: false
---
# [[_I00020 Configure the Obsidian setup scripts with env vars]]

## Description

- Configure the execution of the Obsidian setup scripts through environment variables (paths, binaries, folders) instead of hardcoded values, so the scripts run unchanged in any environment.
- In scope:
	- `start_second_brain.sh` - target folders hardcoded; copies templates from unquoted `$DOTFILES`.
	- `.obsidian/personal_scripts/taxonomy.sh` - `TAXONOMY_JSON`, `SUBTYPES_DIR`, `TYPES_DIR` already overridable; generator path hardcoded.
	- `.obsidian/personal_scripts/subtypes_generation.sh` - positional args with relative defaults; no env vars.
	- `.obsidian/personal_scripts/create-issue.sh` - `ISSUE_TEMPLATE` and `OBSIDIAN_BIN` already overridable; issue/subtype/template folders hardcoded.
- Out of scope: non-Obsidian scripts (e.g. `scripts/bonds-duration.py`).

## Tasks

- [ ] Inventory each Obsidian script's hardcoded paths, binaries and folders
- [ ] Move them to env vars with safe defaults, following the existing `OBSIDIAN_BIN` / `TAXONOMY_JSON` pattern
- [ ] Document the env vars (README and/or each script's `--help`)


## Post-Mortem

- We have added this to the logging? (project journal — TBD)
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