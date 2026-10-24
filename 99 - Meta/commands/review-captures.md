---
description: Contextual capture review of one PAR - rank its capture notes by the open issues, distill the two or three I pick and link them from the project
argument-hint: "[par], default the PAR of the most recent wip issue"
---

Review the captures of: $ARGUMENTS

Dead time or a project switch is the moment to distill only what the current project needs. High relevance, low effort, no need to clear the list.

## Load first

- `11 - Projects/second-brain/_0_final/workflows/WORKFLOWS - Contextual Capture Review.md`. It wins over anything else here.
- The `obsidian-vault-notes` skill; the kind skills come through `/guide-distillation`.

## Steps

1. PAR. $ARGUMENTS names it; empty → the `paras` of the most recently modified `wip` issue in `08 - Issues/`. Say which PAR you took.
2. Query: `obsidian search query='["maturity":capture] ["paras":"[[<par>]]"]'`. Without Obsidian: `rg -l 'maturity: capture' --glob '*.md' . | xargs rg -l '\[\[<par>'`.
3. Rank: notes linked from the open issues of the PAR first, then the most recent edits.
4. Show the top 5, one line each (note, why it ranks). I pick 2 or 3.
5. For each pick, run the steps of `/guide-distillation <note>`, one note at a time.
6. Feed the project: offer a link to each distilled note from the project MoC, or from the PAR note when the project has no MoC. Apply on approval.

## Output

The ranked list, the notes distilled, the links added.

## Rules

- Timecap 15 minutes. Stop between notes, never in the middle of one.
- A link, never a copy of the content.
