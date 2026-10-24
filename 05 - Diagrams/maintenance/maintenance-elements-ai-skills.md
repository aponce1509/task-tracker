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
# [[maintenance-elements-ai-skills]]

> [!abstract] The skills: 11 in the vault, vault-bridge, obsidian-cli, and the workflows that load them
> - This is the Skills node of [[maintenance-elements-ai]]. A skill is text that the AI agent loads to apply a rule of the vault. Four groups: Router and style, Note kinds, System, Bridge. Yellow = the skill file is still a draft. All arrows are solid: loads or starts.
> - On the left, the workflow groups. An arrow to a group means that the workflows of the group load a skill of it. Read from the left to see which skill a step needs.
> - Four skills start agents (node Agents, the subagents of `99 - Meta/agents/`): note-diagram starts diagram-writer and diagram-reviewer; note-meeting hands long dumps to meeting-extractor; note-concept hands notes to concept-distiller, and note-index-moc to navigation-curator.
> - All skills exist. Eight of them still carry `status: draft` in their file, so this note is wip.

```pele
flowchart LR
  subgraph wf[Workflows]
    wday[Day and Week]
    wiss[Issues and PARs]
    wlrn[Learning]
    wibx[Inbox and notes]
    wsys[System changes and review]
  end
  subgraph rs[Router and style]
    ovn[obsidian-vault-notes]
    mde[markdown-editing]
  end
  subgraph nk[Note kinds]
    nis[note-issue]
    nsy[note-syllabus]
    nco[note-concept]
    nmo[note-index-moc]
    nme[note-meeting]
    ndi[note-diagram]
  end
  subgraph sy[System]
    tpl[task-planner]
    pjo[project-journaling]
    srm[system-reference-maintance]
  end
  subgraph br[Bridge]
    vbr[vault-bridge]
    ocl[obsidian-cli]
  end
  agt[Agents]
  wday --> tpl
  wiss --> nis & pjo
  wlrn --> nsy
  wibx --> nk
  wsys --> ovn & srm
  nco --> agt
  nmo --> agt
  nco --> nmo
  nme --> agt
  ndi --> agt
  tpl --> ocl
  vbr --> ocl
  class ovn,mde,srm,vbr,ocl done
  class nis,nsy,nco,nmo,nme,ndi,tpl,pjo wip
  class agt done
```

## Details

- Source of each skill: `99 - Meta/skills/<name>/SKILL.md`. The harness views `.claude/skills/` and `.opencode/skills/` are symlinks to that folder (see [[maintenance-elements-ai]]).
- Day and Week: Start Day, Start Week and End Week load task-planner. End Day and End Week also run `/recall` and `/create-issue` (see [[maintenance-elements-ai-commands]]).
- Issues and PARs: Start Issue loads note-issue. Complete Issue and End PAR load project-journaling (`journal.sh`). New PAR uses the PARA template and `/create-issue`.
- Learning: Start Module and End Module load note-syllabus. Learning Session runs `/new-concept` and `/recall`, which load note-concept.
- Inbox and notes: Out of the Inbox, Distillation, Capture Review and the Sweep load the skill of the kind of each note they touch. Format and typos come from the kind skill.
- System changes: New Tags & Types and New Properties load obsidian-vault-notes. The taxonomy goes through `taxonomy.sh`.
- System changes and review: the Runbook ([[System Maintenance & Review]]) loads system-reference-maintance, which runs `audit.py`. The Sweep runs vault-auditor for the same audit.
- obsidian-vault-notes is the router: every note-kind skill names it for the shared rules. markdown-editing is mandatory for any Markdown file and no workflow names it.
- The vault has 11 skills in `99 - Meta/skills/` plus vault-bridge, 12 folders. vault-bridge is the only global skill that lives in the vault. obsidian-cli is installed globally, outside the vault, in `~/.agents/skills/obsidian-cli/`; skills use it for search, bases and daily notes.
- Limit: the workflow edges are by group. A step loads a skill only when its workflow note names it.
- Agents: see [[maintenance-elements-ai-agents]] for who starts each one.
