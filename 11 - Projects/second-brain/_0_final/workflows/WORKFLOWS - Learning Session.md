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
created: 2026-10-14 00:25
---
# [[WORKFLOWS - Learning Session]]

> [!summary]
> Learning is where the vault tidies itself. I capture raw while I learn, turn it into linked concepts after, and recall them later. Each step also fixes the notes around the new knowledge: no orphan is born, thin indexes grow, and notes that pass a recall climb in maturity.

> [!info] Why here
> Curation follows use. When I learn, I already read the indexes, the MoCs and the old concepts of the topic. That is the cheapest moment to fix them.

**Trigger:** I learn something: a module of a syllabus ([[WORKFLOWS - Start Module]]), a course, a paper, a solved issue · **Timecap:** none for the learning, 15 minutes for the recall · **Driven by:** `/new-concept`, `/recall`

## Steps

- While learning: capture raw in the inbox or in the daily note. No polish ([[Capturing - CODE]]).
- After learning: run `/new-concept` on the source.
	- The creation graph shows the concepts, the source, and the indexes and MoCs to create or extend.
	- Every new concept enters an index or a MoC, and the daily note under `## Learned`.
- Look sideways while linking: a topic index with a single entry or no concept gets the new concept or a missing one. A neighbour concept with a broken link gets the fix.
- Recall the same day or week: `/recall today` or `/recall week`.
	- My answers extend the concepts.
	- Open questions land as `#rfm`, topics as `Read:` lines, facts to say from memory as `#learnable`.
- Maturity: a concept that passes a recall with no change and that I used in real work goes to `evergreen`. I decide.

## Tidies

- Orphans, thin indexes, unrecalled concepts.
- Raw captures of the topic: the source note gets distilled as part of `/new-concept`.
