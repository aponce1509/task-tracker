---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - component|component]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-24 23:51
---
# [[maintenance-elements-spotlight]]

> [!abstract] The Spotlight MoC in one view: four groups of rows and the signals that show them
> - This note opens the node Spotlight MoC of [[maintenance-elements]]. It sums up the table "Under the spotlight" of [[The Maintenance System]]: 16 rows that rot when nobody looks.
> - The 16 rows sit in four groups: Notes, Knowledge, Work and System. Each group node lists its rows and opens a child note with the full line of each row: signal, then the workflow that clears it.
> - The left column is Signals: the kinds of query, audit and script that show a row. A line from a signal to a group means that at least one row of the group uses it.
> - Look for two things: every group has a signal that exists today, and the only manual signal (Manual look) feeds the Notes group, for its Capture devices row, until issue `_I00025` maps the importers.
> - A solid line means that the signal shows rows of the group, or that spotlight.sh reads or feeds something.
> - The node spotlight.sh is one script that reads the notes, runs the audits and prints the count of each row, for /spotlight, /day, /weekly-review and /sweep.

```pele
flowchart LR
  subgraph sig[Signals]
    searches[Obsidian searches<br/>and obsidian unresolved]
    kind[Kind audits]
    engine["Engine audit and taxonomy verify"]
    bases[Bases and Journal Log check]
    planner[task-planner]
    guide[AI guidance checks]
    manual[Manual look]
  end
  notes["Notes<br/>Inbox, Capture devices, Raw captures,<br/>References, Legacy marks, Links"]
  know["Knowledge<br/>Orphans, Thin indexes, Syllabi,<br/>Unrecalled concepts, Open flags"]
  work["Work<br/>Issues, PARs, Journals"]
  system["System<br/>Engines, AI guidance"]
  spot["spotlight.sh"]
  users["/spotlight, /day,<br/>/weekly-review, /sweep"]
  searches --> notes & know
  manual --> notes
  engine --> notes & work & system
  kind --> know
  bases & planner --> work
  guide --> system
  sig -- reads all --> spot
  spot -- counts for --> users
  class searches,kind,engine,bases,planner,guide,spot done
  class manual wip
  click notes "maintenance-elements-spotlight-notes"
  click know "maintenance-elements-spotlight-knowledge"
  click work "maintenance-elements-spotlight-work"
  click system "maintenance-elements-spotlight-system"
```

## Details

- Children: [[maintenance-elements-spotlight-notes]], [[maintenance-elements-spotlight-knowledge]], [[maintenance-elements-spotlight-work]], [[maintenance-elements-spotlight-system]]. Each owns the row-to-signal-to-workflow lines of its rows.
- Engine audit and taxonomy verify are `audit.py` and `taxonomy.sh verify`.
- AI guidance checks are `sync-skills.sh status` and the vault-auditor, an Agent (see [[maintenance-elements]]).
- All signals exist today (class done), except Manual look (wip): the Capture devices row has no query until `_I00025` is done.
- Row names in spotlight.sh: Open flags prints as Todo flags and Rfm flags; Legacy marks and Engines print together as Legacy and engines. Links is counted only with `--links`.
- spotlight.sh is `scripts/spotlight.sh`: bash, rg and awk over the frontmatter, the kind audits and `audit.py --quick` in parallel, under 2 seconds, never writes. `--links` adds `obsidian unresolved`; Capture devices stays a manual look.
- The group nodes take the status of their child notes.
- Safety nets: only the Bi-Monthly Inbox Sweep and the periodic review of System Maintenance & Review walk the whole vault. Both run every two weeks.
- Batches stay small: five notes, fifteen minutes, then stop.
- Real work found by a signal becomes an issue; I never fix it inside another workflow.
