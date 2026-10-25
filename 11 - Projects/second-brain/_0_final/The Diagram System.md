---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status: wip
maturity: distilled
created: 2026-10-24 12:00
---
# [[The Diagram System]]

> [!abstract] A system is a tree of small diagrams
> - I describe a system with diagrams, not with long spec documents.
> - One note holds one diagram and a few details; the note name holds its place in the tree.
> - Each project has three views: the overview, the features and the elements, each feature and element with its status.
> - The levels follow C4, from the context down to the classes; the tree grows with the code.
> - Agents write and change the diagrams, another agent reads them cold to check that they are understandable; I review them rendered in Obsidian.
> - The tree is the plan: each leaf is a unit of work that one agent can build in parallel with the others.

> [!info] Why
> - A spec of 1k lines is slow to write, slow to read and out of date after the first change.
> - Small diagrams are fast to change and fast to review, and the levels let me zoom from the context down to a class.
> - Build fast first, then migrate and improve the diagrams with the code.

## Notes and names

- Diagram notes live in `05 - Diagrams/<project>/`, one folder per project.
- The name splits on `-` into levels: `strata-elements-plugin-render` is a child of `strata-elements-plugin`, which is a child of `strata-elements`.
- The root note has the name of the folder. A level uses only lowercase letters, digits and `_`.
- Every parent exists before its children.
- [[strata]] is the example project.

## The three views

Every project has three notes at the top of its tree. They are simple docs: I see what the system does and what it is made of, and how far each part is.

| Note | View | Diagram |
| --- | --- | --- |
| `<project>` | Overview: what the system is, who uses it, and the links to the two other views | `flowchart` |
| `<project>-features` | Features: what I can do with the system, grouped by area, each with its status | `flowchart LR`, one subgraph per area with `direction TB`: one column per area |
| `<project>-elements` | Elements: the parts of the system and how they connect, each with its status | `flowchart`, `C4Container` |

- The root has only these two children. The architecture levels go under `-elements`, so `strata-elements-plugin` is a part and its children are its detail diagrams.
- A feature is something a user can do; an element is a part that does it. A feature node links to the element that builds it.
- A feature that is big enough gets its own note under `-features`, the same as an element.
- `strata new <project>` creates the three notes; on an existing root it adds the missing views.

## Levels

The levels come from the C4 model: each level zooms into one node of the level above. The subtype of [[Architectures]] says which level a diagram shows, and the place of the note in the tree gives that level. Each note has one subtype.

| Subtype | C4 | Place in the tree | Shows | Usual diagram |
| --- | --- | --- | --- | --- |
| context | L1 | `<project>` | The system, its users and the external systems | `flowchart`, `C4Context` |
| features | | `<project>-features` and below | What a user can do, by area, with status | `flowchart LR` columns |
| container | L2 | `<project>-elements` | The parts that run or ship and how they talk | `flowchart`, `C4Container` |
| component | L3 | `<project>-elements-<part>` and below | The modules inside one part | `flowchart`, `C4Component` |
| classes | L4 | `<project>-elements-<part>` and below | The classes and types of one component | `classDiagram` |

Any note under `-elements` can also show one aspect of its element instead of a level:

| Subtype | Shows | Usual diagram |
| --- | --- | --- |
| dynamic | Runtime behavior: a sequence, a state machine, a pipeline | `sequenceDiagram`, `stateDiagram-v2`, `flowchart` |
| data | Stores, schemas, tables and keys | `erDiagram` |
| interface | Contracts: commands, endpoints, events | `flowchart`, `classDiagram` |
| deployment | Hosts, network, build and ship | `architecture-beta` |

- A project uses only the levels it needs: a small part goes from its component diagram straight to classes.
- `strata new` sets the subtype of the three views; for deeper notes the author picks it.

## Grow the tree with the code

- First pass: the context, the features and the containers. That is enough to build a working app.
- Then each part gets its components, classes and aspects as the code grows and I improve it.
- The diagrams change with the code, never long before it.

## Status in the diagrams

- A node shows its status with a class: `a:::done`, or `class a,b wip`. The classes are the commons values `inbox`, `wip`, `blocked`, `done`. No `classDef` is needed.
- A node that links to a note and has no class takes the `status` of that note. So the elements view needs no classes: the status lives once, in the frontmatter of each element note.
- A feature without its own note sets its class in the diagram.
- Colors: `inbox` dashed, `wip` yellow, `blocked` red, `done` green, the same as the dots of the tree panel.

## Metadata and body

- Commons schema with `type: "[[Architectures]]"` and one subtype from the tables above.
- `status` follows the build: `inbox` (only drawn), `wip`, `blocked`, `done`.
- `paras` links the project PAR note.
- Body: the summary callout, one `pele` code block, then `## Details` with short bullets: code paths, decisions, limits. Nothing more.
- A node that has its own note links to it, so the diagram drills down.

## Understandable diagrams

- I read the callout before I look at the diagram, every time. So the callout gives the context I need to read it: what part of the system this is, and what to look for.
- A diagram is good when I understand it from its callout and its parents. The number of nodes, the labels and the layout serve that, and there is no fixed rule for them.
- The same thing has the same name at every level, so I can follow it down the tree.

## Agents

The `note-diagram` skill orchestrates two subagents, so that the diagrams stay understandable for a reader who was not in the conversation.

| Agent | Role |
| --- | --- |
| `diagram-writer` | Writes one diagram note. The root agent gives it the whole context: the system, the approved tree, the names, the parents and what the note must show. One instance per note, in parallel. |
| `diagram-reviewer` | Read-only. Reads the tree cold, with only the project name, the way I will read it. It reports what a reader cannot understand and where the tree is not coherent. |

- The root agent talks with me, drafts the tree, creates the notes with `strata new`, briefs the writers, runs `check` and the reviewer, and sends the findings back to the writers.
- Small changes do not need the subagents: when a change touches one or two notes and does not add a note or change the tree, the root agent edits the notes and runs `check`. It runs the reviewer only when the change touches a callout or the names that other levels use.
- Coherence means: each child is a node of its parent, the names match across levels, each feature links to an element, the subtype fits the level, a parent is not `done` while a child is not, and the details agree with the diagram.

## Rendering

- The diagrams use [Pele](https://pele.run), the Mermaid renderer of Obsidian. It reads Mermaid 12.1 syntax.
- The Strata plugin (`.obsidian/plugins/strata/`) renders the `pele` blocks, colors the status of the nodes, adds the breadcrumb and the child chips, and shows the tree in a side panel.
- The expand button of a block opens the diagram in its own pane, with pinch and scroll to zoom and pan.
- The Strata CLI (`.obsidian/plugins/strata/strata.mjs`) checks the notes, prints the tree and creates notes, without Obsidian.

## Audit

- `node .obsidian/plugins/strata/strata.mjs check` finds bad names, missing parents, Pele errors and links to notes that do not exist.
- It warns when a root has no `-features` or `-elements` note, and when a root child is not one of the two views.
- It warns when a note has no subtype, more than one, an unknown one, or one that does not fit its place in the tree.
- The `diagram-reviewer` checks what the CLI cannot: that a reader understands the diagrams and that the levels agree.

## Related

- [[The Note Kinds]]
- [[The AI Guidance System]]
