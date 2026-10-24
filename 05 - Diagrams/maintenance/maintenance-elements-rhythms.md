---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - dynamic|dynamic]]"
tags: []
rate:
status: wip
maturity: capture
created: 2026-10-24 23:51
---
# [[maintenance-elements-rhythms]]

> [!abstract]
> This is the rhythms part of the Workflow notes in [[maintenance-elements]]. It shows when I run each workflow.
>
> - Day nests in Week. Two weeks adds the safety nets. Idle fills dead time. Event workflows start from a fact, not from the clock: they are in [[maintenance-elements-rhythms-event]].
> - Solid lines are the order of the workflows. Dashed lines are a handoff of data: the Hemingway bridge (the `Next:` step that End Day writes for the next Start Day), `cleanSystem: true` that End Week sets on the weekly note, and the journal that Complete Issue writes.
> - All workflow notes are done. Periodic review and the after-change checklist of the Event workflows (the runbook [[System Maintenance & Review]]) are wip.
> - The AI assets that each workflow runs are in [[maintenance-elements-ai]]. This diagram does not draw them.

```pele
flowchart LR
  subgraph week[Week]
    sw[Start Week] --> sd
    subgraph day[Day]
      sd[Start Day] --> work[Work: issues, meetings, learning] --> ed[End Day]
    end
    ed ==>|last day| ew[End Week]
    ew -.->|sets| clean[cleanSystem: true<br/>on the weekly note]
  end
  ed -.->|Hemingway bridge: Next| sd
  subgraph twoweeks[Two weeks]
    sweep[Sweep] ---|same two weeks| pr[Periodic review]
  end
  subgraph idle[Idle]
    cr[Capture Review]
    ooi[Out of the Inbox<br/>one batch]
    cr --> dist[Distillation of a Note]
  end
  work -.->|dead time| cr & ooi
  work -.->|a fact starts| event
  event[Event workflows]
  event -.->|Complete Issue writes| jr[(Journals)]
  click event "maintenance-elements-rhythms-event"
  class sw,sd,work,ed,ew,clean,sweep,cr,ooi,dist,jr done
  class pr wip
```

## Details

- Hemingway bridge: End Day writes the next step, `Next:`, so that Start Day can start without thinking. See [[The Hemingway Bridge]].
- Day: [[WORKFLOWS - Start Day]] takes 5 minutes and uses `task-planner`. [[WORKFLOWS - End Day]] takes 10 minutes and writes `Next:` in the Daily Log. Tomorrow's Start Day reads it.
- Week: [[WORKFLOWS - Start Week]] picks one focus and books one Capture Review for the PAR of the focus. Every second week it also books the Sweep. [[WORKFLOWS - End Week]] is the only weekly look at the system. It sets `cleanSystem: true` in the weekly note.
- Two weeks: [[WORKFLOWS - Bi-Monthly Inbox Sweep]] and the periodic review run in the same two weeks, side by side, with no order between them. The Sweep runs Out of the Inbox in batches of five until its time cap.
- Periodic review is the runbook [[System Maintenance & Review]]. It is a note, not yet a workflow, so it stays wip.
- Event: [[maintenance-elements-rhythms-event]] shows the workflows that start at a fact. An event starts during work, in any Day.
- Idle: [[WORKFLOWS - Contextual Capture Review]] and [[WORKFLOWS - Out of the Inbox]] fill dead time from Work. Out of the Inbox also runs inside the Sweep. Capture Review runs Distillation of a Note on the top captures of the active PAR.
- Limit: a workflow can start at any time its trigger is true.
