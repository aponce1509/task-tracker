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
created: 2026-10-14 00:25
---
# [[WORKFLOWS - Start Issue]]

> [!summary]
> Slow down to speed up. Before I touch the problem, the issue has its context, short tasks, its dependencies and the notes I will need.

**Trigger:** an issue goes from `inbox` or `feed` to `wip` · **Timecap:** 10 minutes · **Driven by:** `/start-issue`, the `note-issue` skill

## Steps

- Context: the issue says what happens now and what must happen, in two or three sentences. Fill it when it is missing ([[The Issue System]]).
- Tasks: break the work into tasks of less than thirty minutes, with sub-bullets for the details.
- Dependencies: set `dependencies:` to the issues that must resolve first. When one is still open, set `status: blocked` and stop here.
- Notes I need: list at the top of the issue the notes and references that the work will use. This is the convergence step of [[Convergence and Divergence]].
- Set `status: wip`.

## Tidies

- The issue itself: a vague issue becomes a workable one.
- The notes listed as needed get a reason to be distilled during the work.
