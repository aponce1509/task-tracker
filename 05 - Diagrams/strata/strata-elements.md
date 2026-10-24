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

> [!abstract] What Strata is made of and where each part runs
> - Strata has three parts: the Strata plugin, the strata CLI and the note-diagram skill; Build makes the plugin and the CLI from one TypeScript source.
> - The Strata plugin runs inside Obsidian: it draws the diagrams that Me reads.
> - The strata CLI runs in Node: the Agent uses it to check, list and create notes without Obsidian.
> - The note-diagram skill is text that the Agent loads: the rules and the loop to write diagrams.
> - Diagram notes are data: the `.md` files in `05 - Diagrams/<project>/`. The Note model is code: it turns the note names and properties into the tree, for both the plugin and the CLI; it does no file I/O.
> - Both the plugin and the CLI bundle the same Pele to draw the `pele` blocks.
> - Each part node links to its note and takes the color of its note status.

```pele
flowchart LR
  me([Me]) -- asks --> agent([Agent])
  agent -- loads --> skill[note-diagram skill]
  agent -- runs --> cli
  subgraph obsidian[Obsidian]
    plugin[Strata plugin]
  end
  subgraph nodejs[Node]
    cli[strata CLI]
  end
  plugin -- shows diagrams to --> me
  plugin & cli -- use --> model[Note model]
  plugin -- reads and creates --> notes[(Diagram notes)]
  cli -- reads and creates --> notes
  plugin & cli -- draw with --> pele[Pele]
  build[Build] -- ships --> plugin & cli
  click skill "strata-elements-skill"
  click cli "strata-elements-cli"
  click plugin "strata-elements-plugin"
  click model "strata-elements-model"
  click build "strata-elements-build"
```

## Details

- Strata plugin: `.obsidian/plugins/strata/src/main.ts`, built to `main.js`; Obsidian loads it.
- strata CLI: `src/cli.ts`, built to `strata.mjs`; run it with `node .obsidian/plugins/strata/strata.mjs`.
- Note model: `src/model.ts` (names, hierarchy, `pele` blocks, links, template); the plugin and the CLI import it, so both read the notes the same way.
- note-diagram skill: `99 - Meta/skills/note-diagram/` (`SKILL.md`, `references/pele-syntax.md`) and the agents `diagram-writer` and `diagram-reviewer`.
- Build: `package.json` + `esbuild.config.mjs`; `npm run build` writes both bundles, with Pele pinned at 1.9.0.
- The Note model is drawn as a part because both bundles share it; it is not a separate deployable. It has no imports and no file I/O: the plugin reads the notes through the Obsidian metadata cache and creates them with its commands; the CLI reads them from disk and creates them with `new`.
- Diagram notes have no own note: they are the data that all the parts read.
- The architecture levels of the project go under this note: `strata-elements-plugin-render` is a child of `strata-elements-plugin`.
