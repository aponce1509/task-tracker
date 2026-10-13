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
created: 2026-10-13 00:13
dueDate:
dependencies:
complete: false
---
# [[_I00021 Distribute the second-brain skills beyond OpenCode]]

## Description

- The vault's skills (`obsidian-vault-notes`, `markdown-editing`, `task-planner`, `system-reference-maintance`) and the `/postmortem` command live only under `.opencode/skills/` and `.opencode/commands/`, so they activate only in OpenCode sessions opened in this repo.
- Any other agent working on the same vault (Claude Code, Claude Desktop, AGENTS.md-reading tools like Codex or Cursor) sees none of them - the note conventions, the issue pipeline and the task planner silently don't apply.
- Distribution is also broken at the git level: `task-planner` and `system-reference-maintance` are untracked, so only half of the skill set even reaches other machines.
- Out of scope: changing skill content; this issue is only about where the sources live and how other agents get them.

> [!info] Design decision to make explicit
> These skills are vault-bound (they reference this vault's taxonomy, folders and the `obsidian` CLI), so their natural distribution is **project-scoped**: same repo, any agent. Only generic skills like `markdown-editing` are candidates for global installation (`~/.agents/skills/`, `~/.claude/skills/`). Related: [[_I00020 Configure the Obsidian setup scripts with env vars]] (same scripts-with-env-vars pattern would drive any sync script).

## Tasks

- [ ] Commit the two untracked skills (`task-planner`, `system-reference-maintance`) or deliberately gitignore them - today git distributes only part of the set
- [ ] Decide the canonical location of the skill sources: keep `.opencode/skills/` as source of truth, or a neutral `skills/` at the root with `.opencode/skills/` as a view
- [ ] Expose the skills to Claude Code with committed `.claude/skills` symlink(s) pointing at the canonical copies (try a single dir-level symlink, fall back to per-skill symlinks if discovery fails)
- [ ] Mirror the `/postmortem` command for Claude Code via `.claude/commands` (its frontmatter + `$ARGUMENTS` format is compatible)
- [ ] Add a root `AGENTS.md` with a Skills section: where the skill sources live (`.opencode/skills/*/SKILL.md`), which to read before touching notes, and the dependency on the `obsidian` CLI (covered globally by the `obsidian-cli` skill in `~/.agents/skills/`)
- [ ] Optional: `scripts/sync-skills.sh` to install skills globally (`~/.agents/skills/`, `~/.claude/skills/`), driven by a per-skill audience marker (`project` | `global`) so vault-bound ones stay home
- [ ] Optional: publish the generic skills to the skills.sh registry (`npx skills add <owner>/<repo>`) once they are repo-independent


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