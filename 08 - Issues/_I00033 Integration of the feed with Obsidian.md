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
  - "[[_I00032 Design of the feed]]"
---
# [[_I00033 Integration of the feed with Obsidian]]

> [!abstract]
> - Show the feed items inside Obsidian and feed the triage flow.
> - Without this the feed stays a script output that I never read.

## Description

After the design in [[_I00032 Design of the feed]], the loaded items must reach the vault. Done means I can open a note or a base in Obsidian, see my new bookmarks, and send the useful ones to the inbox or to a concept.

## Tasks

- [ ] Decide how items enter the vault
  - Capture notes in `09 - Inbox` versus a dedicated feed folder
- [ ] Add the metadata and the type for feed items
  - Needs approval if a new subtype is required
- [ ] Add a base to browse the feed
- [ ] Connect the feed with the daily note or the inbox triage
- [ ] Add a command or a script to load and file new items


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