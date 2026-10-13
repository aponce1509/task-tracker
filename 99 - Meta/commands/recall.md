---
description: Recall session on the concepts learned today or this week - questions one concept at a time, extend the notes, and leave open questions, topics to read and facts to memorize in the daily or weekly note
argument-hint: "[today | yesterday | week | YYYY-MM-DD], default today"
---

Run a recall session for: $ARGUMENTS (default `today`).

Recall is a chance to test what the user learned and to go further: you ask, the user answers, and together you find what is still unclear and what to study next. It is a conversation, not an exam. The record already exists in the daily note; this session adds depth.

## Load first

- `11 - Projects/second-brain/_0_final/The Concept System.md`, sections Recall and Links: the spec. It wins over anything else here.
- The `note-concept` skill (for edits to concepts) and `99 - Meta/skills/obsidian-vault-notes/references/writing-style.md`.

## Steps

1. Collect the concepts.
	- `today`, `yesterday` or a date: the daily note `07 - Daily/YYYY-MM-DD.md` (`obsidian daily:path` for today).
	- `week`: the daily notes of the current ISO week; the target note is `07 - Daily/Weeks/YYYY-Www.md`.
	- Take the links under `## Learned`, plus any other link in those notes to a note of type `Core Knowledge`. Skip the ones that already have open-question bullets from an earlier session in the same note.
	- If there are none, say so and offer the concepts created in that range (`created:` in the frontmatter). Stop if the user declines.
2. Prepare. Read each concept, its sources and the concepts it links. Show the list with one line each and ask where to start (default: the list order).
3. Ask, one concept at a time.
	- One question per message, and wait for the answer. Go from recall ("define it in your own words") to use ("what happens with this input?") to connection ("how does it differ from X?").
	- After each answer: say what was right, correct what was wrong, and point to the part of the note that covers it. Let the user try before you give the answer.
	- Two or three questions per concept are enough; move on when the user says so.
4. Extend. When the conversation brings something the note lacks (a property, an example, a counter-case, a link), propose the exact addition. Apply it with the Edit tool only after approval. A new idea that is a concept of its own becomes an unresolved link and a candidate for `/new-concept`; do not create it here.
5. Close. For each concept, propose:
	- the questions that stay open, to answer or meditate later, each tagged `#rfm`;
	- the topics to read or study next, as `Read:` bullets with wikilinks (unresolved when the note does not exist) or a source the user named;
	- the facts the user wants to say from memory, tagged `#learnable`, only the ones the user picks.
	Show the block, wait for approval, then write it under the concept bullet in `## Learned` of the target note (the daily note, or the weekly note for `week`). Create `## Learned` if it is missing: before `## WIPS Notes` in a daily note, after `## Completed tasks` in a weekly note.

```markdown
## Learned

- [[kmeans]]
	- Why does k-means fail on clusters that are not convex? #rfm
	- Read: [[gaussian mixtures]], the soft version of k-means
	- Each step never increases $\sum_i \lVert x_i - \mu_{c(i)} \rVert^2$, so k-means converges #learnable
```

## Output

End with: the concepts reviewed, the concept notes changed, the open questions and topics written (with the target note), and the `/new-concept` candidates.

## Rules

- Ask one question at a time and wait. A list of ten questions at once turns recall into reading.
- Never invent sources or URLs for the topics to study. Use vault notes, unresolved wikilinks, or sources the user named.
- Questions and topics are written as the user's own notes: short, no sentences addressed to the user.
- Change concept notes only with approval; the session is about the user's understanding, and the note must stay theirs.
