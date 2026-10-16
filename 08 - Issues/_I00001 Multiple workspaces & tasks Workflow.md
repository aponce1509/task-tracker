---
file_class: issue
paras:
  - "[[coding-workplace]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
priority:
rate:
tags:
created: 2026-05-15 19:06
dueDate:
status:
---
# [[_I00001 Multiple workspaces & tasks Workflow]]

## Description

- Need to analyze our current dotfiles
	- Define the layers
	- Extract the abstractions of the system
- Fix any gaps
- with this we complete [[_I00004 AI Integration in your note system]] create some notes describing your system
- We can use this oportunity to
	- archive non used configs
	- setup for windows
	- runbook for deploying in a new computer
	- [[_I00020 Configure the Obsidian setup scripts with env vars]]
	- think other envs vars and how to set the up in another computer
- go with [[_I00027 Cut the verbosity of the journal and the project AGENTS.md]]

### Layouts

- Terminal (L2): Wezterm + ZSH + Oh My zsh
- Multiplexor (L3): Wezterm
	- One workspace per project with some default workspaces:
		- dotfiles
		- notes
	- Each project should have the following layout
		- Tab 1 herdr attached
		- Tab 2 Lazy git
		- Tab 3 Nvim
		- Tab 4 custom for each project
	- Option of setting keybindings to open/init concrete project (ctrl+?) (at L2 level). We should have one for the 2 base workspaces and for the tmux-sessioner. We can improve how does the directory finder diplay the results
- Herdr (L4):
	- I use this only to have one tab here per agent and not having many many tabs open in the multiplexor.
- Agent Harness (L5):
	- Nothing particular each one have different features. For now we only use opencode and claude code
		- Claude code have keybindings? make similar to the open code setup
- Nvim (L4): this lives also inside the multiplexor
	- Any layout
	- Here the important is the keybinding structure
		- Audit.


#### Apps layers

> [!info]
> The idea is to have the most similar layout in this apps that we have in the multiplexor + herdr + harnsess + nvim. We change from one to another in mac/windows using the desktops
> - In linux we will go with hyperland

- IDE: vscode fork (vscode and devin desktop for now)
	- We won't open this melon now
- Obsidian: [[_I00028 One layout per project, switched with leader hotkeys]]
- Firefox: Nothing to do -> jump to the mouse

## Post-Mortem

- We have added this to the logging?
- Good things:
- Bad Things:
- Notes to created?
	- [[ADRs]]
	- New [[Issues]]: Tech Debts, 
	- [[Implementation Details]]
	- [[Decisions]] or [[Problems & Solutions]]
	- [[Assets]] or [[Knowledge Atoms]]
	- [[Sources]], [[Clippings]]


