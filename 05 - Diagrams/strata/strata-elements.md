---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - container|container]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 19:15
---
# [[strata-elements]]

> [!abstract] What Strata is made of
> - The parts of Strata and how they connect; each node takes the color of its note status.
> - Each part has its own note with the detail diagram.

```pele
flowchart LR
  agent[Agent] -- loads --> skill[note-diagram skill]
  agent -- edits --> notes[(Diagram notes<br/>05 - Diagrams)]
  agent -- runs --> cli[strata CLI]
  cli -- validates --> notes
  notes -- rendered by --> plugin[Strata plugin]
  build[Build] -- ships --> plugin & cli
  click skill "strata-elements-skill"
  click notes "strata-elements-model"
  click cli "strata-elements-cli"
  click plugin "strata-elements-plugin"
  click build "strata-elements-build"
```

## Details

- The architecture levels of the project go under this note: `strata-elements-plugin-render` is a child of `strata-elements-plugin`.
