---
file_class:
  - commons
paras:
  - "[[second-brain]]"
categories:
types:
rate:
tags:
  - _intermediate
  - _capture
created: 2026-02-07 17:14
---
# [[Note Categorisation]]


---
## Mi nueva idea

1. Separamos types y categories
2. Categories para como se usa la nota
	1. Knowledge Base
	2. Product Element
	3. Second Brain Overhead
	4. Logging
	5. Annotations: Ideas, reflections
	6. 
	7. ...
3. Type para que es la nota
	1. Scripts
	2. Model
	3. Implementation Detail
	4. ...

---


#_wip faltan tmb las categorías de esta nota

- [ ] This note has plenty of repeated things that should be removed and use the linked things

## System Overview: The Fluid Metadata Engine

This system treats Obsidian as a relational database rather than a filing cabinet. Notes are defined by **what they are** (Category), using a Type to make this more concrete. The **utility** of notes is managed via PARA (Where it is useful) links and Status Tags (How the are useful).

### The Metadata Core

- **`paras` (List/Links):** Connects a note to one or more PARA Index notes. A note can belong to a _Project_ and a _Resource_ simultaneously.
- **`categories` (List):** What type of note do we have.
- **`types` (List):** The structural "DNA" of the note (e.g., Idea, Meeting, Requirement, Script).
- **`tags` (Multi-select):** Tracks the lifecycle, workflow status, and source origin.

### The CODE Workflow in Obsidian

- **Capture:** Create a note, that always have the `_inbox`. Add `_external` if it comes from an external source.
- **Organise:** Remove the inbox: Link to a `paras` index; assign `category` and `type` move the note.
- **Distill:** Update distillation tags (`_capture` $\rightarrow$ `_distilled`).
- **Express:** Use bases queries in MoCs or Project Core notes to aggregate these atoms into outputs.

---

## The Categorisation Methodology

To avoid the "project vs. system", we use a **Functional Taxonomy.** Instead of asking "Is this for a project?", we ask "What is this object?". To make this simpler, we have broad categories and each category have a type.


> [!tip] 
> **Rule:** A "Requirement" is always `type: requirement`. If it's for a specific project, you link it in the `paras` property. This allows a "Requirement" you saw on Twitter (External) to be reused in a future "Project" (Internal) without changing its fundamental identity.

### Revised Categories & Types

| **Category**            | **Potential Types**                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [[Medias]]              | [[Movies]], [[Shows]], [[Articles]], [[Videos]], [[Books]]                                                                                           |
| [[Sources]]             | [[Textbooks]], [[Mails]]                                                                                                                             |
| [[Clippings]]           | [[AI Chats]], [[Bookmarks]], [[Extractions]], [[Bookmark Lists]]                                                                                     |
| [[Knowledge Atoms]]     | [[Ideas]], [[Questions]], [[Doubts]], [[Data]], [[Principles]], [[General Knowledge]], [[Theory]]                                                    |
| [[System - Structural]] | [[MoCs]], [[Indexes]], [[Curriculums]], [[Reviews]]                                                                                                  |
| [[Assets]]              | [[Figures]], [[Tables]], [[Documents]], [[Slide]]                                                                                                    |
| [[Technical Assets]]    | [[Scripts]], [[Algorithms]], [[Design Patterns]], [[Models]], [[Data Structures]], [[Prompts]], [[Agents]], [[Design Docs]]                          |
| [[Core Assets]]         | [[Core Block]], [[Principles]], [[Implementation Details]], [[Design Docs]], [[MoCs]], [[Workflows]]                                                 |
| [[Project Management]]  | [[Requirements]], [[Workflows]], [[Problems & Solutions]], [[Decisions]], [[Implementation Details]], [[Issues]], [[ADRs]], [[PRD]], [[Design Docs]] |
| [[Logs]]                | [[Meetings]], [[Logbook]]                                                                                                                            |
| [[Persons]]             |                                                                                                                                                      |
| Others                  | [[Reflections]]                                                                                                                                      |

#### Note Types with descriptions

- [[Indexes]]
- [[MoCs]]
- [[Requirements]]

#### Note Categories with descriptions

- [[Medias]]
- [[Knowledge Atoms]]
---

## Taxonomy Reference List

### Enhanced Tags (Workflow)

Keep these lean to drive your "Global Inbox" queries:

- **Lifecycle:** `_inbox`
- **Source**: `_external`
- **Distillation:** `_capture` (raw), `_intermediate` (used in the project), `_distilled` (refined)
- **Status:** `_not-solved`, `_not-implemented`, `_wip`, `_doing`


### The Logic of Intermediate Notes

The intermediate tag means that whatever the note is it is/can be used in a project.

An "Algorithm" note is an asset by **Type**, but it becomes an **Intermediate** by **Tag** when it's currently being used to build a Project.

### Integrated Project Elements

Instead of a "Project" category, keep these as high-level **Types**.

- **Decision:** Why something was done (links to ADR).
- **Requirement:** What must be done.
- **Model:** The architecture or schema.
- **Implementation Detail:** Technical "how-to" specific to a build.

### Hybrid Indices (MoCs)

These notes use Bases to pull in the atoms:

- **ADR (Architecture Decision Record):** Queries all `type: decision` + `type: problem` linked to a specific Project.
- **PDR (Product Definition Record):** Queries all `type: requirement` + `type: model` linked to a specific Project.
   