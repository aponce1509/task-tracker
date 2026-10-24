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

> [!abstract] The strata CLI contract
> - The strata CLI is the part of [[strata-elements|Strata]] that the Agent runs to check, list, create and render the Diagram notes without Obsidian.
> - It has four commands: `check`, `tree`, `new` and `render`. Each command box shows its input; its arrow goes to its output and exit codes.
> - `check`, `tree` and `render` only read the Diagram notes. Only `new` writes them.
> - All commands use the Note model for names, hierarchy, pele blocks, links and the template.
> - Exit code 0 means success, 1 means a failure of the command, 2 means an unknown command or a missing argument (the usage text is printed).

```pele
flowchart LR
  agent([Agent]) --> check & tree & new & render
  agent -. "unknown command or missing argument" .-> usage["exit 2: usage printed"]
  subgraph cli[strata CLI]
    check["check<br/>files or dirs, default: all projects"]
    tree["tree<br/>project, --json"]
    new["new<br/>name"]
    render["render<br/>file, -o out"]
  end
  check --> checkOut["file:line:col error or warn<br/>errors: name, parent, pele syntax, click target<br/>warns: type, subtype missing, unknown or misplaced,<br/>missing view, extra block<br/>exit 1 on any error, warns keep 0"]
  tree --> treeOut["text: tree with status, diagram, subtype<br/>--json per note: depth, parent, children, status,<br/>subtypes, diagram, links, problems<br/>exit 1 on unknown project"]
  new --> newOut["child name: one note from the template, paras from parent<br/>bare project name: root + -features + -elements<br/>exit 1 on bad name, missing parent, existing note"]
  render --> renderOut["SVG with status colors<br/>to stdout or to -o file<br/>exit 1 when no pele block"]
  check & tree & render -- reads --> notes[(Diagram notes<br/>05 - Diagrams)]
  new -- creates --> notes
  cli -. uses .-> model[Note model]
  click model "strata-elements-model"
```

## Details

- Source `src/cli.ts`, bundled with Pele into `strata.mjs`: it runs with plain Node and no install. Model: [[strata-elements-model]].
- `check` renders each block with the same Pele as the Strata plugin, so a clean check means a clean render. Click targets must be notes anywhere in the vault.
- `check` on a path with no Diagram notes prints an error and exits 1.
- `new` on a bare project name skips the notes that exist, so it adds the missing views to an older root.
- `render` adds `classDef` lines for the status classes, because a plain SVG has no Obsidian CSS. Only `flowchart` gets them.
- The vault is resolved from the script location; `--vault` and `--root` override it.
