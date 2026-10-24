---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status: wip
maturity: capture
created: 2026-10-24 12:30
---
# [[The Syllabus System]]

> [!abstract] The plan of a learning project
> - A syllabus is the note that starts a learning project: the initial state, the objectives, the sources and the modules in order.
> - A module is the minimum learning magnitude: one week, one objective, known pages to read. The syllabus is learned when all its modules are learned.

## Definition

- A syllabus is a [[Roadmaps]] note with the `course` subtype. It plans one learning project from one main source.
- A module is one week of learning, with a defined objective and the exact parts of the source to read. Modules are sections of the syllabus, not separate notes. The `module` subtype names this unit; no note carries it.
- A concept is one day of learning ([[The Concept System]]). One module produces some concepts.
- A curriculum (`curriculum` subtype) only links syllabi, in order. I write one only when two syllabi or more belong to the same path.
- The module is the old "topic" of [[The Module - The minimum learning magnitude]]. It is not the `topic-index` subtype, which is the index of a domain.
- Test: "Does this note tell me what to learn next, from which source, and when I am done?" Yes means a syllabus.

## Metadata

```yaml
---
file_class: learning
paras: ["[[design_theory]]"]      # the resource PAR of the knowledge
type: "[[Roadmaps]]"
subtypes:
  - "[[Knowledge - Roadmaps - course|course]]"
status: wip                       # the note: inbox (draft) · wip (modules can change) · done (plan final)
maturity: capture                 # distilled when the modules are final, evergreen when learned and recalled
learning_status: learning         # the learning: to_learn · learning · learned · abandoned
winstreak: 0                      # modules learned within their week in a row; an overrun resets it (max 5)
rate:
tags: []
created: YYYY-MM-DD HH:mm
---
```

- `status` tracks the note, `learning_status` tracks the learning. A syllabus can have a final plan (`done`) while I am still `learning`.
- Folder: `13 - Resources/<par>/`, next to the concepts that it produces.
- One syllabus per resource PAR at a time. The PAR note links it in its description.

## Body

- `# [[Title]]`, then one `> [!abstract]` callout: the objective in one line and the main source.
- `## Initial state`: what I know now and what I do not know. Short bullets.
- `## Objectives`: what I can do or explain at the end. Each objective is testable.
- `## Sources`: the main source first, in bold. Then the complements, which only answer the questions that come up.
- `## Modules`: one checkbox per module, in order. Nested bullets: the objective, the parts to read (chapter titles or pages), and, when learned, the concepts it produced.
- Module states: `[ ]` to learn · `[/]` learning · `[x]` learned.
- `## Parked`: modules found while learning that are out of the scope. They are future syllabi.

```markdown
# [[Rust project management]]

> [!abstract] Organise, test and publish a Rust project
> - Main source: The Rust Programming Language.

## Initial state

- I write small Rust programs in one file.
- I do not know modules, tests or workspaces.

## Objectives

- Split a project into crates and modules.
- Write unit and integration tests.
- Publish a crate and use a workspace.

## Sources

- **The Rust Programming Language** (the book)
- The Cargo Book

## Modules

- [x] Packages, crates and modules
	- Objective: split a binary into a library and modules.
	- Read: Managing Growing Projects with Packages, Crates, and Modules.
	- Concepts: [[rust crate]] · [[rust module]] · [[use declaration]]
- [/] Testing
	- Objective: unit and integration tests in one project.
	- Read: Writing Automated Tests.
- [ ] Cargo
	- Objective: release profiles, publish, workspaces.
	- Read: More about Cargo and Crates.io.

## Parked

- Procedural macros
```

## Rules

- Only one `[/]` module in the whole vault.
- I stay with the main source until the end. A complement never replaces it.
- A module is at most one week. A module that does not fit is split.
- When a module starts, I do not stop until I review all its content.
- When a module ends: recall, link its concepts under it, mark it `[x]`, and update `winstreak`.
- A module that a job needs but that I cannot finish goes to `## Parked`.

## Links

- Syllabus → PAR: `paras`. PAR → syllabus: a link in the description.
- Module → concepts: the `Concepts:` line. The concepts also enter the indexes and the daily note through [[WORKFLOWS - Learning Session]].
- The topic index of the domain links the syllabus in bold.
- Curriculum → syllabi: bullets, in order.
- Workflows: [[WORKFLOWS - Start Module]] · [[WORKFLOWS - End Module]].
- The whole protocol: [[The Learning System]].

## Audit

- More than one `[/]` module in the vault.
- A `[x]` module with no concepts.
- A syllabus with `learning_status: learning` and no `[/]` module.
- A syllabus with `learning_status: learning` and no change in two weeks.
- A syllabus with no main source in bold.
- An active resource PAR with no syllabus (hint only).
