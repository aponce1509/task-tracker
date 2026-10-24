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
created: 2026-10-25 01:00
---
# [[maintenance-elements-testflow]]

> [!abstract]
> This is the Test flow of the AI assets in [[maintenance-elements]]. It shows the order in which I test them. One node is one situation of the test book [[HOWTO - Test the AI tools]]: one simulated week on the throwaway project `test-bench`.
>
> - Solid lines are the order of the week. Each situation leaves the vault in the state that the next one needs. Dashed lines are a state that a later situation needs, with the thing that it needs. The situations X1 to X3 run at any time and have no line.
> - Colors: inbox = not run, done = passed, blocked = failed and has an issue. All nodes are inbox until I run them.
> - I mark a node done when its checkbox in the test book passes.

```pele
flowchart TB
  subgraph setup[Setup]
    S01["S01 Harness loads<br/>sync-skills.sh"] --> S02["S02 Board before<br/>/spotlight"]
  end
  subgraph monday[Monday]
    S03["S03 New project<br/>/new-par"] --> S04["S04 Plan the week<br/>/weekly-review start"] --> S05["S05 Plan the day<br/>/day"]
  end
  subgraph work[Work day]
    S06["S06 Vague idea<br/>/create-issue"] --> S07["S07 Blocked issue<br/>/start-issue"] --> S08["S08 Free issue<br/>/start-issue"] --> S09["S09 Meeting<br/>/parse-meeting"] --> S10["S10 Learn from a source<br/>/new-concept"] --> S11["S11 Free slot<br/>/guide-inbox-clean"] --> S12["S12 Close the day<br/>/day end"] --> S12b["S12b Recall<br/>/recall today"]
  end
  subgraph events[Events]
    S13["S13 Last task done<br/>/complete-issue"] --> S14["S14 Project switch<br/>/review-captures"] --> S15["S15 Orphans<br/>/link-orphans"] --> S16["S16 New tag<br/>/new-system-element"] --> S17["S17 Learning project<br/>/new-syllabus"]
  end
  subgraph friday[Friday]
    S18["S18 Weekly spotlight<br/>/weekly-review end"]
  end
  subgraph two[Two weeks]
    S19["S19 Sweep<br/>/sweep"] --> S20["S20 Periodic review<br/>system-reference-maintance"]
  end
  subgraph close[Close]
    S21["S21 Project ends<br/>/close-par"] --> S22["S22 Clean up<br/>spotlight.sh, audit.py"]
  end
  subgraph any[Any time]
    X1["X1 From a code repo<br/>vault-bridge"]
    X2["X2 Diagrams<br/>strata check"]
    X3["X3 Guardrails<br/>agents without a plan"]
  end
  S02 --> S03
  S05 --> S06
  S12b --> S13
  S17 --> S18
  S18 --> S19
  S20 --> S21
  S03 -.->|issue A exists| S06
  S06 -.->|B depends on A| S07
  S08 -.->|A is wip| S13
  S07 -.->|B open| S21
  S09 -.->|C open| S21
  S10 -.->|concepts to recall| S12b
  S02 -.->|baseline board| S22
  class S01,S02,S03,S04,S05,S06,S07,S08,S09,S10,S11,S12,S12b,S13,S14,S15,S16,S17,S18,S19,S20,S21,S22,X1,X2,X3 inbox
```

## Details

- Test book: `11 - Projects/second-brain/_0_final/howtos/HOWTO - Test the AI tools.md`. The ids and commands of the nodes come from it; the names are shortened.
- Throwaway issues in `test-bench`: A is the test plan (S03), B is the checklist and depends on A (S06), C comes from the meeting (S09).
- Real notes: S10, S14, S15, S17, and the inbox notes of S11 and S19, because their value is real. All other situations write only in `test-bench`, the daily and weekly notes.
- Handoffs not drawn: S12 also offers `/recall today`, which is S12b. S13 makes B unblockable, and `spotlight.sh` shows it. S05 writes the plan that S12 compares with the unplanned tasks. S04 books `/review-captures` for `test-bench` and, on an odd ISO week, `/sweep` (S19); S14 runs the review on `second-brain`, because `test-bench` has too few captures.
- Failures: a failed situation gets one line under it in the test book. The issue is created at S22, never in the middle of the run.
- The AI assets are first versions. A node done means the situation passed by hand, not that the asset is final.
