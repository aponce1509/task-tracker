# AGENTS.md — second-brain vault

Personal Obsidian vault (second brain). These instructions apply to any agent working in this repo — OpenCode, Claude Code, Codex, Cursor, or any tool that reads `AGENTS.md`.

## Source of truth

The notes in `11 - Projects/second-brain/_0_final/` define the system; skills, agents and commands only apply them (hierarchy in `_0_final/The AI Guidance System.md`, note kinds in `_0_final/The Note Kinds.md`). When guidance and a note disagree, the note wins and the guidance is fixed.

## Skills

The skill sources live in `99 - Meta/skills/<name>/SKILL.md` — one folder per skill. `.opencode/skills/` and `.claude/skills/` are committed symlinks to that folder, so every harness loads the same sources. If your harness has no skill mechanism, read the relevant `SKILL.md` directly from `99 - Meta/skills/`. Keep the views aligned with `scripts/sync-skills.sh` (`status` / `sync` / `clean`; `--apply` also migrates legacy real-dir layouts into the canonical folders).

Read before touching notes:

- `obsidian-vault-notes` — MANDATORY before creating, writing, editing or refactoring any `.md` note in this vault. It is the router and owns the shared rules: metadata framework (properties / type+subtypes / tags / PARA context), the writing style (`references/writing-style.md`), journals and any note without a kind skill.
- Note-kind skills (creation only), loaded on top of `obsidian-vault-notes`: `note-issue`, `note-meeting`, `note-concept`, `note-index-moc`, `note-diagram`, `note-syllabus`.
- `markdown-editing` — MANDATORY when writing any Markdown file: minimal style, no `---` section separators, no numbered headings.

System work:

- `system-reference-maintance` — run the audit after any system modification (taxonomy, properties, tags, bases) and for periodic reviews: `python3 "99 - Meta/skills/system-reference-maintance/scripts/audit.py"`. Read-only; exit 1 = new drift.
- `task-planner` — task selection for "what should I do next" / "plan my day": active PARs → open issues → dependencies, priorities, due dates → ordered tree. Read-only.
- `vault-bridge` — the only global skill: agents in other repos read issues and PAR notes through the read-only `vault` MCP server (`scripts/vault_mcp.py`, registered at user level) or the obsidian CLI, and write back only through `create-issue.sh` / `journal.sh`.
- `project-journaling` — log completed issues and parsed meetings, and anything else only when the user explicitly asks (milestones, tech debt, close), to project journals, always through `journal.sh`.

Subagents: `99 - Meta/agents/<name>.md` — `meeting-extractor`, `concept-distiller`, `navigation-curator`, `inbox-triager` (read-only), `vault-auditor` (read-only), `diagram-writer`, `diagram-reviewer` (read-only, `note-diagram` orchestrates both). Writer agents write only an approved plan passed in the prompt. Agent models are set per harness: `model: sonnet` in the frontmatter is for Claude Code, and `opencode.json` (`agent.<name>.model`) overrides it for OpenCode. A new agent needs both.

Slash commands: `99 - Meta/commands/<name>.md` — notes: `/create-issue`, `/parse-meeting`, `/new-concept`, `/new-syllabus`, `/guide-distillation`, `/guide-inbox-clean`, `/recall`; rhythms: `/day start|end`, `/weekly-review start|end`, `/sweep`, `/spotlight` (read-only board, runs `scripts/spotlight.sh`); events: `/start-issue`, `/complete-issue` (includes the post-mortem), `/new-par`, `/close-par`, `/review-captures`, `/todo-sweep`, `/link-orphans`, `/new-system-element`. Test book: `11 - Projects/second-brain/_0_final/howtos/HOWTO - Test the AI tools.md`.

`.opencode/` and `.claude/` hold `skills`, `commands` and `agents` as dir symlinks to the canonical `99 - Meta/` folders. Keep the six views aligned with `scripts/sync-skills.sh` (`status` / `sync` / `clean`).

Diagrams: `05 - Diagrams/<project>/`, rendered by the Strata plugin (`.obsidian/plugins/strata/`, Pele). Agents check them with `node .obsidian/plugins/strata/strata.mjs check`; rebuild the plugin with `npm run build` in that folder after changing `src/`.

External dependency: the `obsidian` CLI, used by the skills for search, bases and daily notes. Its usage is documented by the globally installed `obsidian-cli` skill (`~/.agents/skills/obsidian-cli/`), available to any project on this machine.

### Skill-file gotcha

SKILL.md frontmatter must strict-parse as YAML. Never put `: ` (colon+space) inside a block-scalar `description:` — frontmatter parsing then fails and OpenCode silently drops the skill from `available_skills` (no warning is shown). Keep descriptions under ~400 characters and colon-free, or single-line. After editing any SKILL.md frontmatter, verify with a fresh headless session: `opencode run --standalone "List the skill names in available_skills"`.
