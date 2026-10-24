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
> This note opens the node "Commands" of [[maintenance-elements-ai]]. A command is a prompt that I start with a slash; it drives one workflow. Left: the 19 commands in three groups. Note commands make or clean one kind of note. Rhythm commands run at the day, week and two-week beat. Event and on-demand commands answer one event, such as a new PAR, or run when a signal asks, such as the spotlight board. Each label shows the command and the workflow it drives. Right: what the commands start, the five agents, the skill task-planner and the script spotlight.sh. A line means "starts". Among the scripts, only spotlight.sh is drawn. Green = done: in use, or an agent, skill or script that exists. Yellow = written, and waiting for the test book. The skills of each command, the other script calls and the calls between commands are in Details only.

```pele
flowchart LR
  subgraph note[Note commands]
    cc["/create-issue<br/>any workflow, End Week"]
    cm["/parse-meeting<br/>Out of the Inbox"]
    cn["/new-concept<br/>Learning Session"]
    cr["/recall<br/>End Day, End Week"]
    ci["/guide-inbox-clean<br/>Out of the Inbox"]
    cd["/guide-distillation<br/>Distillation"]
    cs["/new-syllabus<br/>Start Module"]
  end
  subgraph rhythm[Rhythm commands]
    cday["/day start|end<br/>Start Day, End Day"]
    cw["/weekly-review start|end<br/>Start Week, End Week"]
    csw["/sweep<br/>Bi-Monthly Inbox Sweep"]
  end
  subgraph event[Event and on-demand commands]
    csp["/spotlight<br/>Spotlight board"]
    csi["/start-issue<br/>Start Issue"]
    cci["/complete-issue<br/>Complete Issue"]
    cnp["/new-par<br/>New PAR"]
    ccp["/close-par<br/>End PAR"]
    crc["/review-captures<br/>Contextual Capture Review"]
    cts["/todo-sweep<br/>#todo lines"]
    clo["/link-orphans<br/>Orphan links"]
    cse["/new-system-element<br/>New Tags & Types,<br/>New Properties"]
  end
  subgraph called[Started by the commands]
    tp[task-planner]
    sp[spotlight.sh]
    it[inbox-triager]
    cdi[concept-distiller]
    nc[navigation-curator]
    me[meeting-extractor]
    va[vault-auditor]
  end
  cm --> me
  cn --> cdi & nc
  ci --> it
  cday --> tp & sp
  cw --> tp & sp
  csp --> sp
  csw --> it & va & sp
  clo --> nc
  class cc,cm,cn,cr,ci,cd,cs,tp,sp,it,cdi,nc,me,va done
  class cday,cw,csp,csw,csi,cci,cnp,ccp,crc,cts,clo,cse wip
```

## Details

- Path: `99 - Meta/commands/`, one file per command. Test book: [[HOWTO - Test the AI tools]]. Skills: [[maintenance-elements-ai-skills]].
- Note commands (done)
	- `/create-issue`: `note-issue`.
	- `/parse-meeting`: `note-meeting`, `note-issue`, `project-journaling`; agent `meeting-extractor`.
	- `/new-concept`: `note-concept`, `note-index-moc`; agents `concept-distiller`, `navigation-curator`.
	- `/recall`: `note-concept`; `/recall today` or `/recall week`.
	- `/guide-inbox-clean`: `obsidian-vault-notes`, `note-issue`; agent `inbox-triager`.
	- `/guide-distillation`: skill by note kind.
	- `/new-syllabus`: `note-syllabus`.
- Rhythm commands (wip)
	- `/day start|end`: Start Day, End Day; `task-planner`, `spotlight.sh` (prints the Inbox row). End offers `/complete-issue`, `/todo-sweep today` and `/recall today`.
	- `/weekly-review start|end`: Start Week, End Week; `task-planner`, `spotlight.sh`. End offers `/recall week`.
	- `/sweep`: `inbox-triager`, `vault-auditor`, `spotlight.sh`; calls `/guide-inbox-clean` and `/create-issue`.
- Event and on-demand commands (wip)
	- `/spotlight`: read-only board; `spotlight.sh`, run on demand, no hook.
	- `/start-issue`: `note-issue`.
	- `/complete-issue`: `note-issue`, `project-journaling`, `journal.sh`; includes the post-mortem; calls `/create-issue`.
	- `/new-par`: `journal.sh new`; calls `/create-issue`.
	- `/close-par`: `journal.sh close`, `note-index-moc`.
	- `/review-captures`: runs `/guide-distillation`.
	- `/todo-sweep`: `#todo` lines to issues; calls `/create-issue`.
	- `/link-orphans`: `navigation-curator`, find then apply.
	- `/new-system-element`: `taxonomy.sh`, `audit.py`.
- Other scripts (not drawn)
	- `journal.sh`: `/complete-issue`, `/new-par`, `/close-par`, `/parse-meeting`; `/weekly-review end` reads it with `journal.sh show`.
	- `sync-skills.sh`: `/sweep`, through `vault-auditor`.
	- `taxonomy.sh`, `audit.py`: `/new-system-element`.
- Calls between commands
	- `/day` to `/complete-issue`, `/todo-sweep`, `/recall`.
	- `/weekly-review` to `/recall week`, `/create-issue`, `/complete-issue`, `/close-par`.
	- `/sweep` to `/guide-inbox-clean`, `/create-issue`.
	- `/close-par` to `/complete-issue`.
	- `/complete-issue` to `/todo-sweep`, `/new-concept`.
	- `/review-captures` to `/guide-distillation`.
	- `/complete-issue`, `/todo-sweep`, `/new-par` to `/create-issue`.
