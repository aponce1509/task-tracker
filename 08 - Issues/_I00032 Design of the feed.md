---
file_class: issue
paras:
  - "[[create-a-feed]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role:
priority: 1
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-18 09:38
dueDate:
dependencies:
---
# [[_I00032 Design of the feed]]

> [!abstract]
> - Design how the feed loads, stores and serves items.
> - The first script in `99 - Meta/scripts/feeds` and its MCP follow this design.

## Description

The first script reads X bookmarks through the API with several load options. The MCP server wraps the same code. Done means a short design note that states the storage, the options, the item shape and how Obsidian reads the result.

## Tasks

- [x] Choose the storage of the loaded items
  - SQLite outside the vault, notes as a rendered view: [[Feed and News Design]]
- [ ] Define the load options
  - Count, since date, pagination token, folder, refresh versus cached
- [ ] Define the output formats
  - JSON, Markdown, one line per item
- [ ] Define the MCP tools on top of the script
- [x] Write the design note in the project folder


## Post-Mortem

- We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
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