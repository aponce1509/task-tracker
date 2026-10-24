---
paras:
  - "[[second-brain]]"
type: "[[Architectures]]"
subtypes:
  - "[[Descriptive - Architectures - dynamic|dynamic]]"
tags: []
rate:
status: done
maturity: capture
created: 2026-10-24 12:00
---
# [[strata-elements-skill]]

> [!abstract] The iteration loop
> - The `note-diagram` skill makes the root agent the orchestrator: it talks with me, holds the context and drafts the tree.
> - `diagram-writer` agents write one note each, in parallel, from a brief with the whole context.
> - The `diagram-reviewer` reads the tree cold, as I will, and its findings go back to the writers before I review the render.
> - For implementation the agent reads `tree --json` and gives each leaf to a parallel worker.

```pele
flowchart TD
  ask([I ask for a system or a change]) --> draft
  subgraph design[Design loop - the diagrams]
    draft[Root agent drafts the tree<br/>names, subtypes, one line each]
    ok{I approve<br/>the tree?}
    new[strata new<br/>every note, parent first]
    write[diagram-writer per note<br/>in parallel, full brief]
    check{strata check<br/>clean?}
    rev{diagram-reviewer<br/>reads cold. Clear?}
    review{I review the render<br/>in Obsidian. Agreed?}
    draft --> ok
    ok -->|no, my comments| draft
    ok -->|yes| new --> write --> check
    check -->|no, errors to the writer| write
    check -->|yes| rev
    rev -->|no, findings to the writer| write
    rev -->|yes, or two rounds done| review
    review -->|no, my comments| write
  end
  review -->|yes| plan
  subgraph build[Build loop - the code]
    plan[Agent reads tree --json<br/>and picks the ready notes]
    work[One parallel worker per note<br/>wip, code, done, Details updated]
    more{Notes left<br/>not done?}
    plan --> work --> more
    more -->|yes, parents now ready| plan
  end
  more -->|no| fin([System built])
```

## Details

- Skill: `99 - Meta/skills/note-diagram/SKILL.md`, with the Pele syntax in `references/pele-syntax.md`.
- Agents: `99 - Meta/agents/diagram-writer.md` and `99 - Meta/agents/diagram-reviewer.md`, both on Opus.
- The reviewer gets only the project name, never the brief: it tests what a reader without the conversation understands.
- Small changes of one or two notes skip the agents.
- Spec: [[The Diagram System]].
