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

# [[WORKFLOWS - End PAR]]

> [!summary] Closing a project, area or resource keeps the vault a true picture
> of my current life. The open work gets a decision, the lessons and reusable
> parts get a note, and the PAR freezes in the archive.

**Trigger:** a PAR is finished, paused or abandoned · **Timecap:** 30 minutes ·
**Driven by:** `/close-par`, the `project-journaling` skill (close protocol)

## Steps

- Triage: delete it when it was barely developed and holds no value. Otherwise
  continue.
- Open work: list the open issues of the PAR. Each one closes, moves to another
  PAR, or stays as debt with `--role debt`.
- Post-mortem of the PAR, from [[Postmortem Content]]:
  - Ending note: the index or MoC of the final solution and the reusable parts.
    I read it when I look for reusable content.
  - Rate from 1 to 3 in `rate:`, one sentence on what went well, one on what to
    improve.
- Journal: the `project-journaling` skill runs the close protocol
  (`journal.sh close`). It creates the tech debt note and reviews the
  intermediate products.
- Freeze: set `active: false` and move the PAR note to `01 - PAR/archive/`. The
  layout slot goes away with its working notes and its layout memory.

## Tidies

- PARs, issues and journals of the closed PAR.
- Raw captures of the PAR: the ending note decides which ones still have value.
