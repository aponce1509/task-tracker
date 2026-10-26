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
# [[maintenance-elements-spotlight-notes]]

> [!abstract] The six Notes rows of the spotlight, each with its signal and the workflow that clears it
> - This note opens the node Notes of [[maintenance-elements-spotlight]]. It is the part of the Spotlight MoC about notes that rot: without a home, outside the vault, never distilled, or with dead links.
> - Read each line from left to right: the row, the signal that shows it, then the workflows that clear it. The source is the table "Under the spotlight" of [[The Maintenance System]].
> - Look for two things: the Sweep clears four of the six rows, so it is the safety net of this group; and Capture devices has only a Manual look (wip) until issue `_I00025` builds the importers.

```pele
flowchart LR
  subgraph rows[Row]
    inbox[Inbox]
    dev[Capture devices]
    raw[Raw captures]
    ref[References]
    leg[Legacy marks]
    lnk[Links]
  end
  subgraph sig[Signal]
    s1["status:inbox search,<br/>oldest first"]
    s2[Manual look]
    s3["maturity:capture search<br/>in a PAR"]
    s4["maturity:capture search<br/>in 06 - Inputs"]
    s5[Engine audit]
    s6[obsidian unresolved]
  end
  subgraph wf[Cleared by]
    w1[Out of the Inbox]
    w2[Sweep]
    w3[Capture Review]
    w4[Distillation]
    w5[Any workflow, on sight]
  end
  inbox --> s1
  dev --> s2
  raw --> s3
  ref --> s4
  leg --> s5
  lnk --> s6
  s1 --> w1 & w2
  s2 --> w2
  s3 --> w3 & w4
  s4 --> w1 & w4
  s5 --> w5 & w2
  s6 --> w2
  class inbox,raw,ref,leg,lnk,s1,s3,s4,s5,s6,w1,w2,w3,w4,w5 done
  class dev,s2 wip
```

## Details

- Source: the table "Under the spotlight" of [[The Maintenance System]]. Workflows: [[WORKFLOWS - Out of the Inbox]], [[WORKFLOWS - Bi-Monthly Inbox Sweep]] (Sweep), [[WORKFLOWS - Contextual Capture Review]] (Capture Review), [[WORKFLOWS - Distillation of a Note]] (Distillation).
- Inbox: notes without a home. Signal `["status":inbox]`, oldest first.
- Capture devices: phone, voice notes and Apple Notes outside the vault. The phone importer brings the iPhone shares and the Apple Notes folder `Vault` in; the other devices have only a Manual look, and only the Sweep clears them. Issue `_I00025` maps the devices and defines their importers, so this row stays wip.
- Raw captures: placed notes never distilled. Signal `["maturity":capture] ["paras":"[[<par>]]"]`.
- References: notes in `06 - Inputs` without source, commentary or a PAR that uses them. Signal `path:"06 - Inputs" ["maturity":capture]`.
- Legacy marks: `#_*` tags, forbidden keys and untyped notes. The Engine audit is `99 - Meta/skills/system-reference-maintance/scripts/audit.py`. I migrate a mark on sight in any workflow, and the Sweep catches the rest.
- Links: unresolved and dead links. Signal `obsidian unresolved`.
- `scripts/spotlight.sh` prints the counts of all rows (see [[maintenance-elements-spotlight]]); `/spotlight` shows them.
- Real work found by a signal becomes an issue.
