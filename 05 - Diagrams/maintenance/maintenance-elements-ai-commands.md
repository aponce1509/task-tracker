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
# [[maintenance-elements-ai-commands]]

> [!abstract]
> This note opens the node "Commands" of [[maintenance-elements-ai]]. A command is a prompt that I start with a slash; it drives one workflow step. Left: the real commands (done), then below them the drafts (inbox) in three groups: Daily = P1, Weekly = P2, Event = P3. Each real command shows the workflow it drives and the skills it loads. Right: the agents they start, and the skill task-planner. Solid = starts today, dashed = the draft will start it.

```pele
flowchart LR
  subgraph real[Real commands - done]
    cc["/create-issue<br/>Start Issue, End Week<br/>skill: note-issue"]
    cp["/postmortem<br/>Complete Issue<br/>skill: project-journaling"]
    cn["/new-concept<br/>Learning Session<br/>skills: note-concept, note-index-moc"]
    cr["/recall<br/>End Day, End Week<br/>skill: note-concept"]
    cm["/parse-meeting<br/>Out of the Inbox<br/>skills: note-meeting, note-issue"]
    ci["/guide-inbox-clean<br/>Out of the Inbox, Sweep<br/>skill: obsidian-vault-notes"]
    cd["/guide-distillation<br/>Distillation, Capture Review<br/>skill: by note kind"]
    cs["/new-syllabus<br/>Start Module<br/>skill: note-syllabus"]
  end
  subgraph drafts[Command drafts - inbox]
    p1["P1 Daily<br/>/start-day, /end-day,<br/>/complete-issue, /spotlight"]
    p2["P2 Weekly<br/>/weekly-review, /review-captures,<br/>/todo-sweep, /sweep"]
    p3["P3 Event<br/>/start-issue, /new-par, /close-par,<br/>/link-orphans, /new-system-element"]
  end
  subgraph called[Agents and task-planner]
    tp[task-planner]
    it[inbox-triager]
    cdi[concept-distiller]
    nc[navigation-curator]
    me[meeting-extractor]
    va[vault-auditor]
  end
  cn --> cdi & nc
  cm --> me
  ci --> it
  p1 -.-> tp
  p2 -.-> tp & it & va
  p3 -.-> nc
  class cc,cp,cn,cr,cm,ci,cd,cs,tp,it,cdi,nc,me,va done
  class p1,p2,p3 inbox
```

## Details

- Real commands: `99 - Meta/commands/`. The skills are in the labels; see [[maintenance-elements-ai-skills]].
- Drafts: `11 - Projects/second-brain/_0_real_inbox/commands - tmp/`, one note per command, with `_overview.md`.
- P1 Daily
	- `/start-day`: Start Day; `task-planner`.
	- `/end-day`: End Day; offers `/recall today`, `/complete-issue`.
	- `/complete-issue`: Complete Issue; runs `/postmortem`.
	- `/spotlight`: read-only board; runs `spotlight.sh` (planned).
- P2 Weekly
	- `/weekly-review start|end`: Start Week, End Week; `task-planner`.
	- `/review-captures`: Capture Review; runs `/guide-distillation`.
	- `/todo-sweep`: `#todo` lines to issues; runs `/create-issue`.
	- `/sweep`: Sweep; `inbox-triager`, `vault-auditor`, `/guide-inbox-clean`, `/create-issue`.
- P3 Event
	- `/start-issue`: Start Issue; `note-issue`.
	- `/new-par`: New PAR; `project-journaling`.
	- `/close-par`: End PAR; `project-journaling`.
	- `/link-orphans`: `navigation-curator`, find then apply.
	- `/new-system-element`: New Tags & Types, New Properties; `taxonomy.sh`, `audit.py`.
- The open questions of the drafts stay in `_overview.md`.
