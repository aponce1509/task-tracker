---
paras: ["[[second-brain]]"]
type: "[[Syntheses]]"
subtypes: ["[[Knowledge - Syntheses - case-study|case-study]]"]
tags: []
status: wip
maturity: capture
created: 2026-10-13 12:00
---
# [[Case - Clustering models index and MoC]]

Hypothetical situation used to stress-test the index and MoC kinds. Not a real project.

## Situation

Concept notes exist for kmeans, DBSCAN, hierarchical clustering, standardisation, silhouette score, inertia and overfitting. Goal: navigate them and describe how to train a clustering model.

## How to process it

- Index `Clustering models`: only bullets, one per algorithm concept, grouped by family (centroid, density, hierarchical). It is the Zettelkasten entry and it links to the MoC.
- MoC `Clustering model training`: prose describing the flow, scaling first, then choosing the algorithm from the index, then metrics, then overfitting and validation. Each step links the concept that explains it.
- Concepts stay atomic: scaling, silhouette and overfitting are written once and reused by the MoC, and by other MoCs such as classification training.
- The index answers "which models exist", the MoC answers "how do I train one".
- A new concept (for example, Gaussian mixtures) is added to the index by title, and to the MoC only if the training flow changes.

## Limits found

- Scaling and overfitting belong to several MoCs, so a concept needs no single parent, which the paras property cannot express.
- The MoC may need concepts that do not exist yet, with no marker for a placeholder.
- Nothing links an index to the MoC it leads to except a plain bullet.

## Open decisions

- Placeholders in a MoC: allowed or not.
- Whether the index-to-MoC link needs a convention.
