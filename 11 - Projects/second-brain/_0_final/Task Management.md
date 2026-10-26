---
paras:
  - "[[second-brain]]"
type: "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - MoCs - project-moc|project-moc]]"
rate:
tags:
status: done
maturity: evergreen
created: 2026-10-12 17:05
---
# [[Task Management]]

> [!abstract] Purpose
> - How things to be done are captured, executed and closed in this vault: the issue system end to end.

- The working discipline, from the plan to the clean station — **[[The Mise-en-Place System]]**
- Definition & rules — [[The Issue System]]
- Create
	- `bash .obsidian/personal_scripts/create-issue.sh` — issue creation wrapper (answers the Templater prompt, fills properties)
	- `99 - Meta/Templates/02 - Issues - Template.md` — the Templater template (self-numbering `_I00001 …`)
- Work
	- `08 - Issues/` — active issues, one file each; archive in `08 - Issues/complete/`
	- `dependencies:` — what must resolve first
	- `04 - Bases/final-bases/issues-all.base` · `issues-project.base` — views
	- `#todo` extraction — [[Tag System & Ontology]]
- Workflows — [[The Maintenance System]]
	- [[WORKFLOWS - Start Issue]] · [[WORKFLOWS - Complete Issue]]
	- [[WORKFLOWS - Start Day]] · [[WORKFLOWS - End Day]] · [[WORKFLOWS - Start Week]] · [[WORKFLOWS - End Week]]
- Close
	- Post-mortem at the end of the issue, with the notes-to-create list cleaned to the notes created — `/complete-issue`
	- Project journal — `journal.sh`, the `project-journaling` skill · [[Journal - second-brain]]
- Meetings — [[The Meeting System]]: todos become issues, every meeting is logged in the journal
	- Derived notes: ending note · reusables · tech debt · resources & tools · additional requirements · ideas — [[Postmortem Content]]
- Open threads
	- TODO extraction — the todo sweep of [[WORKFLOWS - End Day]] and [[WORKFLOWS - Complete Issue]] ([[_I00019 add to any workflow clean of todo tags]])
- Principles
	- Think in issues and their tasks — [[This is really a Task]]
	- Spend time on the issue creation — [[RULE - Create notes for the issues]]
	- One small packet at a time — [[TODO list for your daily work]]
	- Free tasks in the day plan for small work with no issue; one that grows becomes an issue at [[WORKFLOWS - End Day]]
- Focus & productivity — **[[Keeping the Focus]]**
	- [[The Archipelago of Ideas]] · [[Dial Down the Scope]] · [[The Hemingway Bridge]]
	- [[Being productive at home - Task Blocks]]
	- Music [[00_pensamientos-1]]
- Post-mortem questions and the ending note — [[Postmortem Content]]
- Decisions history
	- [[How to manage Task management]] — central note first, one note per issue now
	- [[TODO - Final Task management Solution]] — one `.md` with properties, three uses
