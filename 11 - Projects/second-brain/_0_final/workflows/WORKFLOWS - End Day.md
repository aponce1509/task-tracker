---
paras:
  - "[[second-brain]]"
type: "[[Standards]]"
subtypes:
  - "[[Normative - Standards - workflow|workflow]]"
rate:
tags:
status: done
maturity: distilled
created: 2026-10-14 00:20
---
# [[WORKFLOWS - End Day]]

> [!summary]
> A ten-minute shutdown: log the day, close what finished, sweep the flags of the notes I touched, offer the day's concepts to recall, and leave a bridge for tomorrow.

**Trigger:** before I close the vault for the day · **Timecap:** 10 minutes · **Driven by:** `/day end`, which offers `/complete-issue`, `/todo-sweep` and `/recall`

## Steps

- Daily Log: what I did and what I discovered, with the unplanned tasks too. Links to the issues and notes I worked on.
- Issues finished today go through [[WORKFLOWS - Complete Issue]]. Unfinished tasks stay in their issue, not in the daily note. A free task that grew into real work becomes an issue with `/create-issue`.
- Todo sweep on the notes I touched today. Each `#todo` line gets one outcome:
	- Real work → an issue with `/create-issue`, and the tag goes.
	- Done in two minutes → do it now, and the tag goes.
	- No longer true → delete the line.
- Learned: the concepts of the day are linked under `## Learned`. When there are some and I have energy, run `/recall today`.
- Bridges ([[The Hemingway Bridge]]):
	- Project: for each project I touched, write its `bridge` with the next concrete action (`b` in the dashboard, or `<leader> p B`).
	- Day: write `Next:` at the end of the Daily Log with the project to start tomorrow.
- Habits: tick the habits of the day in the dashboard (`x`, `+` / `-`).
- Close the tabs.

## Tidies

- Open flags (`#todo`) of the notes used today.
- Unrecalled concepts, through `/recall`.
- Journals, through [[WORKFLOWS - Complete Issue]].
