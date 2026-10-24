# Pele syntax - the useful subset

Pele reads Mermaid 12.1 syntax and draws with its own layout. Full docs: https://pele.run. Every block below parses in Pele 1.9.0.

## Links to notes

- `flowchart`: `click <id> "<note>"`.
- `classDiagram`: `click <Class> href "<note>"`.
- C4: `$link="<note>"` as the last argument of the element.
- `sequenceDiagram`, `stateDiagram-v2`, `erDiagram`, `architecture-beta`, `mindmap`: no links. Link the children from `## Details` with wikilinks.

## flowchart - context, components, pipelines

```pele
flowchart TD
  a[Rect] --> b(Round) --> c{Decision}
  c -->|yes| d[(DB)]
  c -->|no| e([Stadium])
  subgraph s[Group]
    f[[Sub]] -.-> g>Flag]
  end
  e ==> f
  class g inbox
  click a "strata-elements-model"
```

- Direction: `LR`, `TB`/`TD`, `RL`, `BT`. Line breaks in labels: `<br/>`.
- Edges: `-->`, `-.->` (async, optional), `==>` (main path), `-- text -->` or `-->|text|`. `a --> b & c` fans out.
- Status classes: `a:::done` or `class a,b wip`, with `inbox`, `wip`, `blocked`, `done`. No `classDef`: the plugin colors them, and a linked node without a class takes the `status` of its note.

## C4 - systems and containers

```pele
C4Context
  title System context
  Person(me, "Me", "Owner")
  System(app, "App", "Does things", $link="strata-elements-model")
  System_Ext(ext, "Payments", "Stripe")
  Rel(me, app, "Uses")
  Rel(app, ext, "Charges", "HTTPS")
```

```pele
C4Container
  Person(me, "Me")
  System_Boundary(b, "App") {
    Container(web, "Web", "Angular", "UI")
    Container(api, "API", "Rust Axum", "JSON")
    ContainerDb(db, "DB", "Postgres")
  }
  Rel(me, web, "Uses")
  Rel(web, api, "Calls", "HTTPS")
  Rel(api, db, "Reads")
```

## architecture-beta - infrastructure

```pele
architecture-beta
  group cloud(cloud)[AWS]
  service api(server)[API] in cloud
  service db(database)[DB] in cloud
  service web(internet)[Browser]
  web:R --> L:api
  api:R --> L:db
```

- Icons: `cloud`, `server`, `database`, `disk`, `internet`. Groups nest with `in`.
- Edges name the sides: `a:R --> L:b`, sides `L`, `R`, `T`, `B`.

## sequenceDiagram - runtime calls

```pele
sequenceDiagram
  autonumber
  actor U as User
  participant A as API
  U->>+A: POST /x
  alt ok
    A-->>U: 200
  else fail
    A-->>-U: 500
  end
  loop retry
    U->>A: GET
  end
  Note over U,A: one line of context
```

## stateDiagram-v2 - lifecycles

```pele
stateDiagram-v2
  [*] --> Draft
  state Review {
    [*] --> Pending
    Pending --> Approved
  }
  Draft --> Review : submit
  Review --> [*]
  note right of Draft : editable
```

## classDiagram - code structure

```pele
classDiagram
  direction TB
  class Foo {
    +int x
    +run() void
  }
  Foo <|-- Bar
  Foo "1" *-- "many" Baz : owns
  click Foo href "strata-elements-model"
```

- Relations: `<|--` inherits, `*--` composes, `o--` aggregates, `-->` uses, `..>` depends.
- A self relation draws badly; write it as a field (`parent : Foo`).

## erDiagram - tables

```pele
erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ LINE : contains
  USER {
    string id PK
    string email
  }
```

## Errors

`strata check` prints `file:line:col: error: pele syntax: ...` with the line in the note. The usual causes are a missing edge target, a reserved word as an id (`end`, `class`, `click`), and quotes inside labels; wrap such labels in `["..."]`.
