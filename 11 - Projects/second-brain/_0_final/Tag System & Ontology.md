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
created: 2026-08-21 19:35
---
# [[Tag System & Ontology]]

This note is the only canonical tag reference of the vault.

> [!important] Core Role of Tags
> - **Properties (YAML)** handle structured metadata (`status`, `maturity`, `rate`, class fields) → [[Common Frontmatter Schemas & Specific Note Templates]]
> - **Type & Subtypes** handle identity → [[Information Architecture & Taxonomy Model]]
> - **PARA links** (`paras:`) handle context (project / area / resource)
> - **Tags** are ONLY lightweight cross-references: inline flags that cut across every folder, type and project.

## Canonical Tags

> [!important] To keep track
> - `#learnable`: Algo que quiero poder decir de memoria
> - `#sentations_request`: Necesito coleccionar como me siento para replicarlo
> - `#rfm`: Request for meditation
> - `#todo`: Todos to be extracted

## What must NEVER be a tag

| Dimension | Where it lives instead |
| --- | --- |
| Execution state (inbox, feed, wip, blocked, done) | `status:` property |
| Knowledge lifecycle (capture, distilled, evergreen) | `maturity:` property |
| Identity (issue, concept, book, …) | `type:` + `subtypes:` properties |
| Context (project, area, resource) | `paras:` links |
| Quality | `rate:` property |
| Learning / media progress | `learning_status:` / `consumption_status:` |

Legacy dimensional tags (`#_inbox`, `#_capture`, `#_wip`, `#_to_consume`, …) are **deprecated** — migrate them to the matching property on sight.

## Rules for a new tag

1. It must answer a cross-cutting question that no property, type or PARA link can answer.
2. It must enable a permanent search you will actually run.
3. Meditate first ([[WORKFLOWS - New Tags & Types]]): not redundant, consistent with the philosophy, the query it enables makes sense.
4. Register it in this note before use.

## Suggested additions (pending meditation)

- `#extract`: high-value inline snippet to carve out into a standalone note — the content-level counterpart of `#todo`.
- `#verify`: claim, calculation or quote that needs fact-checking before it can be trusted or reused.
