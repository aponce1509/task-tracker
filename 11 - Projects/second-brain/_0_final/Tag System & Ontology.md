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
created: 2026-08-21 19:35
---
# [[Tag System & Ontology]]


This note defines the global rules and schemas for tags within the vault. 

> [!important] Core Role of Tags
> - **YAML Metadata** handles structured attributes (type, status, rate, lifecycle, dates).
> - **PARA System** handles contextual grouping via internal links (`[[Project]]`, `[[Area]]`, `[[Resource]]`).
> - **Tags** handle lightweight, transversal cross-cutting overlays, inline markers, and temporal workflow flags that transcend specific projects or schemas.

1. Inline & Semantic Markers: Used inside note bodies to flag granular content snippets without needing separate notes or frontmatter fields.
	1. `#rule`: Defines explicit rules, formulas, constraints, or non-negotiable guidelines inline.
	2. `#definition`: Marks key terminology definitions for quick extraction across notes.
	3. `#quote`: Highlights notable quotes, citations, or excerpts.
	4. `#example`: Flags practical demonstrations or illustrative cases.
2. Temporal & Workflow Contexts: Captures immediate focus or environmental constraints that aren't tied to a specific project or metadata field.
	1. `#context/quick-win`: Actionable items or ideas executable in under 10 minutes.
	2. `#context/focus`: Current deep-work targets across any area.
	3. `#workflow/blocked-external`: Items waiting specifically on third-party inputs or external dependencies.
3. Methodological & Analytical Overlays: Applies cross-cutting conceptual perspectives across disparate subjects.
	1. `#perspective/mental-model`: Applied cognitive models (e.g., first-principles thinking).
	2. `#perspective/tradeoff`: Notes or sections highlighting explicit compromise choices.
	3. `#perspective/anti-pattern`: Common failure modes, bad practices, or pitfalls to avoid.
4. Technical & Utility Tags: Captures specific utility attributes where dedicated metadata keys are unnecessary.
	1. `#tool/<name>`: Specific software, languages, or hardware tools referenced inline (e.g., `#tool/python`, `#tool/docker`).
	2. `#format/<type>`: Specific input formats when relevant (e.g., `#format/cheatsheet`, `#format/diagram`).
5. Functional Tags 
	1. `#extract`: Marks high-value inline snippets or quotes to be carved out into standalone notes
	2. `#todo`: Quick inline task marker inside a note body for lightweight tracking
	3. `#verify`: Flags claims, calculations, or statements that need fact-checking or confirmation
	4. `#missing`: Marks gaps in knowledge, missing references, or incomplete sections
	5. `#debt`: Highlights temporary shortcuts, suboptimal logic, or technical/structural debt
