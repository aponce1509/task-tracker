---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - classes|classes]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 12:00
---
# [[strata-elements-model]]

> [!abstract] Notes, names and the tree
> - A diagram note lives in `05 - Diagrams/<project>/` and its name starts with the project.
> - The name splits on `-` into levels; the parent is the name without its last level.
> - Each note holds one `pele` block, the commons properties, and short details.
> - The root has two fixed children, `-features` and `-elements`; the architecture levels go under `-elements`.

```pele
classDiagram
  direction TB
  class Project {
    folder : string
  }
  class DiagramNote {
    name : string
    levels : string[]
    parent : string
    status : commons status
    subtypes : Architectures subtypes
  }
  class PeleBlock {
    source : string
    line : number
  }
  class Link {
    directive : click id "note"
  }
  Project "1" *-- "many" DiagramNote : holds
  DiagramNote "1" o-- "many" DiagramNote : parent of
  DiagramNote "1" *-- "1" PeleBlock : diagram
  PeleBlock "1" *-- "many" Link : drill down
```

## Details

- A level is `[a-z0-9_]+`; `-` is reserved as the separator, so `rate_limit` is a level and `rate-limit` is two.
- The root note has the same name as the project folder, so `strata/strata.md` is the root of `strata`.
- A missing parent is an error: create the parents first.
- `strata new <project>` creates the root and both views; on an existing root it adds the missing views.
- `click <node> "<note>"` links a node to any note, usually a child diagram or a detail note.
- Shared code: `src/model.ts`, used by the plugin and the CLI.
