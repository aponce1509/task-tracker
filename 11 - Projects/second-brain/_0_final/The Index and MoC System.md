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
created: 2026-10-13 23:15
---
# [[The Index and MoC System]]

> [!abstract] The molecules of the knowledge
> - Indexes and MoCs are navigation points that gather notes by their meaning.
> - An index is only bullets: its value is the grouping and the nesting.
> - A MoC is prose that describes a topic with the notes that exist (or must exist).
> - Concepts are the atoms; indexes and MoCs are the molecules, and they carry the real value.

> [!example] Clustering
> The index `Clustering models` lists the algorithms by family and answers "which models exist". The MoC `Clustering model training` describes the flow (scaling, choice of algorithm, metrics, overfitting) and answers "how do I train one". The index leads to the MoC.

## Common rules

- Both gather notes semantically, by their titles. Bases do the retrieval by properties; indexes and MoCs are curated by hand.
- A note can appear in any number of indexes and MoCs. A concept has no single parent.
- Links to notes that do not exist yet are allowed: they mark the notes to write.
- Other notes (syntheses, specs, hypotheses) can be built from an index or a MoC.
- Knowledge navigation (`topic-index`, `domain-moc`) links knowledge: concepts and the notes built from them, never issues, meetings or journals. Work navigation (`project-moc`, `area-moc`) exists to track work, so it may link issues, meetings and journals.
- Folder: `00 - Map of Contents/`, or next to the content that they curate.
- Metadata: commons schema, class `note`. `status: done` and `maturity: evergreen` when they are in use; `status: wip` while a MoC is a draft.

## Index

- An index is a navigation point: only bullets and links, Zettelkasten style.
- No prose. The value is in the grouping and the nesting. Bullets can hold any short thing (a link, a group label, a path), without a strict form.
- Nesting depth has no limit. Headers only to group a long list.
- When an entry is itself an index or a MoC, it is highlighted in bold: `- **[[Clustering model training]]**`. This is the link from an index to the MoC it leads to.
- One callout on top with the abstract: the question the index answers.
- Subtypes: `global-index` (the root of the vault, exactly one: [[Your main notes]]), `topic-index` (one domain, including big ones like [[The Second Brain System]]).
- Test: "Is the value of this note only in which notes it lists and how it groups them?"

```markdown
# [[Clustering models]]

> [!abstract] Clustering algorithms by family
> - Entry point to the clustering concepts.
> - Leads to how to train a model.

- **[[Clustering model training]]**
- Centroid
	- [[kmeans]]
	- [[gaussian mixtures]]
- Density
	- [[DBSCAN]]
- Hierarchical
	- [[hierarchical clustering]]
```

## MoC

- A MoC is a navigation point that describes a topic with the notes that exist: prose that links concepts.
- It reads as a path when the topic has an order (a training flow), as a map when it has no order.
- A `domain-moc` links concepts, not issues. A `project-moc` or `area-moc` may link the work of its project or area ([[Task Management]] is a project MoC).
- Subtypes: `domain-moc` (a domain), `project-moc` (a project hub), `area-moc` (an area).
- Test: "Does this note explain how its notes connect?"

```markdown
# [[Clustering model training]]

> [!abstract] From raw data to a validated clustering model
> - Scale, pick the algorithm, measure, and check overfitting.

First apply [[scaling]], because distance-based models depend on the units. Then pick the algorithm from [[Clustering models]]. Measure the result with [[inertia]] and the [[silhouette score]]. Last, check [[overfitting]] with a validation split.
```

## Maintenance

- Indexes and MoCs grow when concepts are created: the creation graph of [[The Concept System]] marks which index or MoC to `extend`.
- A new concept goes to the index by its title. It goes to the MoC only when it changes the flow.
- One root: [[Your main notes]] is the only global index. Every other index hangs from it, directly or through another index; every MoC is linked from at least one index.
- A new top-level index goes into the root, in bold, under the group of its domain.
- Archived notes (`archive/` folders, `10 - Archive/`) are out of navigation: they need no place in the tree.

## Audit

Script: `99 - Meta/skills/note-index-moc/scripts/audit.sh` (bash, read-only). It reports:

- Index with prose paragraphs (only bullets, links, headers and callouts allowed).
- Topic index that links concepts and also issues, meetings or journals.
- Index with no link to a concept.
- More than one global index.
- Index not reachable from the global index.
- Index with a single entry.
- Domain MoC that links more issues than concepts.
- MoC that no index links.
- Concept with the same `paras` as a MoC that the MoC does not mention (a hint, not an error).

## Related

- [[The Concept System]] — the atoms
- [[Your main notes]] — the global index, root of the vault
- [[The Second Brain System]] — the topic index of the system
- [[The Note Kinds]] — the map of all note kinds
