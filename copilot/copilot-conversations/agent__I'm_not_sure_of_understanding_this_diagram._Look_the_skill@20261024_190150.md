---
epoch: 1792861310421
mode: agent
backendId: claude
sessionId: "13d12f23-ab81-4339-9e70-6d90470a94ed"
agentLabel: "I'm not sure of understanding this diagram. Look the skill i…"
tags:
  - copilot-conversation
usage: '{"usedTokens":36665,"contextWindow":1000000,"inputTokens":2,"outputTokens":2,"cacheReadTokens":35688,"cacheWriteTokens":973,"updatedAt":1792861567869}'
---

**user**: I'm not sure of understanding this diagram. Look the skill implemented
[Timestamp: 2026/10/24 19:01:50]

**ai**: The diagram is a state machine of the working loop between you and the agent when you design a system with diagrams. Each state is a step in `99 - Meta/skills/note-diagram/SKILL.md`.

| State | What happens | Skill section |
|---|---|---|
| **Ask** | You ask to describe or design something. The agent loads `note-diagram` and reads the spec, `The Diagram System`. | Flow 1–2 (context, draft the tree) |
| **Edit** | The agent creates notes with `strata new <name>` (parent first). It fills `paras`, `subtypes` and the body, then draws the Pele diagram. It adds `click` links to nodes that have their own note. | Flow 3–4 |
| **Check** | The agent runs `strata check "05 - Diagrams/<project>"`. If there are errors, it goes back to Edit. | Flow 5 |
| **Review** | The check is clean, so the render in Obsidian is clean too. You look at the render. | Flow 6 |
| **Plan** | You and the agent agree the diagrams are right. The agent reads `strata tree <project> --json`. A work unit is a note whose status isn't `done` and whose children are all `done`, or that has no children. | "Planning from the tree" 1–3 |
| **Build** | Each independent unit (no `click` links between units) goes to its own parallel worker. A worker sets `status: wip`, writes the code, then sets `done` and puts the code paths in `## Details`. Linked units run in link order. | "Planning from the tree" 4–5 |

The two loops:
- **Design loop:** Ask → Edit → Check → (errors → Edit) → Review → (change requested → Ask).
- **Build loop:** Review → Plan → Build → Edit → Check → ... → Build → end. After building, the diagram goes back to Edit because the workers changed `status` and `## Details`. The diagram is the source of truth for the plan, so it must reflect what the code does. A parent note becomes a work unit again once all its children are `done`, to integrate them.

Two things may be confusing:
- **Edit is used twice.** It means both "the agent draws" at the start and "the workers update status and details" after building.
- **The `Build --> Edit` and `Build --> [*]` arrows are not labeled with a condition.** You could label the first one "units remain or parent now ready", and the second one "all notes `done`". Say so and I'll add them.
[Timestamp: 2026/10/24 19:01:50]

**user**: Maybe we can make this clearer?
[Timestamp: 2026/10/24 19:03:46]

**ai**: I rewrote the diagram in `05 - Diagrams/strata/strata-skill.md`, but I couldn't run `strata check`. `node` isn't on the PATH in this shell, so the new syntax is unchecked. Run `node .obsidian/plugins/strata/strata.mjs check "05 - Diagrams/strata"` yourself, or open the note in Obsidian to see whether it renders.

What changed:
- **Flowchart instead of a state machine.** The states were bare words like `Ask`, `Edit` and `Plan`. They are now steps that say who acts and what they do, for example "Agent loads note-diagram and edits the notes".
- **Two labeled groups.** "Design loop - the diagrams" holds draw, check and review. "Build loop - the code" holds plan, workers and the "notes left?" test.
- **Decisions are diamonds.** The checks ("`strata check` clean?", "Agreed?", "Notes left not done?") now have `yes` and `no` branches. Before, the arrows only carried loose labels.
- **Clear start and end.** The flow begins at "I ask for a system or a change" and ends at "System built".
- **The `Build → Edit` arrow is gone.** The worker step now says "wip, code, done, Details updated". The loop back is "yes, parents now ready", which goes to plan, because a parent only becomes ready once its children are done.

The abstract callout at the top of the note is unchanged.
[Timestamp: 2026/10/24 19:03:46]

**user**: now, about the build loop explain it to me in bullet points
[Timestamp: 2026/10/24 19:05:50]

**ai**: The build loop starts once you've agreed the diagrams. It turns the diagram tree into code, one layer at a time.

**1. Plan: the agent picks the ready notes**
- It runs `strata tree <project> --json` to get the hierarchy, statuses and links.
- A note is ready (a work unit) if its `status` isn't `done` and either all its children are `done` or it has no children.
- On the first pass these are the leaves of the tree, the most detailed notes.

**2. Work: one parallel worker per note**
- Notes with no `click` links between them are independent, so each gets its own worker and they run in parallel.
- Notes that link to each other go in link order.
- Each worker gets three things:
  - its own note
  - its ancestor notes, for context
  - its `## Details` section
- A worker sets `status: wip` when it starts. It writes the code, then sets `status: done` and records the code paths in `## Details`.

**3. Decision: are there notes left that aren't `done`?**
- **Yes:** go back to Plan. Finishing the leaves makes their parents ready, because all of a parent's children are now `done`. The parent's worker integrates the children's code, and the loop repeats up the tree.
- **No:** the root is `done`, so the system is built.

The loop works bottom-up, leaves first, then the parents that integrate them. The `status` field is the shared state, which is why the skill says never to mark something `done` that the code doesn't do yet. A wrong `done` makes the planner start a parent too early.
[Timestamp: 2026/10/24 19:05:50]