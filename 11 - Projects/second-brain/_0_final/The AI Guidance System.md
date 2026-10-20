---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status: wip
maturity: distilled
created: 2026-10-13 23:25
---
# [[The AI Guidance System]]

> [!abstract] Notes define, guidance applies
> - The notes in `_0_final/` are the source of truth: they say what each thing is and how I want it.
> - Skills, agents and commands are the AI guidance: they hold the writing rules, the guardrails and the procedures that apply the notes.
> - Scripts do the mechanical part.
> - When guidance and a note disagree, the note wins and the guidance is fixed.

> [!warning] First versions
> Skills, agents and commands are first versions, not tuned on real use yet.

## Hierarchy

| Layer | Answers | Scope | Lives in |
| --- | --- | --- | --- |
| Notes | What is it, how do I want it | The system | `11 - Projects/second-brain/_0_final/` |
| `AGENTS.md` | Where to start, what to read | The repo | root `AGENTS.md` |
| Skills | How to write one note of one kind | One note | `99 - Meta/skills/<name>/SKILL.md` |
| Agents | How a sub-model does work on many notes | Many notes | `99 - Meta/agents/<name>.md` |
| Commands | What sequence to run when I ask | One request | `99 - Meta/commands/<name>.md` |
| Scripts | Deterministic mechanics | Files | `.obsidian/personal_scripts/`, `<skill>/scripts/` |

- Notes contain no instructions for agents. Rules like "ask the user", "never write X" or "stop and wait" live only in skills, agents or commands.
- A skill points to its note and never copies the definitions in it. It adds only what an agent needs to apply them: the steps, the checks and the guardrails.
- Skills only create notes. Maintenance across many notes belongs to agents.
- An agent gets instructions (the skill of the kind) and context (content and format). It writes only an approved plan; without one it is read-only and returns proposals.
- A command is the entry point for me. It orchestrates skills and agents and asks me when context is missing.
- Scripts: one script per note kind when the kind needs one. Bash and the `obsidian` CLI first, for performance; Python only when bash is really not enough.

## Skills

| Skill | Role | Spec note |
| --- | --- | --- |
| `obsidian-vault-notes` | Router and shared rules: properties, taxonomy, tags, writing style, any note without its own kind | [[The Metadata system]] · [[How I Like My Notes]] |
| `note-issue` | Create an issue | [[The Issue System]] |
| `note-meeting` | Create or parse a meeting note, its issues and its journal entry | [[The Meeting System]] |
| `note-concept` | Create concepts from the creation graph | [[The Concept System]] |
| `note-index-moc` | Create indexes and MoCs and do the linking | [[The Index and MoC System]] |
| `markdown-editing` | Minimal Markdown | [[How I Like My Notes]] |
| `project-journaling` | Journal entries through `journal.sh` | [[Journal - second-brain]] |
| `system-reference-maintance` | Audit of the engines | [[System Maintenance & Review]] |
| `task-planner` | What to do next | [[Task Management]] |
| `vault-bridge` | Reach the vault from a code repo outside it: read issues and PAR notes, write back through the scripts | [[The Issue System]] · [[Task Management]] |

## Agents

| Agent | Work | Writes |
| --- | --- | --- |
| `meeting-extractor` | Parses a raw meeting: take-aways, callouts, todos as draft issues | The meeting note, after approval |
| `concept-distiller` | Writes the concepts of an approved creation graph | Concept notes |
| `navigation-curator` | Creates or extends indexes and MoCs; finds orphan concepts | Index and MoC notes, after approval |
| `inbox-triager` | Reviews a batch of inbox notes: metadata, format, place, issues | Nothing, it proposes |
| `vault-auditor` | Runs the audit scripts and the guidance checks, explains the drift | Nothing |

## Commands

| Command | Runs |
| --- | --- |
| `/create-issue` | `note-issue` |
| `/parse-meeting` | `note-meeting`, `meeting-extractor`, `note-issue`, `project-journaling` |
| `/new-concept` | `note-concept`, `concept-distiller`, `navigation-curator` |
| `/guide-distillation` | `obsidian-vault-notes` and the skill of the note kind |
| `/guide-inbox-clean` | `inbox-triager`, then the skills of the kinds, `note-issue` |
| `/recall` | Recall of the day's or week's concepts: questions, extensions, open questions (`#rfm`), topics to read, facts to memorize (`#learnable`) |
| `/postmortem` | The post-mortem of an issue |

The workflows in `_0_final/workflows/` run these commands; [[The Maintenance System]] maps them. Command drafts for the workflows without one wait in `_0_real_inbox/commands - tmp/`.

## Distribution

- The canonical folders are `99 - Meta/skills/`, `99 - Meta/agents/` and `99 - Meta/commands/`.
- `.claude/` and `.opencode/` hold committed symlinks to them, so every harness reads the same files.
- `scripts/sync-skills.sh` repairs the views (`status` / `sync` / `clean`).
- `vault-bridge` is the only global skill: `~/.agents/skills/vault-bridge` links to the canonical folder and `~/.claude/skills/vault-bridge` links to that link. Code repos stay without vault notes.
- `scripts/vault_mcp.py` is a read-only MCP server (`vault`) over the PAR notes and the issues. It is registered at user level in Claude Code (`claude mcp add -s user`) and in `~/.config/opencode/opencode.json`, so every project sees it.

## Audit of the guidance

These checks are done by the `vault-auditor` agent, never by a script:

- Every note kind has a skill, and the skill name matches the kind.
- Skill, agent and command frontmatter parses as strict YAML; the `description` has no colon followed by a space.
- Skills, agents and commands reference only paths, scripts and skills that exist.
- Every skill, agent and command exists in the canonical folder and in all the harness views.

## Open

- Creation scripts for meetings and concepts, same pattern as `create-issue.sh`, if the agents prove slow.

## Related

- [[The Note Kinds]] — the notes that this guidance applies
- [[How I Like My Notes]] — the look that the writing rules enforce
- [[System Maintenance & Review]] — the audit loops
