---
paras:
  - "[[second-brain]]"
type:
subtypes:
rate:
tags:
status:
maturity: capture
created: 2026-05-16 17:17
---
# [[Properties Reference - The metadata Layer]]

> [!note] Purpose
> The properties complementes the [[Tags & Types - The Searching Engine]] so more complex search can be made.

> [!info] Rules
> - We only use Bases
> - We keep them minimal
> - We use `Metadata Menu` plug-in

The different notes classes:
- `common`:
	- `paras`: list of the p/a/r that are related to this note
	- `type`: Type of the notes all the types are notes in the `02 - Categories/_types`. Only on Type for note. Preferred for grouping.
	- `tags`: List of tags for the note
	- `rate`: Puntuation of the note most times 1-5 but can vary from note types.
	- `created`: 
- `category`: No additional properties
- `issue`:
	- `priority`: 2-0 int (0 is the most urgent)
	- `dueDate`: Date with the limit date
	- `complete`: boolean to check when completed
- `par`:
	- `paraType`: Project/Area/Resource/Question
	- `active`: to indicate project that matters for this week
	- `archive`: to indicate that the project is archive
