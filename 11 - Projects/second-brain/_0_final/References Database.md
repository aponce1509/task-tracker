---
paras:
  - "[[second-brain]]"
type: "[[Standards]]"
subtypes:
  - "[[Normative - Standards - workflow|workflow]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-02-11 23:10
---
# [[References Database]]

> [!abstract] The media database
> - One note per book, film, podcast or show, consumed or pending.
> - Type `[[Medias]]`, class `media`, in `06 - Inputs/References/`.
> - `consumption_status` tracks the state; my opinion goes in the body.
> - It is a library of external resources, not of my own thoughts or project drafts.

> [!warning] Legacy tags
> - The old `#_to_consume` / `#_external` tags are retired. `consumption_status` and the type replace them.

## Metadata

- `type`: `[[Medias]]` with one subtype: book, film, podcast or show ([[Information Architecture & Taxonomy Model]]).
- `consumption_status`: `to_consume` → `consuming` → `completed`, or `abandoned`, or `pending_new_content`.
- `rate`, `lastConsumed`, `timesConsumed`: my rating and how often I consumed it.
- View: `04 - Bases/final-bases/external-resources.base`, view Medias.

## Workflow

1. Log a new interesting resource immediately, to keep it out of my head. The Obsidian Web Clipper brings it from IMDb or Goodreads.
2. Update `consumption_status` when I start, finish or drop it.
3. After I consume it, write my opinion in the body.

## Why keep it

- My opinion stays private and searchable.
- It forces me to write about what I watch or read: it activates my critical part and improves how I express myself.
- Queries over the database come later for free.
- It is the second brain mindset: what I consume is also knowledge.
- The cost is the maintenance: each entry must come from IMDb or Goodreads. The Web Clipper makes it cheap.

## References

- [[The Sources System]] · [[External Notes]]
