---
paras:
  - "[[skills-system]]"
type: "[[Indexes]]"
subtypes:
  - "[[Navigation & Meta - Indexes - topic-index|topic-index]]"
rate:
tags:
status: wip
maturity: capture
created: 2026-10-20 12:30
---
# [[AI Tooling Inventory]]

> [!abstract] Which agent tools do I have, for which job, and where is their source?
> - Every skill, plugin, rule, command, agent and MCP server, grouped by purpose.
> - Each entry: purpose, source repo, plugin it ships in, docs when they exist.
> - Input for [[_I00022 Decide how skills and commands are stored across my systems]]; the plugin architecture comes in [[_I00037 Write the architecture notes of the dotfiles and second-brain systems]].

## Key

- `plugin`: a package of the other kinds
- `skill`: instructions loaded on demand
- `rule`: always-loaded instructions (AGENTS.md)
- `command`: slash command
- `agent`: subagent
- `mcp`: MCP server

## Plugins

- second-brain `plugin` (planned)
	- Purpose: the vault assets in the standard plugin format
	- Source: [aponce1509/task-tracker](https://github.com/aponce1509/task-tracker)
	- Issue: [[_I00036 Package the second brain as a plugin]]
	- Holds: the vault rule, skills, commands, agents and the vault MCP below
- dotfiles `plugin` (planned)
	- Purpose: my personal skills, installed into every harness from one harness list
	- Source: [aponce1509/.dotfiles](https://github.com/aponce1509/.dotfiles)
	- Issue: [[_I00034 Package the dotfiles personal skills as a plugin with a harness list]]
	- Holds: vault-bridge, after [[_I00035 Move vault-bridge to the dotfiles repo]]
- frontend-design `plugin`
	- Purpose: visual design direction for new UI
	- Source: [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design)
- pyright-lsp `plugin`
	- Purpose: Python type checking and navigation through the Pyright language server
	- Source: [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)

## Vault rules

- AGENTS.md `rule`
	- Purpose: how any agent works in the vault; points to the skills, agents and commands
	- Source: [task-tracker/AGENTS.md](https://github.com/aponce1509/task-tracker/blob/main/AGENTS.md)
	- Plugin: second-brain

## Vault notes

- obsidian-vault-notes `skill`
	- Purpose: router and shared rules for every note (metadata, style, journals)
	- Source: [task-tracker/99 - Meta/skills/obsidian-vault-notes](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/obsidian-vault-notes)
	- Plugin: second-brain
- markdown-editing `skill`
	- Purpose: minimal Markdown style
	- Source: [task-tracker/99 - Meta/skills/markdown-editing](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/markdown-editing)
	- Plugin: second-brain
- Issues
	- note-issue `skill`
		- Purpose: create an issue through create-issue.sh and write its body
		- Source: [task-tracker/99 - Meta/skills/note-issue](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/note-issue)
		- Plugin: second-brain
	- /create-issue `command`
		- Purpose: create an issue with enough context to follow it later
		- Source: [task-tracker/99 - Meta/commands/create-issue.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/commands/create-issue.md)
		- Plugin: second-brain
	- /postmortem `command`
		- Purpose: guided post-mortem of an issue
		- Source: [task-tracker/99 - Meta/commands/postmortem.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/commands/postmortem.md)
		- Plugin: second-brain
- Meetings
	- note-meeting `skill`
		- Purpose: create and parse meeting notes
		- Source: [task-tracker/99 - Meta/skills/note-meeting](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/note-meeting)
		- Plugin: second-brain
	- /parse-meeting `command`
		- Purpose: raw meeting into take-aways, callouts, issues and a journal entry
		- Source: [task-tracker/99 - Meta/commands/parse-meeting.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/commands/parse-meeting.md)
		- Plugin: second-brain
	- meeting-extractor `agent`
		- Purpose: parse a meeting dump into a summary and draft issues
		- Source: [task-tracker/99 - Meta/agents/meeting-extractor.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/agents/meeting-extractor.md)
		- Plugin: second-brain
- Concepts and learning
	- note-concept `skill`
		- Purpose: create concept notes from a creation graph
		- Source: [task-tracker/99 - Meta/skills/note-concept](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/note-concept)
		- Plugin: second-brain
	- /new-concept `command`
		- Purpose: concepts from a topic or a source, linked into indexes and the daily note
		- Source: [task-tracker/99 - Meta/commands/new-concept.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/commands/new-concept.md)
		- Plugin: second-brain
	- concept-distiller `agent`
		- Purpose: write one concept note from an approved graph
		- Source: [task-tracker/99 - Meta/agents/concept-distiller.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/agents/concept-distiller.md)
		- Plugin: second-brain
	- /recall `command`
		- Purpose: recall session on the concepts of the day or week
		- Source: [task-tracker/99 - Meta/commands/recall.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/commands/recall.md)
		- Plugin: second-brain
- Navigation
	- note-index-moc `skill`
		- Purpose: create indexes and MoCs and do the linking
		- Source: [task-tracker/99 - Meta/skills/note-index-moc](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/note-index-moc)
		- Plugin: second-brain
	- navigation-curator `agent`
		- Purpose: create or extend indexes and MoCs, find unlinked concepts
		- Source: [task-tracker/99 - Meta/agents/navigation-curator.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/agents/navigation-curator.md)
		- Plugin: second-brain
- Distillation and inbox
	- /guide-distillation `command`
		- Purpose: distil one note by its kind up to maturity distilled
		- Source: [task-tracker/99 - Meta/commands/guide-distillation.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/commands/guide-distillation.md)
		- Plugin: second-brain
	- /guide-inbox-clean `command`
		- Purpose: clean a batch of inbox notes
		- Source: [task-tracker/99 - Meta/commands/guide-inbox-clean.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/commands/guide-inbox-clean.md)
		- Plugin: second-brain
	- inbox-triager `agent`
		- Purpose: propose metadata, fixes, issues and destination per inbox note
		- Source: [task-tracker/99 - Meta/agents/inbox-triager.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/agents/inbox-triager.md)
		- Plugin: second-brain
- Journals
	- project-journaling `skill`
		- Purpose: log done issues, meetings and milestones through journal.sh
		- Source: [task-tracker/99 - Meta/skills/project-journaling](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/project-journaling)
		- Plugin: second-brain

## Vault system and planning

- system-reference-maintance `skill`
	- Purpose: audit that taxonomy, properties, tags and bases match their references
	- Source: [task-tracker/99 - Meta/skills/system-reference-maintance](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/system-reference-maintance)
	- Plugin: second-brain
- vault-auditor `agent`
	- Purpose: run the audits and explain the drift with the fix
	- Source: [task-tracker/99 - Meta/agents/vault-auditor.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/agents/vault-auditor.md)
	- Plugin: second-brain
- task-planner `skill`
	- Purpose: what to do next, as an ordered tree of open issues
	- Source: [task-tracker/99 - Meta/skills/task-planner](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/task-planner)
	- Plugin: second-brain

## Vault access from other repos

- vault-bridge `skill`
	- Purpose: read issues and PAR notes from another repo, write back only through the vault scripts
	- Source: [task-tracker/99 - Meta/skills/vault-bridge](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/vault-bridge)
	- Plugin: dotfiles, after [[_I00035 Move vault-bridge to the dotfiles repo]]
- vault `mcp`
	- Purpose: read-only access to PAR notes and issues
	- Source: [task-tracker/scripts/vault_mcp.py](https://github.com/aponce1509/task-tracker/blob/main/scripts/vault_mcp.py)
	- Plugin: second-brain

## Obsidian

- obsidian-cli `skill`
	- Purpose: search, bases, daily notes and properties through the obsidian CLI
	- Source: [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills/tree/main/skills/obsidian-cli)
- obsidian-markdown `skill`
	- Purpose: Obsidian flavored Markdown (wikilinks, embeds, callouts)
	- Source: [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills/tree/main/skills/obsidian-markdown)
- obsidian-bases `skill`
	- Purpose: .base files with views, filters and formulas
	- Source: [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills/tree/main/skills/obsidian-bases)
- json-canvas `skill`
	- Purpose: .canvas files
	- Source: [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills/tree/main/skills/json-canvas)

## Feeds

- feeds `mcp`
	- Purpose: read-only X bookmarks, live or from the local cache
	- Source: [task-tracker/99 - Meta/scripts/feeds/feeds_mcp.py](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/scripts/feeds/feeds_mcp.py)

## Work boards and agent orchestration

- herdr-projects `skill`
	- Purpose: read and change the tasks of the herdr work board
	- Source: installed by herdr-projects (~/.herdr-projects), repo to find
- orca-cli `skill`
	- Purpose: Orca worktrees, terminals, automations and embedded browser
	- Source: [stablyai/orca](https://github.com/stablyai/orca/tree/main/skills/orca-cli)
- computer-use `skill`
	- Purpose: drive a visible local app window through orca computer
	- Source: [stablyai/orca](https://github.com/stablyai/orca/tree/main/skills/computer-use)
- find-skills `skill`
	- Purpose: find and install agent skills
	- Source: [vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)

## Diagrams and design

- note-diagram `skill`
	- Purpose: diagram notes in C4 levels, orchestrates the writer and the reviewer
	- Source: [task-tracker/99 - Meta/skills/note-diagram](https://github.com/aponce1509/task-tracker/tree/main/99%20-%20Meta/skills/note-diagram)
	- Plugin: second-brain
- diagram-writer `agent`
	- Purpose: write one diagram note from a brief with the whole context
	- Source: [task-tracker/99 - Meta/agents/diagram-writer.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/agents/diagram-writer.md)
	- Plugin: second-brain
- diagram-reviewer `agent`
	- Purpose: read a diagram tree cold for understandability and coherence
	- Source: [task-tracker/99 - Meta/agents/diagram-reviewer.md](https://github.com/aponce1509/task-tracker/blob/main/99%20-%20Meta/agents/diagram-reviewer.md)
	- Plugin: second-brain
- archify `skill`
	- Purpose: architecture, flow, state and timeline diagrams as standalone HTML
	- Source: [tt-a1i/archify](https://github.com/tt-a1i/archify)
- frontend-design `plugin`
	- Purpose: see Plugins

## Given by Claude

- Source: claude.ai account, synced into Claude Code (anthropic-skills)
- Documents
	- docs `skill`
		- Purpose: editable Claude Docs to share and comment on
	- docx `skill`
		- Purpose: Word documents
		- Source: [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/docx)
	- pdf `skill`
		- Purpose: read, merge, fill and create PDFs
		- Source: [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pdf)
	- pptx `skill`
		- Purpose: PowerPoint decks
		- Source: [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pptx)
	- xlsx `skill`
		- Purpose: spreadsheets
		- Source: [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/xlsx)
	- google-workspace `skill`
		- Purpose: create or change Google Docs, Sheets and Slides
- Research and browsing
	- deep-research `skill`
		- Purpose: multi-source research into a narrative report
	- built-in-browser `skill`
		- Purpose: the browser pane of the Claude desktop app
	- chrome-browser `skill`
		- Purpose: Claude in Chrome, my real browser
	- computer-use `skill`
		- Purpose: desktop control through the Claude desktop app
- Skills
	- skill-creator `skill`
		- Purpose: create, test and improve skills
		- Source: [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
- Other
	- platform-architecture `skill`
		- Purpose: workspace architecture and stack rules
	- import-memory `skill`
		- Purpose: import memory from another assistant
	- morning `skill`
		- Purpose: the morning brief
