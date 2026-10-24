---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - container|container]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-24 23:51
---
# [[maintenance-elements]]

> [!abstract] The parts inside the Maintenance System and how they connect
> - This is the inside of the Maintenance System box of [[maintenance]]. Me follows the Workflow notes; the AI agent runs the AI assets for Me, only when a workflow or I start them.
> - Workflow notes are the 17 notes in `11 - Projects/second-brain/_0_final/workflows/`. They run the AI assets: skills, agents, commands and scripts.
> - Signals are the Spotlight MoC and the queries and audits that it lists. They read the Vault notes and the Bases. The full list of signals is in the Spotlight children, not here.
> - Look for the nodes with the wip status: the Runbook is wip, Capture devices have no importer yet, and Test flow is wip until the test run passes.
> - The Runbook is the note [[System Maintenance & Review]], not a child diagram, so its node has no link.
> - A solid line is a link that works today. The dashed line is a manual path: today I move captures from the devices by hand.
> - Workflow notes, Signals and AI assets link to the notes that open them.
> - Test flow is the order in which I test the AI assets by hand, one situation per node of [[maintenance-elements-testflow]].

```pele
flowchart LR
  me([Me])
  agent([AI agent])
  devices([Capture devices])
  vault[(Vault notes)]
  bases[(Bases)]
  journals[(Journals)]
  subgraph sys[Maintenance System]
    wf[Workflow notes]
    runbook[Runbook<br/>System Maintenance & Review]
    signals[Signals<br/>Spotlight MoC]
    ai[AI assets]
    tf[Test flow]
  end
  me -- follows --> wf
  me -- reads --> signals
  wf -- run --> ai
  agent -- runs --> ai
  runbook -- runs --> signals
  signals -- read --> vault & bases
  bases -- query --> vault
  ai -- write --> vault & journals
  tf -- checks by hand --> ai
  devices -. via the inbox, by hand today .-> vault
  class wf done
  class runbook,devices wip
  click wf "maintenance-elements-rhythms"
  click signals "maintenance-elements-spotlight"
  click ai "maintenance-elements-ai"
  click tf "maintenance-elements-testflow"
```

## Details

- Workflow notes: 17 notes, all done, so the node carries `done`. [[maintenance-elements-rhythms]] orders them by Day, Week, Two weeks, Event and Idle; that note is wip only because it also draws the Periodic review of the Runbook.
- Signals: the Spotlight MoC has 16 rows, each with a signal and a workflow. [[maintenance-elements-spotlight]] shows the four groups and their children.
- Signals include the Engine audit (`audit.py`), the Kind audits, task-planner, Obsidian searches, `obsidian unresolved` and `vault-auditor`. The Spotlight children list them with the rows.
- Runbook: `System Maintenance & Review`, the after-change checklist and the periodic review. It runs the Engine audit. It is wip.
- AI assets: skills, agents, commands and scripts. [[maintenance-elements-ai]] shows the four kinds and the hierarchy. The assets write the Vault notes and the Journals only when a workflow runs them.
- The workflow commands and `spotlight.sh` are in the AI assets children, not here.
- Capture devices: the importers are wip (issue `_I00025`). Today I look at the devices by hand and the captures arrive in the inbox.
- Limit: a workflow works in small batches (5 notes, 15 minutes); the work found becomes an issue.
- Obsidian hosts the Vault notes and the Bases, as drawn in [[maintenance]].
- Test flow: [[maintenance-elements-testflow]], the situations of [[HOWTO - Test the AI tools]]. Its status follows the test run.
