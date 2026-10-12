# System - Tags (the 4 canonical cross-references)

Tags are ONLY lightweight cross-references: inline flags that cut across every
folder, type and project. Canonical source: [[Tag System & Ontology]].

> [!important] The only 4 tags - to keep track
> - `#learnable`: algo que quiero poder decir de memoria
> - `#sentations_request`: necesito coleccionar cómo me siento para replicarlo
> - `#rfm`: request for meditation
> - `#todo`: todos to be extracted

## What must NEVER be a tag

| Dimension | Where it lives instead |
| --- | --- |
| Execution state (inbox, feed, wip, blocked, done) | `status:` property |
| Knowledge lifecycle (capture, distilled, evergreen) | `maturity:` property |
| Identity (issue, concept, book, ...) | `type:` + `subtypes:` properties |
| Context (project, area, resource) | `paras:` links |
| Quality | `rate:` property |
| Learning / media progress | `learning_status:` / `consumption_status:` |

Legacy dimensional tags (`#_inbox`, `#_capture`, `#_wip`, `#_to_consume`, ...)
are deprecated - migrate them to the matching property on sight.

## Creating a new tag

A new tag needs explicit user approval and must pass all of:

1. It answers a cross-cutting question that no property, type or PARA link can
   answer.
2. It enables a permanent search the user will actually run.
3. It survives meditation ([[WORKFLOWS - New Tags & Types]]): not redundant,
   consistent with the philosophy, the query it enables makes sense.

Once approved, register it in [[Tag System & Ontology]] before use.

Pending suggestions already queued for meditation (do not apply yet):
`#extract` (high-value inline snippet to carve into a standalone note),
`#verify` (claim, calculation or quote needing fact-check).
