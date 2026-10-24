---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - features|features]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-24 23:51
---
# [[maintenance-features]]

> [!abstract] What the Maintenance System does
> - The features of [[maintenance]], grouped by area: what I do to keep the vault tidy, each with its status. The parts that do the work are in [[maintenance-elements]].
> - The idea is "tidy where I walk": the workflow I follow tidies the notes it touches. So most features are curation by use, not a separate chore.
> - Areas: Curation by use (workflows that tidy a note when I use it), Rhythms (each day, week and two weeks), Spotlight (how I see what rots), System changes (gates for a new tag, type or property) and AI assets (the skills, agents, commands and scripts that run the workflows). The commands are in AI assets.
> - Curation by use and the two gates drill down to [[maintenance-elements-rhythms]]. The after-change checklist and the periodic review drill down to [[maintenance-elements-spotlight-system]]. Each AI feature links to its asset note under [[maintenance-elements-ai]]. The diagram has no lines: a node is a feature, not a step.
> - Look at the colors: the load of the skill rules, the command drafts, the one-call spotlight counts, the capture devices, the after-change checklist and the periodic review are not done yet. The rest is done.
> - P1, P2 and P3 are the priorities of the command drafts: Daily = P1, Weekly = P2, Event = P3.

```pele
flowchart LR
  subgraph curation[Curation by use]
    direction TB
    inboxhome[Give an inbox note a home]:::done
    distill[Distill a note]:::done
    captures[Review a project's captures]:::done
    learn[Learn and recall a concept]:::done
    issue[Open and close an issue with lessons]:::done
    journal[Log completions in the journal]:::done
  end
  subgraph rhythms[Rhythms]
    direction TB
    day[Plan and close the day]:::done
    week[Plan and close the week]:::done
    sweep[Two-week sweep]:::done
    review[Periodic system review]:::wip
  end
  subgraph spotlight[Spotlight]
    direction TB
    rows[See what rots per row]:::done
    counts[Spotlight counts in one call]:::inbox
    devices[Catch capture devices]:::wip
  end
  subgraph changes[System changes]
    direction TB
    tags[Gate a new tag or type]:::done
    props[Gate a new property]:::done
    afterchange[After-change checklist]:::wip
  end
  subgraph ai[AI assets]
    direction TB
    skills[Load note-kind rules]:::wip
    bridge[Reach the vault from code]:::done
    agents[Delegate a batch]:::done
    existing[Run a command]:::done
    drafts[Command drafts<br/>P1 daily, P2 weekly, P3 event]:::inbox
    scripts[Script the writes]:::done
  end
  click inboxhome "maintenance-elements-rhythms"
  click distill "maintenance-elements-rhythms"
  click captures "maintenance-elements-rhythms"
  click learn "maintenance-elements-rhythms"
  click issue "maintenance-elements-rhythms"
  click journal "maintenance-elements-rhythms"
  click day "maintenance-elements-rhythms"
  click week "maintenance-elements-rhythms"
  click sweep "maintenance-elements-rhythms"
  click review "maintenance-elements-spotlight-system"
  click rows "maintenance-elements-spotlight"
  click counts "maintenance-elements-spotlight"
  click devices "maintenance-elements-spotlight-notes"
  click tags "maintenance-elements-rhythms"
  click props "maintenance-elements-rhythms"
  click afterchange "maintenance-elements-spotlight-system"
  click skills "maintenance-elements-ai-skills"
  click bridge "maintenance-elements-ai-skills"
  click agents "maintenance-elements-ai-agents"
  click existing "maintenance-elements-ai-commands"
  click drafts "maintenance-elements-ai-commands"
  click scripts "maintenance-elements-ai-scripts"
```

## Details

- A feature is something I can do with the system, not a part of it; the parts are in [[maintenance-elements]]. Each row of the diagram is one area: Pele draws the areas one under the other. Without `direction TB` it makes one tall column of all nodes, which is worse, so I keep `direction TB`.
- Curation by use: `Out of the Inbox`, `Distillation of a Note`, `Contextual Capture Review`, `Learning Session` with `/recall`, `Start Issue` and `Complete Issue` with `/postmortem`. `Log completions in the journal` runs through `journal.sh` and the `project-journaling` skill. All link to [[maintenance-elements-rhythms]].
- Rhythms: `Start Day`, `End Day`, `Start Week`, `End Week` and the `Bi-Monthly Inbox Sweep` (every two weeks) are done. `Periodic system review` is wip because its runbook, `System Maintenance & Review`, is wip. It links to [[maintenance-elements-spotlight-system]].
- `See what rots per row` is done: each spotlight row has a manual query or an audit (`audit.py`, the kind `audit.sh` scripts, `obsidian unresolved`). `Spotlight counts in one call` is inbox: `spotlight.sh` and `/spotlight` are only drawn.
- `Catch capture devices` is wip: today it is a manual look. The importers wait for issue `_I00025`. It links to [[maintenance-elements-spotlight-notes]].
- `After-change checklist` is wip, not done: the gates `New Tags & Types` and `New Properties` are done, but the checklist lives in the runbook, which is wip. [[maintenance-elements-spotlight-system]] owns it.
- `Load note-kind rules` is wip: 8 skill files are still drafts. `Reach the vault from code` is `vault-bridge` and the vault MCP. Both link to [[maintenance-elements-ai-skills]]. `Delegate a batch` links to [[maintenance-elements-ai-agents]].
- `Run a command` is done: `/guide-inbox-clean`, `/guide-distillation`, `/recall`, `/parse-meeting`, `/postmortem`, `/create-issue`, `/new-concept`, `/new-syllabus` in `99 - Meta/commands/`. `Command drafts` are in `_0_real_inbox/commands - tmp/` and are inbox. Both link to [[maintenance-elements-ai-commands]].
- `Script the writes` links to [[maintenance-elements-ai-scripts]]: `journal.sh`, `create-issue.sh`, `taxonomy.sh`, `sync-skills.sh`.
