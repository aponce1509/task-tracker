---
paras:
  - "[[second-brain]]"
type: "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - MoCs - domain-moc|domain-moc]]"
rate:
tags:
status: wip
maturity: distilled
created: 2026-02-15 20:02
---
# [[The Mise-en-Place System]]

> [!abstract] Everything in its place before the work starts
> - Mise-en-place is the discipline of a chef: prepare the station, cook, clean the station.
> 	- Prepare: work comes from issues split into tasks; the week and the day get a plan at the start and a close at the end.
> 	- Cook: know the mode, divergence or convergence; dump everything into the vault; grow concepts, indexes and MoCs during the work.
> 	- Clean: the workflows tidy what the work touched; the spotlight shows what nobody touched.
> - The kitchen is the Obsidian workplace: layouts, keys and dashboards.

> [!info] Why a chef
> - A chef does not look for the knife during the service. The tools, the ingredients and the order are ready before the first plate.
> - The same discipline frees the head for the work: the plan, the next action and the notes the work needs are already in front of me.

## Prepare the station

Work starts from an issue ([[The Issue System]]). [[WORKFLOWS - Start Issue]] splits the issue into tasks of less than thirty minutes and lists the notes the work needs. Think in issues and their tasks ([[This is really a Task]]), and spend time on the creation of the issue ([[RULE - Create notes for the issues]]). [[Task Management]] maps the full cycle of an issue.

The week and the day get a plan from those tasks. [[WORKFLOWS - Start Week]] picks one focus and a short backlog. [[WORKFLOWS - Start Day]] crosses the bridges of yesterday and writes three to five tasks in `## Plan` of the daily note, with the candidates of the `task-planner` skill. One small packet at a time: [[TODO list for your daily work]]. For work at home, block the time first: [[Being productive at home - Task Blocks]].

Free tasks are allowed in the plan: small work that needs no issue. A free task that grows into real work becomes an issue at [[WORKFLOWS - End Day]].

The day and the week also close. [[WORKFLOWS - End Day]] logs the day, sweeps the flags of the notes I touched and writes the bridge for tomorrow ([[The Hemingway Bridge]]). [[WORKFLOWS - End Week]] is the weekly spotlight. The Today dashboard holds the day and the week board holds the week ([[The Workplace System]]).

## Cook

Each piece of work has a mode ([[Convergence and Divergence]]). Divergence opens: explore, gather, follow the links, accept chaos. Convergence closes: one task, one outcome. [[WORKFLOWS - Start Issue]] is the switch to convergence, and [[Keeping the Focus]] keeps it on: [[The Archipelago of Ideas]] to start, [[Dial Down the Scope]] to finish, [[The Hemingway Bridge]] to resume.

The second brain is the dump. Nothing stays in the head: an idea, a todo or a question goes into the vault at once, and the task goes on. The daily note takes what comes up while I work; the phone shares land in `06 - Inputs/Captures/` ([[HOWTO - Capture from the phone]]). A line that needs action later carries a flag, `#todo` or `#rfm` ([[Tag System & Ontology]]). [[The CODE system]] moves the dump later: capture now, organise and distill when a use comes.

Concepts are the atoms of the knowledge ([[The Concept System]]). What I learn during the work becomes a concept note, linked from `## Learned` of the daily note, and `/recall` fixes it.

Indexes and MoCs are the molecules ([[The Index and MoC System]]). They grow during the work, not after it: a new concept enters an index or a MoC at once, so no orphan is born. When an issue closes, the notes that build the final product are gathered in its ending note ([[Postmortem Content]], [[Intermediate and Final Products]]).

- Divergence has no workflow yet: how to open an exploration phase and when to close it. #todo
- Only the Learning Session and the post-mortem ask for indexes and MoCs; normal issue work does not ask for them yet. #todo

## Clean the station

Cleaning is part of the service, not a separate chore ([[The Maintenance System]]). [[WORKFLOWS - Complete Issue]] closes an issue with its post-mortem, the spin-off issues and the journal entry. [[WORKFLOWS - End Day]] sweeps the `#todo` flags of the notes the day touched. The spotlight board shows what rots where nobody walks, and [[WORKFLOWS - Bi-Monthly Inbox Sweep]] is the safety net for it. The captures queue empties the phone dump in batches.

## The kitchen

[[The Workplace System]] turns Obsidian into a keyboard-driven station:

- Base layout (`<leader> l l`): the Today dashboard, the week board and the spotlight as tabs, the daily note and the weekly note beside them.
- Project layout (`<leader> l` and a slot key): the working notes of the project, its project dashboard and the daily note.
- The `bridge` property of each PAR note holds its next concrete action, and the dashboards show it.
- The captures queue (`<leader> c`) shows the phone captures one by one.
- Keys, layouts and panels live in `99 - Meta/mise-en-place.jsonc`.

The terminal and code side of the station lives in [[coding-workplace]].

## Related

- [[The Second Brain System]]
- [[Task Management]]
- [[Keeping the Focus]]
- [[The Maintenance System]]
- [[The Workplace System]]
