---
paras: ["[[second-brain]]"]
type: "[[Syntheses]]"
subtypes: ["[[Knowledge - Syntheses - case-study|case-study]]"]
tags: []
status: wip
maturity: capture
created: 2026-10-13 10:00
---
# [[Case - Processing a cycle determination model]]

Hypothetical situation used to stress-test the vault system and find where it bends. Not a real project.

## Situation

Existing context notes on clustering and on stationarity tests (ADF, KPSS). Goal: design a model that determines cycles in a time series. Likely hypothesis: test stationarity to decide whether to detrend or deseasonalise, then cluster windows or phases, and read the cluster sequence as the cycle.

## How to process it

- Split: one PAR note, one concept note per method, one hypothesis note for the model, one issue per experiment.
- PAR: no home exists yet. Project if it has an end (the model works), Resource under `cs_learnings` if it is only learning.
- Concepts: `Core Knowledge / concept`, linked from the model note. Check the existing context notes first, they may really be Annotations or Resources.
- Model idea: `Emergent Thoughts / hypothesis`, `maturity: capture`, `status: wip`, `paras` pointing to the PAR note.
- Experiments: `Issues / task` under the PAR, each closed with `/postmortem`, results logged with `project-journaling`.
- Stabilised model: rewrite the hypothesis note into `Specs / design-doc` (change `type` and `subtypes`, raise `maturity`), code as `Assets / code`, conclusions as `Syntheses / research`.
- Tags: `#learnable` on the stats concepts, `#todo` on loose ends. Nothing else is allowed.

## Limits found

- A note can start as a hypothesis and be rewritten into a design-doc, but nothing enforces or tracks the change: no record of the previous type, and links using the old subtype alias go stale.
- No subtype for statistical methods. Everything collapses into `concept`, which is too coarse to query. A new subtype needs explicit approval.
- No fields for experiment parameters or metrics. Results live in prose unless a new Metadata Menu class is created.
- Issue fields (`priority`, `dueDate`) fit exploratory experiments poorly.
- Too few tags to mark "needs validation" or "depends on assumption".
- No convention for LaTeX or figures in `markdown-editing`.
- `paras` is mandatory, so the note cannot be filed properly until the PAR decision is made.

## Open decisions

- Project or Resource for the PAR note.
- Whether a `method` subtype under Core Knowledge is worth proposing.
- Whether experiments deserve their own class or stay prose in issues.
