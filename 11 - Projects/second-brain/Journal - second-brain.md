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
- 2026-10-13 11:04: CODE lifecycle MoC shipped: _0_final/The CODE system.md (capture → organise → distill → express) + phase notes updated in _0_real_inbox [[The CODE system]]
  - kind::: milestone
- 2026-10-13 11:06: Legacy complete key retired from the issue system: 21 issues + both issue templates migrated to the single done rule (status: done + complete/ folder); _I00006 archived; audit, task-planner and issue references updated; archive Issues.base views repointed to status != done [[System Maintenance & Review]]
  - kind::: done
- 2026-10-13 11:18: Decisions and Syntheses views revived: normative.base 'Decissions' and knowledge.base 'Synthesis' typo filters repointed to the taxonomy types ([[Decisions]], [[Syntheses]]); view names fixed; cheatsheet rows synced; Decissions typo swept from 5 PAR notes + PARA template (headings) [[The Retrieval system]]
  - kind::: done
- 2026-10-13 11:34: CODE wing organised into _0_final: 7 notes typed by nature + 4 workflows into workflows/, typo rename to 'Implementing the O of CODE' [[Implementing the O of CODE]]
  - kind::: done
- 2026-10-13 11:38: Properties engine swept to zero: habit-tracker exemption built into the audit (daily/weekly notes and their templates are property-free by design), phantom classes killed (capture/category templates -> real classes, DoesCardioKill migrated to Roncero template shape), forbidden subtype -> subtypes on _I00017/18/19, 7 archive PARs lose priority/dueDate (no deadlines on PAR notes), legacy templates modernized (categories/types -> type, summary/url dropped), 3 PAR-archive stubs cleaned with the Readwise link preserved in body [[Common Frontmatter Schemas & Specific Note Templates]]
  - kind::: done
  correct: 'Roncero' above should read 'active Zotero template shape'
- 2026-10-13 11:47: All 21 issue notes subtyped against the existing canonical six (task x15, improvement x3: Developer UI & UX / todo-tag cleanup / skills distribution, recurring x2: the two maintenance buckets); nothing new needed in the taxonomy; issue templates exempted from the audit's no-subtypes count (scaffolding, not issues); migration's dropped-parent-key YAML bug caught by the audit rerun and repaired [[The Issue System]]
  - kind::: done
- 2026-10-13 11:48: Skills and commands distributed beyond OpenCode: canonical 99 - Meta store, committed symlink views, npx skills verified; silent-load bug fixed (3 of 5 skills never loaded in OpenCode) [[_I00021 Distribute the second-brain skills beyond OpenCode]]
  - kind::: done
  - good::: standard store + real bug found and fixed
  - bad::: harnesses drop skills silently on malformed frontmatter
- 2026-10-13 11:48: Agent-asset distribution standard set: skills, commands, sync tooling in place (system-level storage question opened in _I00022) [[second-brain]]
  - kind::: milestone
- 2026-10-14 00:49: Agent to clean all the formatters [[_I00002 Agent to clean all the formaters]]
  - kind::: done
- 2026-10-14 01:02: Script to move complete issues: not needed, covered by the post-mortem flow [[_I00003 Create a script to move complete issues to complete]]
  - kind::: done
- 2026-10-16 02:25: One layout per project in Obsidian through the mise-en-place plugin: leader keys with which-key popup, project slots from bookmark groups that follow active, compact laptop layouts, layout memory of extra notes, explorer keys; the Today dashboard continues in _I00026 [[_I00028 One layout per project, switched with leader hotkeys]]
  - kind::: done

## Tech debt

%% debt discovered while working (journal.sh debt); at close it becomes its own note %%

## Intermediate products

%% products worth extracting (journal.sh product); reviewed at close %%

## How it went

%% human lines on how the project went - written by the human (journal.sh reflect), at close at least %%
