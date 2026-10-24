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
created: 2026-10-25 00:00
---
# [[maintenance-elements-spotlight-system]]

> [!abstract] Group System: the two rows that watch the engines and the AI guidance
> - This note opens the node System of [[maintenance-elements-spotlight]]. It has two rows of the table "Under the spotlight" of [[The Maintenance System]]: Engines and AI guidance.
> - Read each line from left to right: the row, the signal that shows it, the workflow that clears it. Engines has two signals and three workflows. AI guidance has two signals and one workflow.
> - The box at the bottom is the after-change checklist of the Runbook ([[System Maintenance & Review]]). It runs after every change to the system, and it ends with a run of the engine audit.
> - Solid lines go from a row to its signal and from a signal to the workflow that clears it. The dashed line means the checklist ends with a run of the audit. Bi-Monthly means every two weeks.
> - Look for the status: every signal exists today. The Periodic review and the after-change checklist are wip, because the Runbook is wip.

```pele
flowchart LR
  subgraph rows[Rows]
    eng["Engines<br/>taxonomy, classes, bases<br/>and cheatsheet out of sync"]
    gui["AI guidance<br/>harness views off, broken<br/>skill frontmatter, dead paths"]
  end
  subgraph sig[Signals]
    audit[audit.py]
    tax[taxonomy.sh verify]
    sync[sync-skills.sh status]
    va[vault-auditor]
  end
  subgraph wf[Cleared by]
    review[Periodic review]
    tags[New Tags & Types]
    props[New Properties]
  end
  check["After-change checklist<br/>(Runbook)"]
  eng --> audit & tax
  gui --> sync & va
  audit & tax --> review & tags & props
  sync & va --> review
  tags & props --> check
  check -. closes with .-> audit
  class audit,tax,sync,va,tags,props done
  class review,check wip
```

## Details

- Engines: `audit.py` is `99 - Meta/skills/system-reference-maintance/scripts/audit.py`. `taxonomy.sh verify` is `.obsidian/personal_scripts/taxonomy.sh`; it is read-only, so it is a signal here and not a fix. It expects "generated notes: all expected files exist" and "orphans: none".
- AI guidance: `sync-skills.sh status` is `scripts/sync-skills.sh`; it checks the harness views `.claude/` and `.opencode/`. The vault-auditor agent reads skills, agents and commands and finds broken frontmatter and dead paths (see [[The AI Guidance System]]).
- Only the Periodic review clears AI guidance. New Tags & Types and New Properties are the gates for a change to the engines.
- After-change checklist, in order: update [[Search & Base Queries Reference]] when a base or recipe changed; update the schemas note and the class in `99 - Meta/Class/` when properties changed; use `taxonomy.sh` only for taxonomy; register a tag in [[Tag System & Ontology]]; append a new canonical note to the index; append the AGENTS.md status log; run the review.
- Periodic review runs every two weeks, in the same two weeks as the Bi-Monthly Inbox Sweep. Its Runbook is wip, so the node is wip.
- A finding that is real work becomes an issue through `create-issue.sh`; I do not fix it inside the review.
