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

> [!abstract] Strata: a system as a tree of small diagrams
> - Strata describes a software system as a tree of small diagrams, one diagram note per node, instead of a long spec document.
> - Strata is three parts in the box "Strata": the Strata plugin inside Obsidian, the strata CLI for agents, and the note-diagram skill with the rules and the loop.
> - The three parts work on the same diagram notes, the `.md` files in `05 - Diagrams/<project>/`.
> - Obsidian and Pele are external systems. Obsidian hosts the Strata plugin; the plugin gives each `pele` block to Pele, and Pele draws the diagram.
> - The flow: I ask an Agent for diagrams, the Agent writes the notes and checks them with the strata CLI, and I read the rendered diagrams in Obsidian.
> - Two views go one level down: the [[strata-features|features]] (what I can do) and the [[strata-elements|elements]] (the parts and how they connect).

```pele
flowchart LR
  me([Me]) -- asks for diagrams --> agent([Agent])
  me -- reads diagrams in --> obsidian[Obsidian<br/>external app]
  subgraph sys[Strata]
    skill[note-diagram skill]
    cli[strata CLI]
    plugin[Strata plugin]
  end
  agent -- follows --> skill
  agent -- runs --> cli
  agent -- writes --> notes[(Diagram notes<br/>05 - Diagrams)]
  obsidian -- hosts --> plugin
  cli -- creates and checks --> notes
  plugin -- reads --> notes
  plugin -- renders with --> pele[Pele<br/>external renderer]
  click skill "strata-elements-skill"
  click cli "strata-elements-cli"
  click plugin "strata-elements-plugin"
```

## Details

- Code: `.obsidian/plugins/strata/src/`, one TypeScript source for the plugin (`main.ts`) and the CLI (`cli.ts`); both use the Note model (`model.ts`), see [[strata-elements-model]].
- Pele: [pele.run](https://pele.run), the Obsidian rewrite of Mermaid; it reads Mermaid 12.1 syntax. The plugin and the CLI bundle the same pinned version (`pele` 1.9.0 in `package.json`).
- The strata CLI also renders a note to SVG with Pele (`render`), without Obsidian; the diagram leaves this edge out to keep the main path clear.
- The Agent edits the note bodies directly; the strata CLI creates the notes from the template (`new`), prints the tree (`tree`) and finds errors (`check`).
- The features and elements views have no edge in the diagram: they are navigation, not parts of the system.
- The Note model and Build are internal parts of Strata: they are not drawn here and are shown in [[strata-elements]].
- Skill: `99 - Meta/skills/note-diagram/SKILL.md`. Spec: [[The Diagram System]].
