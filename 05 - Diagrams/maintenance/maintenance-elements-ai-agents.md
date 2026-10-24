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
# [[maintenance-elements-ai-agents]]

> [!abstract] Agents of the AI assets
> - This is the "Agents" part of [[maintenance-elements-ai]]: the 7 subagents in `99 - Meta/agents/`.
> - Left: what starts each agent (a command, a skill or a workflow). Middle: the agent. Right: what it reads and writes.
> - Read-only agents (label read-only) never write a note. Writer agents write only an approved plan that the caller passes in the prompt.
> - navigation-curator and meeting-extractor write only in apply mode; without a plan they return proposals.
> - A solid line means starts or returns. All lines are solid.
> - All 7 agents are done.

```pele
flowchart LR
  c1["/new-concept"]
  c2["/parse-meeting"]
  c3["/guide-inbox-clean"]
  s1[note-diagram skill]
  w1[Sweep and Runbook]
  cd[concept-distiller<br/>writer]
  nc[navigation-curator<br/>writer, apply mode]
  me[meeting-extractor<br/>writer, apply mode]
  dw[diagram-writer<br/>writer]
  it[inbox-triager<br/>read-only]
  va[vault-auditor<br/>read-only]
  dr[diagram-reviewer<br/>read-only]
  c1 --> cd
  c1 --> nc
  c2 --> me
  c3 --> it
  s1 --> dw
  s1 --> dr
  w1 --> va
  cd --> o1[Reads source and graph<br/>Writes one concept note]
  nc --> o2[Reads both kind audits<br/>Writes indexes and MoCs]
  me --> o3[Reads the meeting note<br/>Writes callouts and take-aways]
  dw --> o4[Reads brief and ancestors<br/>Writes one diagram note]
  it --> o5[Reads inbox notes, PAR notes, taxonomy<br/>Returns proposals]
  va --> o6[Runs the audits, reads guidance<br/>Returns findings]
  dr --> o7[Reads the diagram tree<br/>Returns findings]
  class c1,c2,c3,s1,w1,cd,nc,me,dw,it,va,dr,o1,o2,o3,o4,o5,o6,o7 done
```

## Details

- Models: `model: sonnet` in the frontmatter of each agent for Claude Code. `opencode.json` (`agent.<name>.model`) overrides it for OpenCode: `glm-5.3-flash` for concept-distiller, inbox-triager, meeting-extractor and navigation-curator; `claude-sonnet-5-5` for the diagram agents.
- Read-only: inbox-triager, vault-auditor and diagram-reviewer have `disallowedTools: Write, Edit, NotebookEdit` and `permission: edit: deny`.
- concept-distiller: one instance per `[new]` concept of the creation graph, in parallel. It never edits another note.
- navigation-curator: two modes. Find (no plan) runs the audits of note-concept and note-index-moc and returns a tree of proposals. Apply (approved plan) edits the navigation notes.
- meeting-extractor: two modes. Propose (default) writes nothing. Apply writes the callouts and take-aways. The caller creates the issues and logs the journal.
- inbox-triager: takes a list of paths, or the 5 oldest inbox notes. The caller applies the approved fixes note by note.
- vault-auditor: runs `audit.py`, the kind audits and `sync-skills.sh status`, and checks the guidance by reading. No command starts it; the Sweep and the periodic review of the Runbook use it.
- diagram-writer and diagram-reviewer: started by the `note-diagram` skill, not by a command. The writer writes one note per instance; the reviewer reads the tree cold.
- /new-concept also starts navigation-curator in apply mode after all concepts exist.
- Every agent starts with no context: the caller passes the plan, the paths and the PAR in the prompt.
