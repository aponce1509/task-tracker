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
created: 2026-05-16 15:02
---
# [[WORKFLOWS - Bi-Monthly Inbox Sweep]]

> [!summary]
> The safety net, every two weeks. It empties the capture devices, purges what no longer matters, cleans the inbox in batches and runs the audits. The target is no inbox note older than two weeks, not inbox zero.

> [!info] Why not inbox zero
> The vault is untidy by design. A note captured this week can wait for its use. A note untouched for two weeks has no use coming, and the sweep decides on it.

**Trigger:** every second week, next to the periodic review of [[System Maintenance & Review]] · **Timecap:** 15 minutes for the inbox, the audits apart · **Driven by:** `/guide-inbox-clean`, the `vault-auditor` agent

## Steps

- Empty the capture devices into `09 - Inbox/`: phone, voice notes, Apple Notes.
- Purge: the `inbox-triager` proposes deletions among the `status: inbox` notes older than two weeks. I decide; deletions go to `.trash/`.
- Run [[WORKFLOWS - Out of the Inbox]] in batches of five until the timecap.
- Run the `vault-auditor` agent: engine audit, concept audit, index and MoC audit, guidance checks.
- Turn the top findings into issues with `/create-issue`, only the ones worth work. The rest waits for the next sweep.
- No journal entry.

## Tidies

- Inbox, capture devices, orphans, links, legacy marks, engines, AI guidance.
