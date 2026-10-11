---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes: 
  - "[[Normative - Specs - design-doc|design-doc]]"
rate:
tags:
status: 
maturity: capture
created: 2026-05-15 12:12
---
# [[Tags & Types - The Searching Engine]]

> [!important] 
> To keep track
> - `#learnable`: Algo que quiero poder decir de memoria 
> - `#sentations_request`: Necesito coleccionar como me siento para replicarlo
> - `#rfm`: Request for meditation

This note defines the unified structure for how information is classified across note types and tags.

It separates:
- Note Types (what something is)
- Tags (state, role, lifecycle, intent)

> [!note] Core Principles
>Every note is defined by:
> - One Type → structural identity 
> - Zero or more Tags → dynamic attributes across multiple dimensions 

> [!important] System Behaviour Rules
> - Type is immutable
> - Tags are multi-dimensional
> - A note can evolve through lifecycle tags
> - Evergreen is a promotion state reached through stability and review
> - Issues are not knowledge, they are work
> - Patterns bridge solutions and concepts as reusable abstractions

> [!summary] Mental Model Summary
> - Type defines identity
> - Tags define behavior and state
> - MoCs and Indexes define navigation
## Note Types (Primary Classification)

### External Knowledge

- **Medias**: External consumable content (books, films, podcasts, videos)
  - `#books` - `#films` - `#podcasts` - `#shows`
  - Videos: only important videos with a para
- **Resources**: Curated external references, bookmarks, articles, papers, documentation, tools
  - `#articles` - `#bookmarks` - `#papers` - `#documentation` - `#tools` - `#videos`
### Normative (What should be true)

- **Requirements**: Constraints, capabilities, and conditions that must exist
- **Specs**: System or feature definitions (PRDs, RFCs, feature specs)
  - `#prd` - `#rfc` - `#feature-spec`
- **Decisions**: Explicit choices with rationale and consequences
  - `#architecture` - `#product` - `#process`
- **Standards**: Reusable rules, conventions, workflows, and operational policies
  - `#coding` - `#naming` - `#workflow` - `#operations`
### Descriptive (What is true)

- **Architectures**: Structural representation of systems (database, services, APIs, domain models)
  - `#database` - `#domain-model` - `#services` - `#infrastructure` - `#api` - `#data-flow`
- **Project Contexts**: Current state of systems (migration, risks, constraints, technical debt state)
  - `#migration` - `#legacy` - `#technical-debt` - `#status` - `#risks`
### Operational

- **Issues**: Actionable work items with clear definition of done
  - `#bug` - `#task` - `#improvement` - `#incident` - `#open-problem`
- **Solutions**: Reusable fixes, troubleshooting patterns, operational recipes
  - `#fix` - `#workaround` - `#troubleshooting` - `#recipe`
- **HowTos**: Repeatable procedural instructions for performing tasks
- **Meetings**: Structured or semi-structured meeting notes and outcomes
  - `#sync` - `#planning` - `#retrospective` - `#1on1`
### Knowledge

- **Concepts**: Durable, project-agnostic mental models and theories
  - `#mental-model` - `#theory` - `#principle` - `#framework`
- **Researches**: Investigations, comparisons, evaluations, explorations
  - `#comparison` - `#evaluation` - `#analysis` - `#exploration`
- **Thoughts**: Early-stage, non-final, exploratory thinking
- **Syllabus**: 
### Artifacts

- **Assets**: Concrete outputs such as code, scripts, diagrams, datasets, mockups
  - `#code` - `#script` - `#diagram` - `#dataset` - `#mockup`
### Logging

- **Journals**: Personal or reflective logs, scratch thinking, daily entries
  - `#daily` -- `#weekly` - `#reflection` - `#scratchpad` - `#brain-dump` - `#project-log`
### Navigation / Meta

- **Indexes**: Entry points into the knowledge system
- **MoCs**: Maps of content and relationships between notes

## Tag System (Multi-Dimensional Overlay)

Tags are independent of type and operate across multiple dimensions.

### Status Dimension (Execution State)

- `#_inbox`: Unprocessed capture
- `#_wip`: Actively being worked on
- `#_blocked`: Cannot proceed due to dependency or missing information
### Knowledge Lifecycle Dimension

- `#_capture`: Raw, unprocessed information
- `#_distilled`: Structured and refined knowledge
- `#_evergreen`: Stable, reusable long-term knowledge
### Structural Role Dimension

- `#_core`: Fundamental reusable knowledge or system-critical information
- `#_pattern`: Reusable structure, design, or recurring solution
- `#_milestone`: Major project or system checkpoint
- `#_debt`: Known suboptimal or temporary solution
### Workflow Intent Dimension

- `#_review`: Requires refinement or second pass
- `#_urgent`: Requires immediate attention
- `#_todo`: Actionable item to be converted into an Issue
- `#_external`: Originates from external source material
### Learning / Consumption Dimension

- `#_to_learn`: Planned learning target
- `#_learning`: Currently being learned
- `#_learned`: Completed learning
- `#_abandoned`: Dropped or deprioritized learning path
### Media Status

- `#_to_consume`:
- `#_completed`:
- `#_abandoned`:
- `#_pending_new_content`
### Inline

- `#_rule`
## Type to Tag Mapping Rules

### External Knowledge

- Medias → `#_external` + `#_capture` or `#_distilled`
- Resources → `#_external` + `#_capture` or `#_distilled`
### Normative Notes

- Requirements → `#_capture` or `#_distilled`, sometimes `#_todo`
- Specs → `#_distilled` + `#_review`
- Decisions → `#_distilled` + `#_evergreen`
- Standards → `#_evergreen` + `#_core`
### Descriptive Notes

- Architectures → `#_evergreen` + `#_core`
- Project Contexts → `#_capture` or `#_distilled` + `#_wip`
### Operational Notes

- Issues → `#_wip` + `#_todo` (or `#_blocked`)
- Solutions → `#_distilled` + `#_pattern`
- HowTos → `#_evergreen` + `#_core`
- Meetings → `#_capture` + `#_review`
### Knowledge Notes

- Concepts → `#_evergreen` + `#_distilled`
- Researches → `#_capture` → `#_distilled` progression
- Thoughts → `#_capture` + optional `#_wip`
### Artifacts

- Assets → `#_core` or `#_distilled`
### Logging

- Journals → `#_capture`
### Navigation / Meta

- Indexes → `#_evergreen`
- MoCs → `#_evergreen` + `#_core`
