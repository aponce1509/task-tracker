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

- [x] Commit the two untracked skills (`task-planner`, `system-reference-maintance`) or deliberately gitignore them - today git distributes only part of the set *(moot: all five skills were committed mid-session by the harness checkpoint `0bb0060`, and the canonical move below re-lands them tracked at `99 - Meta/skills/`)*
- [x] Decide the canonical location of the skill sources: keep `.opencode/skills/` as source of truth, or a neutral `skills/` at the root with `.opencode/skills/` as a view *(decided 2026-10-13: `99 - Meta/skills/` inside the vault — sources visible and searchable as vault content; `.opencode/skills/` and `.claude/skills/` are committed dir-level symlinks to it)*
- [x] Expose the skills to Claude Code with committed `.claude/skills` symlink(s) pointing at the canonical copies (try a single dir-level symlink, fall back to per-skill symlinks if discovery fails) *(dir-level symlink `.claude/skills -> ../99 - Meta/skills` worked; no per-skill fallback needed; verified via fresh headless OpenCode session and `npx skills ls`)*
- [x] Mirror the `/postmortem` command for Claude Code via `.claude/commands` (its frontmatter + `$ARGUMENTS` format is compatible) *(superseded later the same day: the canonical file moved to `99 - Meta/commands/postmortem.md` and `.opencode/commands/`, `.claude/commands/` are now dir-level symlinks to it — same layout as the skills)*
- [x] Add a root `AGENTS.md` with a Skills section: where the skill sources live (`.opencode/skills/*/SKILL.md`), which to read before touching notes, and the dependency on the `obsidian` CLI (covered globally by the `obsidian-cli` skill in `~/.agents/skills/`) *(done, with canonical paths `99 - Meta/skills/*/SKILL.md` + a skill-file gotcha section)*
- [x] Optional: `scripts/sync-skills.sh` to install skills globally (`~/.agents/skills/`, `~/.claude/skills/`), driven by a per-skill audience marker (`project` | `global`) so vault-bound ones stay home *(built at the user's request — but scoped to project views, not global installs: `sync` idempotently repairs the four harness symlinks, `--apply` migrates legacy real-dir layouts into the canonical folders, `clean` removes `.DS_Store`/dangling links with dry-run default, `status` exits 1 when a view is off. Global installs stayed out of scope; the audience marker remains the planned extension)*
- [x] Optional: publish the generic skills to the skills.sh registry (`npx skills add <owner>/<repo>`) once they are repo-independent *(verified locally instead: `npx skills add "./99 - Meta/skills" --list` finds all 5, `npx skills use` generates a portable prompt; registry publishing deferred — the skills are vault-bound, they would need a repo-independent rewrite first)*

> [!summary] Resolved 2026-10-13 — with a bug found on the way
> The Description's premise was optimistic: the three vault-bound skills (`task-planner`, `system-reference-maintance`, `project-journaling`) were **not even activating in OpenCode** — only `markdown-editing` and `obsidian-vault-notes` appeared in `available_skills`. Root cause, proven with a controlled probe matrix: their `description:` YAML block scalars contained `: ` (colon+space), which breaks strict frontmatter parsing, and OpenCode then silently drops the skill (its lenient fallback only reads single-line values, leaving the description empty). Fix: descriptions rewritten short (<360 chars) and colon-free; all five now load in a fresh session (verified headless). Documented in the root `AGENTS.md` gotcha section. The symlink views also survived a live test: OpenCode's watcher picked up new skills through `.opencode/skills -> ../99 - Meta/skills` instantly.


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