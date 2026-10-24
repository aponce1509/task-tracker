---
description: Start a project, area or resource - check it is new, create the PAR note and folder, anchor and brain dump, journal and first issues for a project, and its link
argument-hint: "<name> [project | area | resource]"
---

Create the PAR: $ARGUMENTS

Projects, areas and resources are the pillars of the vault. A new one starts with an anchor, a short brain dump and its first links, so that it does not become clutter.

## Load first

- `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - New PAR.md`. It wins over anything else here.
- The `obsidian-vault-notes` skill, the `note-issue` skill, the `project-journaling` skill.

## Steps

1. New or old. Search `01 - PAR/`, `01 - PAR/archive/` and `01 - PAR/wip_paras/` for the name and close variants. A match → offer to reactivate it (`active: true`) instead of a copy, and stop if I accept.
2. Kind. Take project, area or resource from $ARGUMENTS; ask when it is missing.
3. Anchor. Ask the anchor: the objective (project), the boundaries (area) or the main sources (resource). One question.
4. Create. Make the PAR note through the Obsidian CLI with the PARA Note template, which moves it to `01 - PAR/`: `obsidian create path="01 - PAR/<name>.md" template="09 - PARA Note - Template" silent`. Never write the template by hand. Set `paraType`, and `active: true` when I work on it now. Create the folder `11 - Projects/<name>/`, `12 - Areas/<name>/` or `13 - Resources/<name>/`.
5. Brain dump. Take two minutes of my dump: what I know, my questions, ideas, next steps. Structure it under the description callout. Propose links to existing notes and the loose notes (no `paras`) that belong to the PAR.
6. Project only.
	- Journal: `bash .obsidian/personal_scripts/journal.sh new <name> -d "<objective>"`.
	- First issues: `/create-issue` for each; the next action must exist as an issue.
7. Link it: from its parent area, or from the domain group of `Your main notes` when it holds knowledge. Propose; apply on approval.

## Output

Files created, links proposed and applied, loose notes attached, first issues, the journal path.

## Rules

- Never invent the anchor or the brain dump; only structure them.
- Loose notes get `paras` only after my approval, one list for all.
- With `active: true` the PAR gets a layout slot under `<leader> l`; tell me its key, do not edit the layout config.
