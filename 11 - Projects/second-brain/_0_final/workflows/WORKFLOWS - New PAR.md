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

# [[WORKFLOWS - New PAR]]

> [!summary] Projects, areas and resources are the pillars of the vault. A new
> one starts with an anchor, a short brain dump and its first links, so that it
> does not become clutter.

**Trigger:** I start a project, take a new area or follow a new resource ·
**Timecap:** 15 minutes · **Driven by:** `/new-par`, the PARA Note template, `/create-issue`

## Steps

- Check that it is new: search the PAR notes, the archive too. Reactivate an old
  PAR (`active: true`) instead of a copy.
- Create the PAR note in `01 - PAR/`; the folder trigger applies the PARA Note
  template. Create its folder in `11 - Projects/`, `12 - Areas/` or
  `13 - Resources/`.
- Set `active: true` when I work on it now. The PAR then gets a layout slot
  under `<leader> l` with its own working notes ([[Alejandro's Mise-en-Place]]).
- Anchor: the objective (project), the boundaries (area) or the main sources
  (resource), in the top callout.
- Brain dump in two minutes: what I know, my questions, ideas and next steps.
  Link the notes that already exist. No outline yet.
- Projects only:
  - Create the journal from the Project Journal template.
  - Create the first issues with `/create-issue`. The next action must exist as
    an issue.
- Link it: from its parent area, or from the domain group of [[Your main notes]]
  when it holds knowledge.

## Tidies

- Notes without `paras`: the brain dump step links the loose notes that belong
  to the new PAR.
