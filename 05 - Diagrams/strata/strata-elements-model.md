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

> [!abstract] Note model
> - The Note model is the shared code in `src/model.ts`; the Strata plugin and the strata CLI both use it to read the Diagram notes.
> - The Note model does no file I/O: the plugin and the CLI read the files and give it note names and properties.
> - The diagram shows the classes of that code; each class mirrors a part of the Diagram notes.
> - `Entry` is one note file; `Node` adds its place in the tree; `Tree` holds all the nodes of the projects.
> - `levels` is the note name split on `-`, so `strata-elements-cli` has the levels `strata`, `elements`, `cli`; the parent is the name without its last level.
> - `subtypes` holds the one Architectures subtype of the note; `allowedSubtypes(levels)` gives the subtypes that fit its depth.
> - `Block` is one `pele` block of a note; its `click` lines link to a diagram note, or to any other note.
> - `Rules` is not a real class: it is the module constants and helper functions, drawn as a class. It holds the fixed values: the root has the two views of `VIEWS`, and `status` takes one value of `STATUSES`.

```pele
classDiagram
  direction TB
  class Tree {
    nodes : Map of name to Node
    projects : string[]
  }
  class Entry {
    path : string
    folder : string
    name : string
    status : string
    subtypes : string[]
  }
  class Node {
    project : string
    levels : string[]
    parent : name or null
    children : names
    problems : string[]
  }
  class Block {
    source : string
    line : number
    noteLinks() names
  }
  class Rules {
    SEP : -
    LEVEL_RE : a-z0-9_
    VIEWS : features, elements
    STATUSES : inbox, wip, blocked, done
    allowedSubtypes(levels) string[]
    ancestorsOf(name) names
    validLevel(level) boolean
  }
  Tree "1" *-- "many" Node : nodes
  Entry <|-- Node
  Entry ..> Block : extractBlocks
  Block "1" ..> "many" Node : click links to any note name, a Node when it is a diagram note
  Node ..> Rules : checked against
```

## Details

- Code: `.obsidian/plugins/strata/src/model.ts`, with no Obsidian or Node imports, so the plugin (`main.ts`) and the CLI (`cli.ts`) bundle the same code.
- `buildTree(entries)` makes the `Tree`: it splits each name, sets the parent, adds the children, and records the problems.
- Problems: a level that does not match `LEVEL_RE`, a name that does not start with the project folder, a missing parent.
- A level is `[a-z0-9_]+`; `-` is only the separator, so `rate_limit` is one level and `rate-limit` is two.
- The root has the name of the project folder (`strata/strata.md`); its only children are the views `strata-features` and `strata-elements`, and the architecture levels go under `-elements`.
- `allowedSubtypes`: the root takes `context`, `-features` takes `features`, `-elements` takes `container`, and deeper notes take `component`, `classes` or an extra (`dynamic`, `data`, `interface`, `deployment`).
- `extractBlocks(text)` returns every `pele` block of a note; `check` warns when a note has more than one. It takes the note text, not an `Entry` field: the caller reads the text of the file.
- Helpers: `ancestorsOf(name)` gives the names above a note, `validLevel(level)` tests a level against `LEVEL_RE`, `buildTree`, `noteTemplate`.
- `noteLinks(source)` reads `click <id> "<note>"`, `click <id> href "<note>"` and C4 `$link="<note>"`; a target with a URL scheme is not a note link.
- `noteTemplate(name)` writes a new note for `strata new`: the commons properties, the fitting subtype when only one fits, and a starting diagram.
