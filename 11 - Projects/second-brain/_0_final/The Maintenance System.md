---
paras:
  - "[[second-brain]]"
type: "[[MoCs]]"
subtypes:
  - "[[Navigation & Meta - MoCs - domain-moc|domain-moc]]"
rate:
tags:
status: wip
maturity: distilled
created: 2026-10-14 00:15
---
# [[The Maintenance System]]

> [!abstract] Tidy where I walk
> - The vault is untidy by design: I capture fast and curate later.
> - Maintenance is not a separate chore. The workflow I follow tidies the notes it touches.
> - This MoC lists what must stay under the spotlight, the signal that shows each item, and the workflow that clears it.

> [!info] Why untidy is fine
> - A perfect vault costs more than it returns.
> - A note gets curation when I use it:
>   - a recall extends a concept
>   - a project review distills its captures
>   - an issue closes with its lessons
> - Notes that no use reaches stay rough, and that is correct.
> - Only the safety nets, the sweep and the audits, run on notes that no use touched.

## The three rules

Curation follows use. I tidy a note when a workflow brings me to it, never as a project of its own. The loop of [[The CODE system]] gives the phases; this map gives the moments.

Safety nets catch what use misses. The [[WORKFLOWS - Bi-Monthly Inbox Sweep]] and the periodic review of [[System Maintenance & Review]] are the only workflows that walk the whole vault.

Batches are small and time-capped. Five notes, fifteen minutes, then stop. A finding that is real work becomes an issue; I never fix it inside another workflow.

## Under the spotlight

These are the things that rot when nobody looks. Each one has a signal I can query and a workflow that clears it.

| Spotlight | What rots | Signal | Cleared by |
| --- | --- | --- | --- |
| Inbox | Notes without a home | `["status":inbox]`, oldest first | [[WORKFLOWS - Out of the Inbox]] · [[WORKFLOWS - Bi-Monthly Inbox Sweep]] |
| Capture devices | Phone, voice notes, Apple Notes outside the vault | Manual look | [[WORKFLOWS - Bi-Monthly Inbox Sweep]] |
| Raw captures | Placed notes never distilled | `["maturity":capture] ["paras":"[[<par>]]"]` | [[WORKFLOWS - Contextual Capture Review]] · [[WORKFLOWS - Distillation of a Note]] |
| References | Notes in `06 - Inputs` without source, commentary or a PAR that uses them | `path:"06 - Inputs" ["maturity":capture]` | [[WORKFLOWS - Out of the Inbox]] · [[WORKFLOWS - Distillation of a Note]] |
| Orphans | Concepts that no index or MoC links, notes without `paras` | Concept audit `orphan` · index audit `unreachable`, `moc-unlinked` | [[WORKFLOWS - Learning Session]] · [[WORKFLOWS - Bi-Monthly Inbox Sweep]] |
| Thin indexes | Topic indexes with no concept or a single entry | Index audit `no-concept`, `single` | [[WORKFLOWS - Learning Session]] |
| Unrecalled concepts | Concepts that no daily note links | Concept audit `unrecalled` | [[WORKFLOWS - End Day]] · [[WORKFLOWS - End Week]] |
| Open flags | `#todo` lines never extracted, `#rfm` questions never answered | `tag:#todo` · `tag:#rfm` | [[WORKFLOWS - End Day]] · [[WORKFLOWS - End Week]] |
| Issues | Stale `wip`, done issues outside `complete/`, resolved dependencies still blocking | `task-planner` · issue bases · audit done-rule | [[WORKFLOWS - Start Issue]] · [[WORKFLOWS - Complete Issue]] · [[WORKFLOWS - End Week]] |
| PARs | Active projects without progress, closed projects still active | Active Projects view of the PAR base | [[WORKFLOWS - New PAR]] · [[WORKFLOWS - End PAR]] · [[WORKFLOWS - End Week]] |
| Journals | Completed issues and parsed meetings not logged | Journal Log against `08 - Issues/complete/` | [[WORKFLOWS - Complete Issue]] · `/parse-meeting` |
| Legacy marks | `#_*` tags, forbidden keys, untyped notes | `audit.py` | Migrate on sight in any workflow · [[WORKFLOWS - Bi-Monthly Inbox Sweep]] |
| Links | Unresolved and dead links | `obsidian unresolved` | [[WORKFLOWS - Bi-Monthly Inbox Sweep]] |
| Engines | Taxonomy, classes, bases and cheatsheet out of sync | `audit.py` · `taxonomy.sh verify` | [[System Maintenance & Review]] · [[WORKFLOWS - New Tags & Types]] · [[WORKFLOWS - New Properties]] |
| AI guidance | Harness views off, broken skill frontmatter, dead paths | `sync-skills.sh status` · `vault-auditor` | [[System Maintenance & Review]] |

## The rhythms

```text
DAY       Start Day ─▶ work: issues, meetings, learning ─▶ End Day
WEEK      Start Week ─▶ the days ─▶ End Week
2 WEEKS   Bi-Monthly Inbox Sweep + periodic review
EVENT     New PAR · Start Issue · Complete Issue · End PAR · meeting · learning · new tag or property
IDLE      Contextual Capture Review · Out of the Inbox (one batch)
```

### The day

The day opens with [[WORKFLOWS - Start Day]]: I cross the bridge that yesterday left, ask the `task-planner` for candidates and write a short plan in the daily note. The day closes with [[WORKFLOWS - End Day]]: I log what I did, sweep the `#todo` flags of the notes I touched, offer the day's concepts to `/recall` and write the bridge for tomorrow, as [[The Hemingway Bridge]] says. Both are short; the work in between does the real tidying.

### The week

[[WORKFLOWS - Start Week]] picks one focus from the active PARs and the week's backlog, and books the PAR that gets a capture review. [[WORKFLOWS - End Week]] is the weekly spotlight: completed issues, rolled tasks, `/recall week`, old `#rfm` questions, stale issues and silent projects. It is the only weekly moment that looks at the system, and it stays at fifteen minutes.

### Work events

An issue opens with [[WORKFLOWS - Start Issue]]: context, short tasks, dependencies, the notes I will need. It closes with [[WORKFLOWS - Complete Issue]]: post-mortem, spin-off issues, new concepts, the journal entry and the move to `complete/`. A project or area starts with [[WORKFLOWS - New PAR]] and ends with [[WORKFLOWS - End PAR]], which runs the close protocol of the journal. Meetings go through `/parse-meeting` as [[The Meeting System]] defines.

### Learning and recall

[[WORKFLOWS - Learning Session]] is where the vault tidies itself while I learn. A new concept never lands alone: it enters an index or a MoC, so no orphan is born. The recall extends the concept, finds the thin indexes around it and climbs the `maturity` of the notes that pass it. The rules come from [[The Concept System]] and [[The Index and MoC System]].

### The notes lifecycle

The loop of [[The CODE system]] has its own workflows. [[WORKFLOWS - Out of the Inbox]] gives a note a home, one batch of five at a time. [[WORKFLOWS - Distillation of a Note]] raises one note to `distilled`. [[WORKFLOWS - Contextual Capture Review]] distills only what the current project needs. [[WORKFLOWS - Bi-Monthly Inbox Sweep]] is the safety net for all of them.

### System changes

A change to the engines passes a gate first: [[WORKFLOWS - New Tags & Types]] or [[WORKFLOWS - New Properties]]. After any change, the after-mod checklist of [[System Maintenance & Review]] runs, and its periodic review runs next to the sweep.

## Traces

- The journal logs completed issues, parsed meetings and PAR closes, through the `project-journaling` skill. Sweeps, distillations and reviews leave no journal entry.
- Deleted notes go to `.trash/`; the trash is the trace.
- The weekly note carries `cleanSystem: true` when the End Week spotlight ran.

## Related

- [[The Second Brain System]] — the index of every canonical note
- [[The CODE system]] — the notes lifecycle these workflows operate
- [[System Maintenance & Review]] — the audit loops of the engines
- [[Task Management]] — issues, the main source of work events
- [[The AI Guidance System]] — the commands and agents the workflows run
