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
created: 2026-10-25 18:00
---
# [[The PARA System]]

> [!abstract] Where a note belongs
> - Every note belongs to a project, an area or a resource: the `paras:` property links it to its PAR note.
> - A PAR note is the entry point of its project, area or resource. It starts with an anchor and ends with an ending note.
> - Archive is not a category of its own here: `active: false` and `01 - PAR/archive/`.

## The method

PARA sorts information by actionability, not by subject: [[PARA Methodology]]. Projects have a goal and an end, areas keep a standard over time, resources are topics of interest, archives are what is no longer actionable. It is the frame of the O of CODE: [[Organise - CODE]] · [[Implementing the O of CODE]].

## The PAR note

The PAR note is the entry point of one project, area or resource. It lives in `01 - PAR/`, its material lives in `11 - Projects/`, `12 - Areas/` or `13 - Resources/`.

- Template: `99 - Meta/Templates/09 - PARA Note - Template.md`, applied by the folder trigger of `01 - PAR/`.
- Class `par`: `paraType` (Project, Area, Resource), `active` (I work on it now), `bridge` (the next concrete action when I come back) — [[Common Frontmatter Schemas & Specific Note Templates]].
- Body: the anchor in the top callout, then the bases. The issues bases show the open work; one base per cluster shows the notes of the PAR — [[The Retrieval system]].
- Raw ideas of the PAR go to the PAR note or straight to an issue. A random idea during a task goes to the daily note first — [[Keeping the Focus]].
- Active PARs get a layout slot with their working notes — [[The Workplace System]].
- The kinds of work I do and the `paraType` each one takes: [[Types of Projects - Reference]].

## The lifecycle

- Start: [[WORKFLOWS - New PAR]] · `/new-par` — check that it is new, anchor, brain dump, journal and first issues for a project.
- Work: issues and the project journal — [[Task Management]].
- Close: [[WORKFLOWS - End PAR]] · `/close-par` — decide the open issues, post-mortem, ending note, journal close, archive. The questions and the ending note: [[Postmortem Content]].

## Open threads

- The PAR note is not a note kind of [[The Note Kinds]] yet: no spec, no kind audit. #todo
