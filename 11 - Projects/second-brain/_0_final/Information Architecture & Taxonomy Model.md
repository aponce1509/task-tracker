---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status:
maturity: capture
created: 2026-08-18 23:47
---
# [[Information Architecture & Taxonomy Model]]

This note defines the unified schema for how information is classified across
note types, subtypes, metadata properties, and dynamic tags.

It strictly separates:

- **Type**: Structural identity (what something is)
- **Subtype**: Specific category under a Type (enables grouping in
  Bases/Dataview)
- **Metadata Properties**: Structured dimensions for state, lifecycle,
  execution, and tracking
- **Tags**: Dynamic, cross-cutting overlay attributes that don't fit explicit
  property keys: Look [[Tag System (Multi-Dimensional Overlay)]]

## Core Principles

> [!note] Core Principles Every note is defined by:
>
> - **Type** (`type`): Immutable structural identity (Single select).
> - **Subtype** (`subtype`): Domain/category classification (List or single
>   select).
> - **Properties**: Structured metadata values (status, lifecycle, priority,
>   target dates).
> - **Tags** (`tags`): Optional cross-cutting overlays across multiple
>   dimensions. 

> [!important] System Behavior Rules
> - **Type is immutable**: Determines the expected schema of the note.
> - **Subtypes enable grouping**: Used in Bases / Dataview tables to group by
>   category without parsing multi-value tags.
> - **Properties govern state**: Execution, lifecycle, priority, and progress
>   are stored as YAML metadata.
> - **Evergreen is a lifecycle state**: Promoted through stability and review.
> - **Issues are work**: Separated from passive knowledge notes.
> - **Patterns bridge solutions & concepts**: Reusable abstractions across
>   systems.

> [!summary] Mental Model Summary
> - **Type**: Identifies structural identity
> - **Subtype**: Categorizes within identity (for native grouping)
> - **Metadata**: Drives state, tracking, filters, and workflow mechanics
> - **MoCs & Indexes**: Provide system navigation

## Type & Subtype Taxonomy

### Your Brain

- Ideas: Creative sparks, raw unrefined concepts, or potential projects awaiting evaluation.
  - **Subtypes**: `spark`, `concept-seed`, `project-idea`, `experiment`
- Reflections: First-person subjective thoughts, introspective musings, and personal logs.
  - **Subtypes**: `introspection`, `philosophical`, `retrospective`, `opinion`
- Inquiries: Open internal questions, paradoxes, and unresolved mental friction.
  - **Subtypes**: `open-question`, `paradox`, `internal-debate`, `doubt`
- Mental Models: Personal cognitive frameworks, heuristics, and internalized worldviews.
  - **Subtypes**: `heuristic`, `framework`, `principle`, `lens`
### External Knowledge

- Medias: External consumable content (books, films, podcasts, videos).
  - **Subtypes**: `book`, `film`, `podcast`, `show`
- Resources: Curated external references, bookmarks, articles, papers,
  documentation, tools.
  - **Subtypes**: `article`, `bookmark`, `paper`, `documentation`, `tool`,
    `video`

### Normative (What Should Be True)

- Requirements: Constraints, capabilities, and conditions that must exist.
  - **Subtypes**: `functional`, `non-functional`, `business-rule`, `constraint`
- Specs: System or feature definitions (PRDs, RFCs, feature specs).
  - **Subtypes**: `prd`, `rfc`, `feature-spec`
- Decisions: _Explicit choices with rationale and consequences._
  - **Subtypes**: `architecture`, `product`, `process`
- Standards: Reusable rules, conventions, workflows, and operational policies.
  - **Subtypes**: `coding`, `naming`, `workflow`, `operations`

### Descriptive (What Is True)

- Architecture: Structural representation of systems (database, services, APIs,
  domain models).
  - **Subtypes**: `database`, `domain-model`, `service`, `infrastructure`,
    `api`, `data-flow`
- Project Contexts: Current state of systems (migration, risks, constraints,
  technical debt state).
  - **Subtypes**: `migration`, `legacy`, `technical-debt`, `status`, `risk`

### Operational

- Issues: Actionable work items with clear definition of done.
  - **Subtypes**: `bug`, `task`, `improvement`, `incident`, `open-problem`, `requrent`
- Solutions: Reusable fixes, troubleshooting patterns, operational recipes.
  - **Subtypes**: `fix`, `workaround`, `troubleshooting`, `recipe`
- HowTos: Repeatable procedural instructions for performing tasks.
  - **Subtypes**: `guide`, `cheatsheet`, `runbook`
- Meetings: Structured or semi-structured meeting notes and outcomes.
  - **Subtypes**: `sync`, `planning`, `retrospective`, `1on1`

### Knowledge

- **Roadmaps**: Structured learning roadmaps, course outlines, and study
  milestones
  - **Subtypes**: `curriculum`, `course`, `module`
- **Core Knowledge**: Durable, project-agnostic mental models, rules, and
  testable concepts
  - **Subtypes**: `concept`, `framework`, `principle`
- **Syntheses**: Investigations, evaluations, real-world case studies, and
  external reference anchors
  - **Subtypes**: `case-study`, `research`, `reference-anchor`
- **Emergent Thoughts**: Active synthesis, doubts to resolve, original ideas,
  and working hypotheses
  - **Subtypes**: `open-question`, `idea`, `hypothesis`
- **Annotations**: 
  - **Subtypes**: `question`, `evidence`, `conclusion`, `extract`

### Artifacts

- Assets: Concrete outputs such as code, scripts, diagrams, datasets, mockups.
  - **Subtypes**: `code`, `script`, `diagram`, `dataset`, `mockup`, `document`

### Logging

- Journals: _Personal or reflective logs, scratch thinking, daily entries._
  - **Subtypes**: `daily`, `weekly`, `reflection`, `scratchpad`, `brain-dump`,
    `project-log`

### Navigation / Meta

- Indexes: Entry points into the knowledge system.
  - **Subtypes**: `global-index`, `topic-index`
- MoCs: Maps of content and relationships between notes.\*
  - **Subtypes**: `domain-moc`, `project-moc`, `area-moc`
