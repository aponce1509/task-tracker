---
file_class: journal
paras:
  - "[[second-brain]]"
type: "[[Journals]]"
subtypes:
  - "[[Logging - Journals - project-log|project-log]]"
rate:
tags:
status: wip
maturity: capture
description: "Build journal of the second brain project: completed tasks with time taken, meetings, milestones, intermediate products and tech debt; comments and good/bad things per entry. Excel-ready via journal.sh export."
created: 2026-10-13 10:17
---
# [[Journal - second-brain]]

Build journal of the second brain project: completed tasks with time taken, meetings, milestones, intermediate products and tech debt; comments and good/bad things per entry. Excel-ready via journal.sh export.

> [!important] Editing rules
> Edited only through `.obsidian/personal_scripts/journal.sh` (run inside the
> vault). Log entries are append-only; attach a link to an entry already
> logged with `journal.sh link`. Hand edits are safe only under
> [[#How it went]] - never touch the Log by hand: it is what converts to
> Excel.

## Log

%% one bullet per event: - YYYY-MM-DD HH:mm: description (wikilinks inline in the description, never as their own key) %%
%% keys as nested bullets: - kind::: done|meeting|milestone|note|product, - dur::: minutes, - good:::, - bad:::, - comment::: %%
%% extra lines in any format may follow the keys (keep the indent) %%
- 2026-10-13 10:17: Logbook opened for the second brain build. Purpose: performance tracking and logbook — completed tasks with time taken, meetings with their note linked, milestones, intermediate products and tech debt; every entry may carry comments and good/bad things. Entries are appended only through .obsidian/personal_scripts/journal.sh; links live inline in the description as wikilinks; the Log exports to Excel with journal.sh export.
  - kind::: note
- 2026-10-13 10:17: Project journaling system in place: journal.sh CLI, journal class, Project Journal template, note-journal reference in the vault skill, project-journaling skill [[Project Journaling]]
  - kind::: done
  - comment::: Bulleted format for humans; links live inline in the description; Excel-ready via journal.sh export

## Tech debt

%% debt discovered while working (journal.sh debt); at close it becomes its own note %%

## Intermediate products

%% products worth extracting (journal.sh product); reviewed at close %%

## How it went

%% human lines on how the project went - written by the human (journal.sh reflect), at close at least %%
