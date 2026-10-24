---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - component|component]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-25 00:00
---
# [[maintenance-elements-spotlight-work]]

> [!abstract] The Work group of the spotlight: Issues, PARs and Journals, each with its signal and the workflow that clears it
> - This note opens the node Work of [[maintenance-elements-spotlight]]. It shows three rows of the table "Under the spotlight" of [[The Maintenance System]].
> - Read from left to right: the row that rots, the signal that shows it, the workflow that clears it.
> - Look for two things: each row has a signal that exists today, and Complete Issue and End Week appear in more than one row.
> - All rows, signals and workflows here are done. The signals are queries and checks I run; none of them changes a note.

```pele
flowchart LR
  subgraph rows[Rows]
    issues["Issues<br/>stale wip, done outside complete/,<br/>resolved dependencies still blocking"]
    pars["PARs<br/>active without progress,<br/>closed but still active"]
    journals["Journals<br/>completed issues and parsed<br/>meetings not logged"]
  end
  subgraph sig[Signals]
    planner[task-planner]
    ibases[Issue bases]
    rule[Audit done-rule]
    pbase[Active Projects view<br/>of the PAR base]
    jlog[Journal Log against<br/>08 - Issues/complete/]
  end
  subgraph wf[Cleared by]
    si[Start Issue]
    ci[Complete Issue]
    ew[End Week]
    np[New PAR]
    ep[End PAR]
    pm["/parse-meeting"]
  end
  issues --> planner & ibases & rule
  pars --> pbase
  journals --> jlog
  planner & ibases & rule --> si & ci & ew
  pbase --> np & ep & ew
  jlog --> ci & pm
  class issues,pars,journals,planner,ibases,rule,pbase,jlog,si,ci,ew,np,ep,pm done
```

## Details

- Issues: the signal comes from three sources. `task-planner` lists open issues with dependencies. The issue bases show stale `wip` issues. The done-rule of `99 - Meta/skills/system-reference-maintance/scripts/audit.py` finds done issues outside `08 - Issues/complete/`.
- PARs: the Active Projects view of the PAR base shows projects without progress and closed projects that stay active.
- Journals: I compare the Journal Log of the project with `08 - Issues/complete/`. A missing entry is a completed issue or a parsed meeting that I did not log.
- Complete Issue logs the journal entry (`project-journaling`, `journal.sh`), so it clears Issues and Journals. `/parse-meeting` logs a meeting.
- End Week looks at stale issues and silent projects. It is the weekly spotlight.
- The edges from a signal to the workflows are the union of the workflows of its row. The table does not link one signal to one workflow.
- Parent: [[maintenance-elements-spotlight]]. Siblings: [[maintenance-elements-spotlight-notes]], [[maintenance-elements-spotlight-knowledge]], [[maintenance-elements-spotlight-system]].
