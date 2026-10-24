---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - component|component]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-25 00:00
---
# [[maintenance-elements-ai]]

> [!abstract] AI assets: who calls whom
> - This is the AI assets part of [[maintenance-elements]]: what the AI agent runs for Me, in four kinds: Skills, Agents, Commands and Scripts.
> - Solid arrow: starts or loads. Me, the AI agent and the Workflow notes start Commands. Commands start Agents and load Skills. Agents also load Skills. Skills call Scripts. Commands also call Scripts directly.
> - vault-bridge and obsidian-cli sit apart from Skills because the AI agent loads them directly: vault-bridge for code repos outside the vault, obsidian-cli installed globally.
> - Dashed arrow: shapes. The notes in `_0_final/` define the Skills.
> - Order of authority, from [[The AI Guidance System]]: notes, then skills, agents, commands, scripts. When guidance and a note disagree, the note wins.
> - Each kind node opens its own note and takes its status. Agents and Scripts are done. Skills and Commands are wip, so this note is wip: 8 skill files still have `status: draft`, and the 12 workflow commands are written but have not passed the test book.

```pele
flowchart LR
  me([Me]) -- follows --> wf[Workflow notes]
  me --> cmd
  ai([AI agent]) --> cmd
  ai --> skills
  ai --> vb[vault-bridge]:::done
  ai --> oc[obsidian-cli]:::done
  wf --> cmd
  cmd[Commands] --> agents[Agents]
  cmd --> skills[Skills]
  agents --> skills
  skills --> scripts[Scripts]
  cmd --> scripts
  notes[Notes in _0_final]:::done -.-> skills
  click skills "maintenance-elements-ai-skills"
  click agents "maintenance-elements-ai-agents"
  click cmd "maintenance-elements-ai-commands"
  click scripts "maintenance-elements-ai-scripts"
```

## Details

- Canonical folders: `99 - Meta/skills/`, `99 - Meta/agents/`, `99 - Meta/commands/`. `.claude/` and `.opencode/` hold committed dir symlinks to them, so Claude Code and OpenCode read the same files.
- `scripts/sync-skills.sh` (`status`, `sync`, `clean`) repairs the symlink views.
- Counts: 12 skill folders, 7 agents, 19 commands.
- Commands also start other Commands: `/day` starts `/complete-issue`, `/recall` and `/todo-sweep`; `/sweep` starts `/guide-inbox-clean`. The diagram does not draw this loop.
- `scripts/spotlight.sh` is a read-only board. The `/spotlight` command runs it.
- vault-bridge is the only global skill that lives in the vault. It reaches the vault from code repos with the read-only `vault` MCP (`scripts/vault_mcp.py`).
- obsidian-cli is installed globally, outside the vault (`~/.agents/skills/obsidian-cli/`). The AI agent uses it for search, bases and daily notes.
- Rules: Skills only create notes. An Agent writes only an approved plan. Scripts are the only writers of issues, journals and the taxonomy.
- Notes hold no instructions for the AI agent: those live in Skills, Agents and Commands.
- Limit: the 12 workflow Commands wait for the test book [[HOWTO - Test the AI tools]]. The 7 note Commands are in use.
- Children: [[maintenance-elements-ai-skills]], [[maintenance-elements-ai-agents]], [[maintenance-elements-ai-commands]], [[maintenance-elements-ai-scripts]].
