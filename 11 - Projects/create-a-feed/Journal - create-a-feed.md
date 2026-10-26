---
file_class: journal
paras:
  - "[[create-a-feed]]"
type: "[[Journals]]"
subtypes:
  - "[[Logging - Journals - project-log|project-log]]"
rate:
tags:
status: wip
maturity: capture
description: "My own feed and news inbox: sources, clustering, LLM enrichment, notes and panes"
created: 2026-10-26 14:28
---
# [[Journal - create-a-feed]]

My own feed and news inbox: sources, clustering, LLM enrichment, notes and panes

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
- 2026-10-26 14:28: News notes in 06 - Inputs/News/ with a 30-day purge, news class and base [[_I00033 Integration of the feed with Obsidian]]
  - kind::: done
  - good::: Notes as a view of SQLite; reused the Captures pane; the gate cut the class to 5 fields; one-key sync
  - bad::: Too much at once; closed before real use; story drift remains (_I00048)
- 2026-10-26 14:28: News pane in Mise-en-Place (<leader> F n) [[_I00046 News pane in Mise-en-Place]]
  - kind::: done
  - good::: Notes as a view of SQLite; reused the Captures pane; the gate cut the class to 5 fields; one-key sync
  - bad::: Too much at once; closed before real use; story drift remains (_I00048)

## Tech debt

%% debt discovered while working (journal.sh debt); at close it becomes its own note %%

## Intermediate products

%% products worth extracting (journal.sh product); reviewed at close %%

## How it went

%% human lines on how the project went - written by the human (journal.sh reflect), at close at least %%
