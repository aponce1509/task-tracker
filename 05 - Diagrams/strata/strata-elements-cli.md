---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - interface|interface]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 12:00
---
# [[strata-elements-cli]]

> [!abstract] The agent interface
> - Agents use `node .obsidian/plugins/strata/strata.mjs` to check, list, create and render diagrams without Obsidian.
> - `check` parses every block with the same Pele as the plugin, so a clean check means a clean render.
> - `tree --json` gives the hierarchy, status and links: the input for a parallel plan.

```pele
flowchart LR
  agent[Agent] --> check & tree & new & render
  check[check<br/>file or dir] --> report[file:line:col errors<br/>exit 1 on error]
  tree[tree<br/>project, --json] --> plan[hierarchy · status · kind · links]
  new[new name] --> note[note from template<br/>paras from parent]
  render[render file] --> svg[SVG to stdout or -o]
  new --> notes[(05 - Diagrams)]
  click notes "strata-elements-model"
```

## Details

- Source `src/cli.ts`, bundled with Pele into `strata.mjs`, so it runs with plain Node and no install.
- Checks: name rules, missing parent, Pele syntax with the file line, `click` targets that are not notes, the type, one block per note.
- The vault is resolved from the script location; `--vault` and `--root` override it.
