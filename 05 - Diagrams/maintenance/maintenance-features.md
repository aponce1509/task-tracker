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
> - Look at the colors: the load of the note-kind rules, the workflow commands, the capture devices, the after-change checklist and the periodic review are not done yet. The rest is done.
> - The commands that drive the done workflows (`/day`, `/weekly-review`, `/sweep`, `/new-system-element`) are tracked apart under "Run a workflow command". They stay wip until the test book passes.

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
    counts[Spotlight counts in one call]:::done
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
    existing[Run a note command]:::done
    workflow[Run a workflow command]:::wip
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
  click workflow "maintenance-elements-ai-commands"
  click scripts "maintenance-elements-ai-scripts"
```

## Details

- A feature is something I can do with the system, not a part of it; the parts are in [[maintenance-elements]]. Each row of the diagram is one area: Pele draws the areas one under the other. Without `direction TB` it makes one tall column of all nodes, which is worse, so I keep `direction TB`.
- Curation by use: `Out of the Inbox`, `Distillation of a Note`, `Contextual Capture Review`, `Learning Session` with `/recall`, `Start Issue` and `Complete Issue` with `/complete-issue`. `/start-issue` drives `Start Issue`, `/review-captures` drives `Contextual Capture Review` and `/todo-sweep` sweeps the todo lines. `Log completions in the journal` runs through `journal.sh` and the `project-journaling` skill. All link to [[maintenance-elements-rhythms]].
- Rhythms: `/day start|end`, `/weekly-review` and `/sweep` drive them. `Start Day`, `End Day`, `Start Week`, `End Week` and the `Bi-Monthly Inbox Sweep` (every two weeks) are done. `Periodic system review` is wip because its runbook, `System Maintenance & Review`, is wip. It links to [[maintenance-elements-spotlight-system]].
- `See what rots per row` is done: each spotlight row has a manual query or an audit (`audit.py`, the kind `audit.sh` scripts, `obsidian unresolved`). `Spotlight counts in one call` is done: `scripts/spotlight.sh` is read-only and gives the 16 rows in under 2 seconds. Links is counted only with `--links`. `/spotlight` itself is part of `Run a workflow command`.
- `Catch capture devices` is wip: the phone has an importer, the other devices are a manual look. Their importers wait for issue `_I00025`. It links to [[maintenance-elements-spotlight-notes]] because the Capture devices row lives there.
- `After-change checklist` is wip, not done: the gates `New Tags & Types` and `New Properties` are done, but the checklist lives in the runbook, which is wip. [[maintenance-elements-spotlight-system]] owns it.
- `Load note-kind rules` is wip: 8 skill files are still drafts. `Reach the vault from code` is done: it is `vault-bridge` and the vault MCP, which are not among the 8 drafts (`note-issue`, `note-concept`, `note-meeting`, `note-index-moc`, `note-diagram`, `note-syllabus`, `task-planner`, `project-journaling`). Both link to [[maintenance-elements-ai-skills]]. `Delegate a batch` links to [[maintenance-elements-ai-agents]].
- `Run a note command` is done for the 7 note commands: `/guide-inbox-clean`, `/guide-distillation`, `/recall`, `/parse-meeting`, `/create-issue`, `/new-concept`, `/new-syllabus` in `99 - Meta/commands/`.
- `Run a workflow command` is wip: the 12 workflow commands are written but have not passed the test book [[HOWTO - Test the AI tools]]. They are `/day`, `/weekly-review`, `/spotlight`, `/sweep`, `/start-issue`, `/complete-issue`, `/new-par`, `/close-par`, `/review-captures`, `/todo-sweep`, `/link-orphans`, `/new-system-element`. Both command features link to [[maintenance-elements-ai-commands]].
- `Script the writes` links to [[maintenance-elements-ai-scripts]]: `journal.sh`, `create-issue.sh`, `taxonomy.sh`, `sync-skills.sh`.
