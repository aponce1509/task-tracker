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
# [[_I00031 List of feeds to support]]

> [!abstract]
> - List the feeds the system must support, starting with the X bookmarks.
> - The list sets the scope of the script options and the MCP tools.

## Description

Bookmarks are the first feed. Other sources can come later (X likes, X lists, RSS, newsletters, YouTube). Done means a short list with, per feed, the source, the access method, the fields I need and a priority.

## Tasks

- [ ] List the candidate feeds
  - X bookmarks, likes, lists, a user timeline
  - RSS and newsletters
- [ ] For each feed note the access method and its limits
- [ ] Mark the first release scope
  - X bookmarks only
- [ ] Define the common item shape
  - Id, source, author, text, url, created date, links


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