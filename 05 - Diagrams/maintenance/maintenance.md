---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - context|context]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-24 23:51
---
# [[maintenance]]

> [!abstract] Maintenance System: tidy where I walk
> - The Maintenance System keeps my untidy vault tidy without a separate chore: the workflow I follow tidies the notes it touches.
> - Three parts. Workflow notes are the steps I follow. Signals are what shows me what is untidy (the Spotlight MoC and the audits). AI assets are the skills, agents, commands and scripts that the AI agent (Claude Code, OpenCode) runs for me.
> - Look at who changes the vault notes: the workflows, and the AI assets only when a workflow or I run them. Signals only read. A solid line is a link that runs today; the dashed line is the manual capture path.
> - Two views go one level down: the [[maintenance-features|features]] (what I can do) and the [[maintenance-elements|elements]] (the parts and how they connect).

```pele
flowchart LR
  me([Me]) -- follows --> workflows
  me -- reads --> signals
  agent([AI agent<br/>Claude Code, OpenCode]) -- runs --> ai
  subgraph sys[Maintenance System]
    workflows[Workflow notes]:::done
    signals[Signals<br/>Spotlight MoC, audits]:::wip
    ai[AI assets<br/>skills, agents,<br/>commands, scripts]:::wip
  end
  workflows -- call --> ai
  workflows -- tidy the notes they touch --> vault[(Vault notes)]
  signals -- read --> vault
  ai -- write approved plans,<br/>issues, journals --> vault
  capture[Capture devices<br/>external, phone importer,<br/>the rest manual]:::wip -.-> |via the inbox| vault
  obsidian[Obsidian<br/>external app] -- hosts notes and bases --> vault
  features[Features<br/>what I can do]
  elements[Elements<br/>the parts]
  click features "maintenance-features"
  click elements "maintenance-elements"
  click workflows "maintenance-elements-rhythms"
  click signals "maintenance-elements-spotlight"
  click ai "maintenance-elements-ai"
```

## Details

- System definition: [[The Maintenance System]]. It names the spotlight rows, the workflow notes and the AI assets.
- Runbook for the after-change checklist and the periodic review: [[System Maintenance & Review]] (wip).
- The cycle of capture, curation and use that these workflows serve: [[The CODE system]].
- Tidy where I walk: only two safety nets walk the whole vault, the Bi-Monthly Inbox Sweep and the periodic review of the runbook. Both run every two weeks.
- Each batch is small and time-capped: 5 notes, 15 minutes. Real work that I find becomes an issue.
- The AI agent never tidies the vault alone. The workflow I follow, or a safety net, decides what it touches.
- Workflow notes: 17 notes in `11 - Projects/second-brain/_0_final/workflows/`, all done. Detail in [[maintenance-elements-rhythms|rhythms]].
- Signals: the Spotlight MoC is wip, the engine and kind audits are done. Detail in [[maintenance-elements-spotlight|spotlight]].
- AI assets: wip, because 8 skill files are still drafts and the workflow commands have not passed [[HOWTO - Test the AI tools]] yet. Detail in [[maintenance-elements-ai|AI assets]].
- Status: the 17 workflow notes are done, so the Workflow notes node carries `done`. The rhythms note it opens is wip only because it also draws the periodic review of the Runbook (System Maintenance & Review), which is wip.
- Features and Elements are navigation, not parts of the system: they have no edge.
- Limit: only the phone has an importer: `capture_import.py` brings the iPhone shares and the Apple Notes folder `Vault` into `06 - Inputs/Captures/` ([[HOWTO - Capture from the phone]]). The other devices wait for issue `_I00025`, and I look at them by hand.
