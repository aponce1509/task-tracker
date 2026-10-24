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
> - Solid arrow: starts or loads. Me, the AI agent and the Workflow notes start Commands. Commands start Agents and load Skills. Skills call Scripts.
> - Dashed arrow: shapes. The notes in `_0_final/` define the Skills.
> - Order of authority, from [[The AI Guidance System]]: notes, then skills, agents, commands, scripts. When guidance and a note disagree, the note wins.
> - Each kind node opens its own note. The Command drafts are inbox (only drawn), so this note is wip.

```pele
flowchart LR
  me([Me]) -- follows --> wf[Workflow notes]
  me --> cmd
  ai([AI agent]) --> cmd
  ai --> skills
  ai --> vb[vault-bridge]:::done
  ai --> oc[obsidian-cli]:::done
  wf --> cmd
  drafts[Command drafts]:::inbox --> cmd
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
- The vault has 11 skills in `99 - Meta/skills/`, plus vault-bridge: 12 folders. vault-bridge is the only global skill that lives in the vault. It reaches the vault from code repos with the read-only `vault` MCP (`scripts/vault_mcp.py`).
- obsidian-cli is installed globally, outside the vault (`~/.agents/skills/obsidian-cli/`). The AI agent uses it for search, bases and daily notes.
- Rules: Skills only create notes. An Agent writes only an approved plan. Scripts are the only writers of issues, journals and the taxonomy.
- Notes hold no instructions for the AI agent: those live in Skills, Agents and Commands.
- Command drafts wait in `11 - Projects/second-brain/_0_real_inbox/commands - tmp/`. Skills, Agents and Commands are first versions.
- Children: [[maintenance-elements-ai-skills]], [[maintenance-elements-ai-agents]], [[maintenance-elements-ai-commands]], [[maintenance-elements-ai-scripts]].
