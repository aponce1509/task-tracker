---
paras:
  - "[[second-brain]]"
type: "[[Standards]]"
subtypes:
  - "[[Normative - Standards - workflow|workflow]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-24 13:00
---
# [[WORKFLOWS - Start Module]]

> [!summary]
> One module at a time. Before I read, the module has a clear objective and the exact parts to read, and no other module is open.

**Trigger:** I start the next module of a syllabus, or the first one of a new syllabus · **Timecap:** 10 minutes · **Driven by:** `/new-syllabus` for a new syllabus, the `note-syllabus` skill for the next module

## Steps

- New learning project: `/new-syllabus` first. The kick-off gives the initial state, the objectives, the main source and the modules ([[The Syllabus System]]).
- One module only: when another module is `[/]`, I end it ([[WORKFLOWS - End Module]]) or park it.
- Read the module: the objective and the `Read:` line. When the parts are vague, I scope them first. This is the divergence of [[Convergence and Divergence]], and it ends with a sharp `Read:` line.
- Mark the module `[/]`. On the first module, `learning_status: learning`.
- Plan: the module goes to the `## Plan` of the daily note.
- Look sideways: the existing concepts and indexes of the module, so the sessions extend them instead of duplicating them.

## Tidies

- The syllabus: a vague module becomes a workable one.
- A forgotten `[/]` module gets ended or parked.
