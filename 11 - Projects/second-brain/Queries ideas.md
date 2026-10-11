---
paras:
  - "[[second-brain]]"
type:
subtypes:
rate:
tags:
status:
maturity:
created: 2026-05-16 18:35
---
# [[Queries ideas]]

> [!caution] Some ideas to track 
> - `_review` is important to postmortems & sprint review
> - `_wip` are notes current active and are present in the daily & weekly notes
> - No nos olvidemos de adr/etc
> - Issues: la view del projecto -> por priority.

Queries Ideas
		- General
			- Project Ideas (by para)
			- Tools by para
			- A bases for all the projects with fotos
		- PARA Index
			- WIP notes
			- TODOS: 
			- [[Postmortem Content]]:
		- Daily
			- `#_urgent`
			- `#_todo` by project

- General (we use them directly from the base file)
	- References bases: independent bases with the same views: group by para and different views for to consume, completed abandoned + a view with all grouped by status 
		- Books
		- Films
		- Shows
		- Bookmarks, tools, Documentation
		- Articles, papers
	- Learnings:
		- We use the tags to determine learnings things. Abandoned things have the `#_to_learn` + `#_abandoned`
- Daily notes:
	- None
- Weekly Notes
	- Active Projects by paraType
		- Other view with all the projects by paraType
	- Issues by project
		- It would be nice to have 
			- the urgents and due dates in this week an the next at top
			- the issues of active projects that are not urgent or with due date in this week or the next
			- Completed this week
		- but we keep the this simple. Completed are written by hand in the weekly note. Maybe just split between urgents and others issued filter by complete
- Postmortem: 
	- Definition
		- Look for incomplete Issues, Tech Debts, Bugs and todos. Document this list when retaking the project.
		- Write a final MoC with the core concepts and elements of your solution. It's important to know the intermediate products. This note will be used mostly just for looking reusable content.
		- Rate your performance/satisfaction in the `rate:` frontmatter (1-3 stars).
		- Write exactly **one** sentence on what went well, and **one** sentence on what could be improved.
	- Proposed queries
		- Uncompleted things
		- Notes that build the solution
		- Intermediate Product 
		- External Resources (by tag)
		- Other notes
- PARAS (this note is the index for a Project/Area/Resource we want all the notes visible here in a way that the grouping that make sense using different views. Core elements, conpepts, bookmarks & tooks, Others)
	- Postmortem + ?
## Queries needed postmortem

By tag:
- `#_intermediate` -> Reusable things
- `#_core` & `#_milestones` -> Use for building the final index
- `#_todo`, `#_wip`, `#_tech_debt`, `#_urgent`, `#_to_review`, `#_to_implement`, `#_bug` -> Issues & incomplete things must be collected in a place
- `#_evergreen` & `#_distilled` -> Developed Ideas through the project
- Other tags

By types:
- Issues: grouped by tags
- Problems, Solutions & Decisions
- Concepts:

## Draft

- Base: Issues Dashboard
  - View: Active Kanban / Sprint
    - Filter: type = [[Issue]], complete = false, tags contains `#_wip`
    - Group by: priority
    - Sort: dueDate ascending
    - Used in: PARAS Index, Daily Journal Template
  - View: Blocked Desk
    - Filter: type = [[Issue]], complete = false, tags contains `#_blocked`
    - Group by: priority
    - Sort: dueDate ascending
    - Used in: PARAS Index
  - View: Backlog
    - Filter: type = [[Issue]], complete = false, tags contains `#_todo`, tags does not contain `#_wip`, tags does not contain `#_blocked`
    - Group by: tags (by sub-issue tag like `#bug, #task`)
    - Sort: priority ascending, created descending
    - Used in: Standalone
  - View: Post-Mortem / Completed
    - Filter: type = [[Issue]], complete = true, paras contains current-file-link
    - Group by: tags
    - Sort: dueDate descending
    - Used in: Post-mortem template

- Base: PARAS Manager
  - View: Active Projects
    - Filter: paraType = "Project", active = true, archive = false
    - Group by: none
    - Sort: created ascending
    - Used in: PARAS Index
  - View: Areas of Responsibility
    - Filter: paraType = "Area", archive = false
    - Group by: none
    - Sort: file.name ascending
    - Used in: PARAS Index
  - View: Resource Hub
    - Filter: paraType = "Resource", archive = false
    - Group by: tags
    - Sort: file.name ascending
    - Used in: PARAS Index
  - View: Archived Vault
    - Filter: archive = true
    - Group by: paraType
    - Sort: file.name ascending
    - Used in: PARAS Index

- Base: Knowledge Graph (PKM)
  - View: Evergreen Concepts
    - Filter: type = [[Concepts]] or type = [[HowTos]], tags contains `#_evergreen`
    - Group by: type
    - Sort: file.name ascending
    - Used in: Standalone, Main Map of Content (MoC)
  - View: Knowledge Sandbox (Under Review)
    - Filter: tags contains `#_review or tags contains #_wip, type = [[Concept]] or type = [[Researches]] or type = [[Thoughts]]`
    - Group by: type
    - Sort: created descending
    - Used in: Standalone
  - View: Reusable Solutions & Patterns
    - Filter: tags contains `#_pattern` or type = [[Solutions]]
    - Group by: tags
    - Sort: file.name ascending
    - Used in: Standalone

- Base: System Architecture & Normative Context
  - View: Engineering Standards & Decisions
    - Filter: type = [[Decisions]] or type = [[Standards]] or type = [[Architectures]]
    - Group by: type
    - Sort: file.name ascending
    - Used in: Main Map of Content (MoC)
  - View: Technical Debt & System Risks
    - Filter: tags contaIns `#_debt or tags contains #layer-legacy or tags contains #risks`
    - Group by: priority
    - Sort: created ascending
    - Used in: Standalone

- Base: Media & Consumption Pipeline
  - View: Reading & Watching Inbox
    - Filter: type = [[Medias]] or type = [[Resources]], tags contains `#_to_consume`
    - `Group by: tags (e.g., #books, #podcasts)`
    - Sort: created ascending
    - Used in: Standalone
  - View: Active Learning Paths
    - Filter: tags contains `#_learning or tags contains #_to_learn`
    - Group by: tags
    - Sort: file.name ascending
    - Used in: Standalone

- Base: Processing Inbox (System Cleanliness)
  - View: Raw Captures
    - `Filter: tags contains #_inbox or tags contains #_capture, complete != true`
    - Group by: type
    - Sort: created ascending
    - Used in: Daily Journal Template, PARAS Index

## Draft Claude

- PARA Dashboard (par notes)
  - Base: file is par type
    - Filter: type = par
    - Views:
      - Active Projects
        - Filter: paraType = Project AND active = true AND archive = false
        - Sort: created desc
        - Group by: none
      - All Projects
        - Filter: paraType = Project AND archive = false
        - Sort: created desc
      - Areas
        - Filter: paraType = Area AND archive = false
        - Sort: name asc
      - Resources (PARA)
        - Filter: paraType = Resource AND archive = false
        - Sort: name asc
      - Open Questions
        - Filter: paraType = Question AND archive = false
        - Sort: created desc
      - Archived
        - Filter: archive = true
        - Sort: created desc
        - Group by: paraType
    - Used in: PARAS Index

- Issue Tracker (issue notes)
  - Base: file is issue type
    - Filter: type = issue AND complete = false
    - Views:
      - Active Issues (Kanban-style list)
        - Filter: complete = false
        - Sort: priority asc, dueDate asc
        - Group by: priority
      - Blocked
        - Filter: complete = false AND tags contains _blocked
        - Sort: priority asc
      - Urgent
        - Filter: complete = false AND tags contains _urgent
        - Sort: dueDate asc
      - By PARA
        - Filter: complete = false
        - Group by: paras
        - Sort: priority asc
      - Completed (log)
        - Filter: complete = true
        - Sort: created desc
    - Used in: PARAS Index, each active Project note

- Inbox & Triage
  - Base: any note tagged _inbox or _capture with no further lifecycle tag
    - Filter: tags contains _inbox OR (tags contains _capture AND tags does not contain _distilled AND tags does not contain _evergreen)
    - Views:
      - Full Inbox
        - Filter: tags contains _inbox
        - Sort: created asc (oldest first)
        - Group by: type
      - Capture Queue (not yet distilled)
        - Filter: tags contains _capture AND tags does not contain _distilled
        - Sort: created asc
        - Group by: type
      - Todo Flags
        - Filter: tags contains _todo
        - Sort: created asc
    - Used in: PARAS Index (as daily triage entry point)

- Knowledge Curation
  - Base: Knowledge-class notes (Concepts, Researches, Thoughts, Patterns)
    - Filter: type in [concept, research, thought]
    - Views:
      - Evergreen
        - Filter: tags contains _evergreen
        - Sort: rate desc, name asc
        - Group by: type
      - In Progress (WIP/Distilled)
        - Filter: tags contains _wip OR (tags contains _distilled AND tags does not contain _evergreen)
        - Sort: created desc
        - Group by: type
      - Review Queue
        - Filter: tags contains _review
        - Sort: created asc
      - Top Rated
        - Filter: rate >= 4
        - Sort: rate desc
        - Group by: type
    - Used in: PARAS Index, MoC notes

- Media Tracker (media notes)
  - Base: file is media type
    - Filter: type = media
    - Views:
      - To Consume
        - Filter: tags contains _to_consume
        - Group by: tags (books / films / podcasts / videos)
        - Sort: created asc
      - In Progress
        - Filter: tags contains _learning OR tags contains _wip
        - Sort: created desc
      - Completed
        - Filter: tags contains _completed
        - Sort: rate desc
        - Group by: tags (subtype)
      - Abandoned
        - Filter: tags contains _abandoned
        - Sort: created desc
      - Top Rated
        - Filter: tags contains _completed AND rate >= 4
        - Sort: rate desc
    - Used in: PARAS Index

- Standards & Evergreen Ops (normative + operational reusable notes)
  - Base: HowTos, Standards, Solutions, Decisions
    - Filter: type in [howto, standard, solution, decision]
    - Views:
      - Core Reference
        - Filter: tags contains _core OR tags contains _evergreen
        - Sort: name asc
        - Group by: type
      - Patterns
        - Filter: tags contains _pattern
        - Sort: name asc
        - Group by: type
      - Pending Review
        - Filter: tags contains _review
        - Sort: created asc
    - Used in: PARAS Index, project notes

- Architecture & Descriptive Notes
  - Base: Architectures, Project Contexts
    - Filter: type in [architecture, project-context]
    - Views:
      - System Map (core/evergreen)
        - Filter: tags contains _core OR tags contains _evergreen
        - Sort: name asc
        - Group by: type
      - Active / WIP
        - Filter: tags contains _wip
        - Sort: created desc
      - Technical Debt
        - Filter: tags contains _debt OR tags contains _technical-debt
        - Sort: created asc
    - Used in: project notes, Architecture MoC

- Learning Tracker (Syllabus + Resources with learning tags)
  - Base: Syllabus type + any note with _to_learn / _learning / _learned
    - Filter: type = syllabus OR tags contains _to_learn OR tags contains _learning OR tags contains _learned
    - Views:
      - To Learn
        - Filter: tags contains _to_learn
        - Sort: rate desc, created asc
        - Group by: paras
      - Currently Learning
        - Filter: tags contains _learning
        - Sort: created asc
      - Learned
        - Filter: tags contains _learned
        - Sort: rate desc
      - Abandoned
        - Filter: tags contains _abandoned AND (type = syllabus OR tags contains _to_learn)
        - Sort: created desc
    - Used in: PARAS Index

- Meetings Log (meeting notes)
  - Base: file is meeting type
    - Filter: type = meeting
    - Views:
      - Recent (all meetings)
        - Sort: created desc
        - Group by: tags (sync / planning / retrospective / 1on1)
      - Review Needed
        - Filter: tags contains _review
        - Sort: created asc
      - By PARA
        - Group by: paras
        - Sort: created desc
    - Used in: active Project notes

- Daily Journal (journal notes)
  - Base: file is journal type
    - Filter: type = journal
    - Views:
      - Recent Entries
        - Filter: tags contains _daily
        - Sort: created desc
      - Reflections
        - Filter: tags contains _reflection
        - Sort: created desc
      - Scratchpad / Brain Dumps
        - Filter: tags contains _scratchpad OR tags contains _brain-dump
        - Sort: created desc
    - Used in: standalone (personal dashboard)

- Full Note Index (meta / navigation)
  - Base: all notes
    - Filter: none (universe view)
    - Views:
      - By Type
        - Group by: type
        - Sort: created desc
      - By PARA
        - Group by: paras
        - Sort: name asc
      - Orphans (no PARA assigned)
        - Filter: paras is empty AND type not in [index, moc, journal]
        - Sort: created asc
      - Recently Modified
        - Sort: modified desc
        - Limit: 50
    - Used in: PARAS Index