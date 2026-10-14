---
paras:
  - "[[second-brain]]"
type: "[[Specs]]"
subtypes:
  - "[[Normative - Specs - feature-spec|feature-spec]]"
rate:
tags:
status: done
maturity: evergreen
created: 2026-10-13 23:05
---
# [[The Concept System]]

> [!abstract] The atoms of the knowledge
> A concept is a knowledge item: a thing that I learned or must learn, small enough to learn in one day (k-means, the strategy pattern). Concepts are atomic, they link to other concepts and sources, indexes and MoCs gather them, and the daily note records the day I learned them.

> [!info] Why atoms
> Indexes and MoCs carry the real value, and they are built from concepts. Hypotheses, specs and syntheses are built from concepts too. A concept written once is reused by every note that needs it.

## Definition

- A concept is a thing that I learned or must learn, and that I can learn in one day.
- Test: "Can I learn it in one day, and can I explain it without the note that sent me here?" Yes to both means a concept.
- I create a concept when I learn something or when I must learn something.
- Atomicity is the main rule, but it is fuzzy: no hard limit of length or scope. When a concept grows to more than one idea, it splits in two concepts that link each other.

## Boundaries

- The Core Knowledge subtypes are the options, not a hierarchy to fill: `concept` (definition, mental model), `framework` (structured model, method), `principle` (heuristic, rule), `culture` (general culture). A note takes the subtypes that apply.
- Culture: things of general culture, nice to know but not core for the main thread, for example something seen in a film or during a travel.
- A concept is not a source. Books, courses and videos are Medias or Resources; the concept links to them.
- `#learnable` marks anything I want to be able to say from memory: a definition, a formula, a fact. It is a flag, not a state, so no audit checks it.
- Syntheses, hypotheses and specs are not concepts: they combine concepts.

## Metadata

```yaml
---
paras: ["[[cs_learnings]]"]   # the resource or area of the knowledge; a project is optional
type: "[[Core Knowledge]]"
subtypes:
  - "[[Knowledge - Core Knowledge - concept|concept]]"
rate:
tags: []
status: done                  # the note is written
maturity: capture             # capture -> distilled -> evergreen
created: YYYY-MM-DD HH:mm
---
```

- Class `note`: commons schema only, no extra fields.
- `maturity` tracks the knowledge: `capture` on creation, `distilled` after the distillation pass, `evergreen` when other notes use it as a reference.
- A concept may belong to several PARs: `paras:` takes all of them. The real parents of a concept are the indexes and MoCs that link it.

## Placement and naming

- Folder: `13 - Resources/<resource>/` of the main PAR; `09 - Inbox/` when the PAR is not clear.
- Title: the name of the concept, short, without prefix (`kmeans`, `strategy pattern`).
- Template: `99 - Meta/Templates/Concept - Template.md`.

## Body

```markdown
# [[kmeans]]

> [!abstract] One-paragraph summary
> What it is, what it solves, the key formula or idea.

## Definition

Given $X = \{x_1, \dots, x_n\} \subset \mathbb{R}^d$, k-means finds $k$ centroids that minimise
$$\sum_{i=1}^{n} \min_{j} \lVert x_i - \mu_j \rVert^2$$

## Links

- [[scaling]], [[inertia]], [[gaussian mixtures]]
- See [[Video - StatQuest kmeans]]
- Index: [[Clustering models]]
```

- Style: notes of a mathematics or computer science researcher, in ASD-STE100, with LaTeX in Markdown for formulas ([[How I Like My Notes]]).
- Links live in the text. The first mention of a concept that has a note is a link (`the [[shell]] reads a line`). A relation is never only a bullet in `## Links`.
- `## Links` holds only what the text does not link: the index or MoC, `see [[...]]` pointers and unresolved notes to write. A link in the text is not repeated there.
- Links are bare: `[[shell]]` or `see [[shell]]`. No relation labels such as `Uses`, `Used by` or `Compared with`.
- The Links section can also name the index or MoC that links the concept (`Index: [[...]]`).
- A source is linked only when it is a note (`see [[Video - StatQuest kmeans]]`). Never write the provenance of a note that has no source note, such as `Source: user`: the note reads as written by me.
- Summary callout on top. Sections only when they carry meaning (definition, intuition, properties, example, links).

## Links

- Out: at least one link to another concept or to a source. Links to notes that do not exist yet are allowed: they mark concepts to write.
- In: at least one index or MoC links the concept. A concept without one is an orphan atom.
- Recall: the daily note of the day links the concept under `## Learned` (a link, not an embed). This records what I learn each day. There is no exit from the loop: it is a record, not spaced repetition.

## Recall

Recall is not strictly needed: the daily link already keeps the record. It is a chance to test what I learned and to go further.

- When: at the end of the day (the concepts of the daily note) and in the weekly review (the concepts of the week's daily notes).
- How: a conversation, one concept at a time. Questions go from recall (define it) to use (apply it to a case) to connection (relate it to another concept).
- Extend: what the conversation adds goes to the concept note, or becomes a new concept.
- Output: under each concept in `## Learned`, the questions that stay open to answer or meditate (`#rfm`), the topics to read or study next, and the facts I want to say from memory (`#learnable`). The daily note keeps the day; the weekly note keeps the week.

```markdown
## Learned

- [[kmeans]]
	- Why does k-means fail on clusters that are not convex? #rfm
	- Read: [[gaussian mixtures]], the soft version of k-means
	- Each step never increases $\sum_i \lVert x_i - \mu_{c(i)} \rVert^2$, so k-means converges #learnable
```

## Creation graph

A concept is never created alone. Before writing, the graph of the change is shown and approved: which sources, which index or MoC to create or extend, which concepts are new and how they relate.

```
Sources
  [exists] Article - Clustering with sklearn
  [new]    Video - StatQuest kmeans

Navigation
  [exists] Index: Clustering models          (extend: +gaussian-mixtures)
  [new]    MoC:   Clustering model training  (linked from the Index)

Concepts
  [new]    kmeans            <- Video - StatQuest kmeans
    uses   [exists] scaling
    uses   [?]      inertia
  [new]    gaussian-mixtures <- Article - Clustering with sklearn
    vs     kmeans
  [exists] silhouette-score  (cited by the MoC, not touched)

MoC outline: scaling -> pick algorithm (Index) -> inertia, silhouette -> overfitting
```

Markers: `[new]` create, `[exists]` keep, `extend` add entries, `[?]` link to a note that does not exist yet.

## Audit

Script: `99 - Meta/skills/note-concept/scripts/audit.sh` (bash, read-only). It reports:

- Concept that no index or MoC links (orphan atom).
- Concept that no daily note links (never recalled).
- Concept with no outgoing link to another concept or source (unresolved links count as links).
- Concept without a `Core Knowledge` type or without a subtype.

## Related

- [[The Index and MoC System]] — the molecules that gather concepts
- [[The Note Kinds]] — the map of all note kinds
- [[Progressive Summarisation]] · [[Distill - CODE]] — how a concept climbs `maturity`
