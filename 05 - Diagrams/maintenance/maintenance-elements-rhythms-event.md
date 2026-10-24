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
created: 2026-10-25 00:08
---
# [[maintenance-elements-rhythms-event]]

> [!abstract]
> This is the Event group of [[maintenance-elements-rhythms]]. An event starts from a fact during work, not from the clock. There are three lanes.
>
> - Projects: the life of a PAR and its issues. Solid lines are the order. The dashed line is a handoff: Complete Issue writes the Journals.
> - Learning: one syllabus module, from start to end.
> - Facts: a meeting, a new tag or type, a new property. These have no order between them.
> - All workflows are done. The after-change checklist is in the runbook [[System Maintenance & Review]], which is still wip.

```pele
flowchart LR
  subgraph projects[Projects]
    np[New PAR] --> si[Start Issue] --> ci[Complete Issue] --> ep[End PAR]
  end
  subgraph learning[Learning]
    sm[Start Module] --> ls[Learning Session] --> em[End Module]
  end
  subgraph facts[Facts]
    meet[Meeting: /parse-meeting]
    nt[New Tags & Types]
    npr[New Properties]
  end
  jr[(Journals)]
  chk[After-change checklist]
  ci -.->|writes| jr
  meet -.->|writes| jr
  nt --> chk
  npr --> chk
  class np,si,ci,ep,sm,ls,em,meet,nt,npr,jr done
  class chk wip
```

## Details

- [[WORKFLOWS - New PAR]]: I create a project, area or resource with its PAR note.
- [[WORKFLOWS - Start Issue]]: I take an issue and set it to work.
- [[WORKFLOWS - Complete Issue]]: I close an issue, fill its post-mortem and log the completion in the journals through `journal.sh`. A lesson can start a Learning Session.
- [[WORKFLOWS - End PAR]]: I close or pause a project.
- [[WORKFLOWS - Start Module]] and [[WORKFLOWS - End Module]]: I open and close one week of a syllabus. Learning Session happens between them.
- [[WORKFLOWS - Learning Session]]: I turn what I learn into concepts.
- Meeting: the `/parse-meeting` command, not a workflow note. It makes take-aways, issues and a journal entry.
- [[WORKFLOWS - New Tags & Types]] and [[WORKFLOWS - New Properties]]: I change the taxonomy or the metadata framework. Then I run the after-change checklist of the runbook.
- The AI assets of each workflow are in [[maintenance-elements-ai]].
