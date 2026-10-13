---
file_class: issue
paras:
  - "[[second-brain]]"
  - "[[coding-workplace]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - improvement|improvement]]"
role:
priority: 1
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-14 00:45
dueDate:
dependencies:
---
# [[_I00028 One layout per project, switched with leader hotkeys]]

> [!abstract] Summary
> Moving between projects in Obsidian is slow, and the panes never look the same. Every project gets the same layout, built from its PAR note, and a leader hotkey on the home row opens it in one keystroke.

## Description

- Target UX:
	- `alt+3` goes to the desktop where Obsidian lives.
	- `<leader>+l` then a home-row key (`a`, `s`, `d`, `f`, `;`) opens one project in its layout: `second-brain`, a project X, a resource.
	- `<leader>+l+l` opens the daily note and the weekly note side by side.
	- All projects follow the same layout; only the content comes from the PAR note.
- Pieces that exist:
	- `leader-hotkeys-obsidian` is installed, with no hotkeys (`hotkeys: []`).
	- `workspaces-plus` is installed, with three saved workspaces: `base`, `Clean`, `Working`.
	- `obsidian-advanced-uri` and `obsidian-local-rest-api` can drive the app from a script or a command.
	- PAR notes (for example [[second-brain]]) already hold an Index and the embedded bases of the project.
- Related: [[_I00026 Build an active-projects dashboard in the daily note]] is the other entry point of [[WORKFLOWS - Start Day]].
- Done when the hotkeys open each active PAR and the daily view in the standard layout, and a new PAR gets its slot in one step.

## Tasks

- [ ] Design the standard project layout
  - Panes: PAR note, top `wip` issue, journal, project MoC; which side and which size
  - The daily layout: daily note and weekly note
- [ ] Choose the mechanism
  - `workspaces-plus` with one saved workspace per project, or a script that builds the layout from the PAR note (Advanced URI, local REST API or a Templater user script)
  - A generated layout keeps one definition for all projects
- [ ] Map the keys in `leader-hotkeys-obsidian`
  - `<leader>+l` as the prefix; `a`/`s`/`d`/`f`/`;` to the project slots; `l` again to the daily view
  - Slot per PAR: a property on the PAR note (for example `hotkey: a`, through [[WORKFLOWS - New Properties]]) or a fixed list
- [ ] Command or script to give a new PAR a slot
  - Called from [[WORKFLOWS - New PAR]]; [[WORKFLOWS - End PAR]] frees the slot
- [ ] Check the OS side: `alt+3` lands on the Obsidian desktop
  - Window manager config, outside the vault
- [ ] Update [[WORKFLOWS - Start Day]]: the day opens with `<leader>+l+l`


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