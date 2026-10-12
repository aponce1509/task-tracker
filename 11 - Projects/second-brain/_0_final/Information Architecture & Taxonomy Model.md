---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status: done
maturity: evergreen
created: 2026-08-18 23:47
---
# [[Information Architecture & Taxonomy Model]]

This note defines how identity is assigned to notes: the **Category → Type → Subtype** taxonomy.

It strictly separates:

- **Type**: structural identity (what something is)
- **Subtype**: specific category under a Type (enables grouping in Bases/Dataview)
- **Properties**: state, lifecycle, execution, tracking → [[Common Frontmatter Schemas & Specific Note Templates]]
- **Tags**: the 4 cross-references → [[Tag System & Ontology]]

## Source of Truth & Generation

> [!important] The taxonomy is GENERATED, not hand-written
> 1. Source of truth: `.obsidian/personal_scripts/taxonomy.json`
> 2. Generator: `.obsidian/personal_scripts/subtypes_generation.sh`
> 3. Output:
>    - Type notes → `02 - Categories/_types/` (`file_class: type`, embed `types.base`)
>    - Subtype notes → `02 - Categories/_subtypes/` (`file_class: subtype`, embed `subtypes.base`)
>    - Aliases: the subtype slug when unique; `<Type> <slug>` when the slug collides across types (e.g. `Core Knowledge framework`), so `[[links]]` are never ambiguous.

**To add/rename a type or subtype:** edit `taxonomy.json` → rerun the script → never hand-edit the generated files.

```bash
bash .obsidian/personal_scripts/subtypes_generation.sh \
  .obsidian/personal_scripts/taxonomy.json "02 - Categories/_subtypes"
```

## Core Principles

> [!note] Every note is defined by
> - **Type** (`type`): immutable structural identity. Single link to a `_types` note.
> - **Subtypes** (`subtypes`): classification within the identity. Links to `_subtypes` notes.
> - **Properties**: state and tracking live in YAML, never in tags.
> - **MoCs & Indexes**: provide navigation, never classification.

> [!important] System Behavior Rules
> - Type is immutable: it determines the expected schema of the note.
> - Subtypes enable grouping in Bases without parsing multi-value tags.
> - Issues are work, not knowledge.
> - Patterns bridge solutions & concepts as reusable abstractions.

## Type & Subtype Taxonomy

Mirror of `taxonomy.json` (the JSON prevails on any mismatch).

### Your Brain

- **Ideas**: creative sparks, raw concepts, potential projects → `spark`, `concept-seed`, `project-idea`, `experiment`
- **Reflections**: first-person subjective thoughts → `introspection`, `philosophical`, `retrospective`, `opinion`
- **Inquiries**: open internal questions and mental friction → `open-question`, `paradox`, `internal-debate`, `doubt`
- **Mental Models**: personal cognitive frameworks → `heuristic`, `framework`, `principle`, `lens`

### External Knowledge

- **Medias**: consumable content → `book`, `film`, `podcast`, `show`
- **Resources**: curated external references → `article`, `bookmark`, `paper`, `documentation`, `tool`, `video`, `chats`

### Normative (What Should Be True)

- **Requirements**: constraints and capabilities → `functional`, `non-functional`, `business-rule`, `constraint`
- **Specs**: system/feature definitions → `prd`, `rfc`, `feature-spec`, `design-doc`
- **Decisions**: explicit choices with rationale → `architecture`, `product`, `process`
- **Standards**: reusable rules and conventions → `coding`, `naming`, `workflow`, `operations`

### Descriptive (What Is True)

- **Architectures**: structural representation of systems → `database`, `domain-model`, `service`, `infrastructure`, `api`, `data-flow`
- **Project Contexts**: current state of systems → `migration`, `legacy`, `technical-debt`, `status`, `risk`

### Operational

- **Issues**: actionable work items → `bug`, `task`, `improvement`, `incident`, `open-problem`, `recurring`
- **Solutions**: reusable fixes → `fix`, `workaround`, `troubleshooting`, `recipe`
- **HowTos**: repeatable procedures → `guide`, `cheatsheet`, `runbook`
- **Meetings**: meeting notes and outcomes → `sync`, `planning`, `retrospective`, `1on1`

### Knowledge

- **Roadmaps**: structured learning paths → `curriculum`, `course`, `module`
- **Core Knowledge**: durable, project-agnostic models → `concept`, `framework`, `principle`
- **Syntheses**: investigations and evaluations → `case-study`, `research`, `reference-anchor`
- **Emergent Thoughts**: active synthesis and hypotheses → `open-question`, `idea`, `hypothesis`
- **Annotations**: notes on external sources → `question`, `evidence`, `conclusion`, `extract`

### Artifacts

- **Assets**: concrete outputs → `code`, `script`, `diagram`, `dataset`, `mockup`, `document`

### Logging

- **Journals**: logs and scratch thinking → `daily`, `weekly`, `reflection`, `scratchpad`, `brain-dump`, `project-log`

### Navigation / Meta

- **Indexes**: entry points into the system → `global-index`, `topic-index`
- **MoCs**: maps of content → `domain-moc`, `project-moc`, `area-moc`

