---
file_class: journal
paras:
type: "[[Journals]]"
subtypes:
  - "[[Logging - Journals - project-log|project-log]]"
rate:
tags:
status: wip
maturity: capture
description:
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
---
# [[<% tp.file.title %>]]

## Log

%% Prefer the CLI: journal.sh new <project> -d "..." assembles this skeleton with the description and editing rules %%
%% one bullet per event: - YYYY-MM-DD HH:mm: description (wikilinks inline in the description, never as their own key) %%
%% keys as nested bullets: - kind::: done|meeting|milestone|note|product, - dur::: minutes, - good:::, - bad:::, - comment::: %%
%% extra lines in any format may follow the keys (keep the indent) %%

## Tech debt

%% debt discovered while working (journal.sh debt); at close it becomes its own note %%

## Intermediate products

%% products worth extracting (journal.sh product); reviewed at close %%

## How it went

%% human lines on how the project went - written by the human (journal.sh reflect), at close at least %%
