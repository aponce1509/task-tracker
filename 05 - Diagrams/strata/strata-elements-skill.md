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

> [!abstract] The note-diagram skill: design loop and build loop
> - This is the note-diagram skill of [[strata-elements]]: the rules and the loops that the Agent follows. It runs the strata CLI and edits the Diagram notes.
> - Design loop: the root agent talks with me and drafts the tree. After my approval, one `diagram-writer` per note writes in parallel. The `diagram-reviewer` then reads the tree cold, as I will, and its findings go back to the writers.
> - The fix rounds stop after two. The findings that are still open come to me with the reviewer's open questions, when I review the render in Obsidian.
> - Build loop: the build goes bottom-up, leaves first. A note is ready when all its children are `done` (or it has no children). The agent reads `tree --json` and gives each ready note to a parallel worker. The worker sets `wip` when it starts and `done` when the code works. Then the parents become ready and integrate their children.

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
    review{I review the render in Obsidian<br/>with the open findings. Agreed?}
    draft --> ok
    ok -->|no, my comments| draft
    ok -->|yes| new --> write --> check
    check -->|no, errors to the writer| write
    check -->|yes| rev
    rev -->|no, findings to the writer| write
    rev -->|yes, or two rounds done: open findings to me| review
    review -->|no, my comments| write
  end
  review -->|yes| plan
  subgraph build[Build loop - the code, leaves first]
    plan[Agent reads tree --json<br/>ready = all children done]
    work[One parallel worker per ready note<br/>sets wip, codes, sets done<br/>updates Details]
    more{Notes left<br/>not done?}
    plan --> work --> more
    more -->|yes, parents now ready| plan
  end
  more -->|no| fin([System built])
  click new "strata-elements-cli"
  click check "strata-elements-cli"
```

## Details

- Skill: `99 - Meta/skills/note-diagram/SKILL.md`, with the Pele syntax in `references/pele-syntax.md`.
- Agents: `99 - Meta/agents/diagram-writer.md` and `99 - Meta/agents/diagram-reviewer.md`, both on Sonnet (`model: sonnet` in the frontmatter).
- The reviewer gets only the project name and the changed notes, never the brief: it tests what a reader without the conversation understands.
- Fix rounds: at most two. After that the root agent shows me the open findings and the reviewer's questions.
- Work unit: a note with `status` other than `done` whose children are all `done`. Units without `click` links between them run in parallel; linked units go in link order.
- The worker owns the status of its note: `wip` at start, `done` when the code works, and the code paths in `## Details`.
- A parent is a unit again when its children are `done`, also when it has no code of its own (for example [[strata-elements]]). Its worker wires the children together, checks that the edges of the parent hold in the code, updates `## Details`, and sets `done`.
- Small changes of one or two notes, with no change to the tree, skip the agents.
- Spec: [[The Diagram System]].
