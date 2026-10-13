---
paras:
  - "[[second-brain]]"
type: "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - MoCs - domain-moc|domain-moc]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-13 10:36
---
# [[The CODE system]]

> [!abstract] The notes lifecycle of the vault: capture → organise → distill → express
> Every note is captured raw, organised to its place, distilled revisit after revisit, and finally expressed as products. This MoC is the map to follow how we do each phase; the other system wings live in [[The Second Brain System]].

## The loop

```text
1 Capture   raw content + metadata ─▶ 09 - Inbox          (status: inbox, maturity: capture)
2 Organise  out of the inbox ─▶ its place                 (progressive summarisation starts)
3 Distill   curate: prune ─▶ summaries ─▶ links           (maturity: distilled ▸ evergreen)
4 Express   curated notes ─▶ intermediate/final products  (the exit of the loop)
```

The four phases, each with its own note:

1. **Capture** → [[Capturing - CODE]] — externalise raw content coming from the world (meetings, web pages, articles…) or from your own mind (sparks, ideas, reflections). What gets taken depends on the connector: the whole source, just the link, or just the highlight. A capture gets **only its metadata** and lands in the inbox — capture now, curate later.
2. **Organise** → [[Organise - CODE]] — the action of moving the note out of the inbox to its place: the folder of its PAR, `06 - Inputs` for external references, the own folders of MoCs and permanents. Here progressive summarisation can already start: more context, summary lines, first bullet points.
3. **Distill** → [[Distill - CODE]] — the continuation of curating the note: prune the noise once more, improve the summaries, add the links (related notes, the index or MOC of the topic) until the note stands on its own.
4. **Express** → [[Express - CODE]] — the exit. Curated notes get consumed to build intermediate and final products: [[Intermediate and Final Products]].

The rhythm behind the loop: capture is divergence (open, unjudged), organise is the bridge, distill opens the convergence, express is full convergence → [[Convergence and Divergence]]. The guard rail: before doing anything productive, know which phase you are in → [[How I see the CODE Process]].

## The two property axes

The lifecycle is carried by the commons properties, not by tags — [[Common Frontmatter Schemas & Specific Note Templates]]:

- **`status` = the execution axis** (`inbox | feed | wip | blocked | done`): is this note still being processed?
- **`maturity` = the knowledge axis** (`capture | distilled | evergreen`): how much curation has the note absorbed?

| Phase | Property state | What changes |
| :--- | :--- | :--- |
| Capture | `status: inbox` + `maturity: capture` | raw note, minimal metadata, lives in the inbox |
| Organise | `status` leaves `inbox` | the note gets its place; first summarisation layers may land |
| Distill | `maturity: distilled` | scannable in seconds, pruned, well linked |
| Evergreen | `maturity: evergreen` | stable, own words, canonical knowledge |
| Express | consumes `distilled` / `evergreen` | the output leaves the lifecycle as a product |

> [!warning] Legacy states live in properties now
> The old corpus tags (`#_inbox`, `#_capture`, `#_distill`…) carried these states inline; both axes live in properties today. Do not reintroduce them — see [[Note-Taking Tag System & Taxonomy]] (to be removed) and [[Tag System & Ontology]].

## Operating the loop

- Out of the inbox → [[WORKFLOWS - Out of the Inbox]]: batches of five, the triager proposes, I decide, the note gets metadata and place. Organising gives a home, not perfection.
- Safety net → [[WORKFLOWS - Bi-Monthly Inbox Sweep]]: every two weeks, empty the capture devices, purge inbox notes older than two weeks and run the audits.
- Distillation → [[WORKFLOWS - Distillation of a Note]]: context → diagnosis by kind → summary callout → maturity up.
- Dead-time micro-distill → [[WORKFLOWS - Contextual Capture Review]]: only what the current project needs, time-capped.

These run next to the maintenance loops of [[System Maintenance & Review]] and the routines of [[The Maintenance System]].

## Principles the loop leans on

- Capture criteria — save only what is surprising, useful, inspiring or personal; saving everything drowns the future self: [[Capture Criteria How to Avoid Keeping Too Much (or Too Little)]]
- Progressive summarisation — layer 0 raw → 1 bold → 2 highlight → 3 executive summary, one layer only on each revisit: [[Progressive Summarisation]]
- Delayed polishing — organising never cleans, capturing never polishes; low friction wins: [[Organise - CODE]] · [[Distill - CODE]]
- Every note has its place — placement plus PARA context: [[Second Brain Folder Structure]] · [[PARA Note]]
- External notes stay objective, with source and commentary: [[External Notes]]
- Capture metadata only pays off through the engines — searching: [[The Retrieval system]], metadata: [[The Metadata system]]

## Open threads

- The capture granularity (whole source / link / highlight) is decided per connector, not globally yet — see [[Second Brain MoC]] ("none of that, YET to be defined") and [[Input sources]]; the unified contract (raw + metadata + inbox) holds meanwhile.
- The reference stack awaits its remake: [[References Database]], [[Zotero - The ultimate reference manager]], [[Managing online References]].
- [[Intermediate and Final Products]] must be linked with the types, tags and special searches (WIP).

## Agent rules

- Notes are born in the inbox: minimal metadata, `status: inbox`, `maturity: capture` — never polish a capture. The `.<harness-folder>/skills/obsidian-vault-notes/SKILL.md` enforces the defaults when agents write notes.
- Phase changes are property changes (`status` / `maturity`), never inline tags.
- Respect the phase boundaries: capture stays low-friction, organising does no cleaning, distillation climbs one maturity level per revisit.
- Any change to these notes → [[System Maintenance & Review]] after-mod checklist.
