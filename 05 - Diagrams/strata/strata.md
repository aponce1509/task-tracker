---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - context|context]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 12:00
---
# [[strata]]

> [!abstract] Diagrams as the system description
> - Strata describes a system as a tree of small diagrams, one note per diagram, instead of a long spec document.
> - Each project has three views: this overview, the [[strata-features|features]] and the [[strata-elements|elements]], each feature and element with its status.
> - Agents edit the diagrams and check them with the CLI; Obsidian renders them with Pele and links each node to its note.

> [!info] Why
> - Spec documents of 1k lines are slow to write and nobody reads them.
> - A tree of diagrams gives a parallel plan for free: each leaf is a unit of work for one agent.

```pele
flowchart LR
  me([Me]) -- asks --> agent[Agent<br/>Claude Code · OpenCode]
  agent -- writes and checks --> strata[Strata<br/>diagram notes]
  strata -- renders for --> me
  strata --> features[Features<br/>what it does] & elements[Elements<br/>what it is made of]
  click features "strata-features"
  click elements "strata-elements"
```

## Details

- Code: `.obsidian/plugins/strata/` (`src/model.ts`, `src/main.ts`, `src/cli.ts`).
- Renderer: [Pele](https://pele.run), the Obsidian rewrite of Mermaid; it reads Mermaid 12.1 syntax.
- Spec: [[The Diagram System]].
