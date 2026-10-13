---
paras:
  - "[[second-brain]]"
type:
subtypes:
rate:
tags:
status:
maturity: capture
created: 2026-05-12 23:15
---
# [[Project Journaling]]

- One journal per project
- dates and timestamps over the comments
- task done and time taken
- convertible to excel

## Later usage

We use the IA then to generate:
-  List of task and time as a Gantt's Diagram

## Implemented (2026-10-13)

- CLI: `.obsidian/personal_scripts/journal.sh` — the only editor of journal files (bulleted Log: `- timestamp: description` + `key::: ` keys, links inline in the description, free lines in any format; debt/product/reflect sections; close → tech debt note + intermediate products + human lines; CSV export for the Excel conversion).
- Skill: `99 - Meta/skills/project-journaling/SKILL.md` — triggers on completions and events (meetings with the meeting note linked, issues completed, milestones), never on every action.
- Note kind: `journal` class + `Project Journal - Template.md` + `note-journal.md` in the vault skill. Live journal: [[Journal - second-brain]].