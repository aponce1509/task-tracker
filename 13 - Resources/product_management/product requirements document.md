---
paras: ["[[product_management]]"]
type: "[[Core Knowledge]]"
subtypes:
  - "[[Knowledge - Core Knowledge - concept|concept]]"
rate:
tags: []
status: done
maturity: capture
created: 2026-10-14 10:00
---
# [[product requirements document]]

> [!abstract] Summary
> A product requirements document (PRD) defines what a product must do and why. It fixes the goals, the user needs, the requirements, their priorities and the success metrics. It is the product-level contract before any design: the PRD gives the what and the why, and the specification of each feature gives the how.

## Definition

Notation: a PRD for product $P$ is a tuple $\mathrm{PRD}(P) = (G, U, R_F, R_{NF}, \pi, M)$, where

- $G$ is the set of product goals.
- $U$ is the set of user needs (the problems that $P$ solves).
- $R_F$ is the set of functional requirements: what $P$ must do.
- $R_{NF}$ is the set of non-functional requirements: qualities and constraints (performance, security, usability).
- $\pi : R_F \cup R_{NF} \to \{\text{must}, \text{should}, \text{could}\}$ gives the priority of each requirement.
- $M$ is the set of success metrics that measure whether $P$ meets $G$.

A PRD is a document of product and project definition. Each requirement traces back to a goal or a user need: $\forall r \in R_F \cup R_{NF},\ \exists\, x \in G \cup U$ that justifies $r$.

## Properties

- Scope: the whole product or a large release, not a single feature.
- Audience: product, engineering, design and stakeholders. It uses the language of the problem, not of the implementation.
- It does not describe the implementation. Designs and specifications come after it and refine its requirements.

## Links

- Compared with [[specification]]: the PRD says what and why for the product; the spec says how a feature must behave (inputs, outputs, edge cases, acceptance criteria).
- Related to [[User Stories VS Requirements]]
- Source: [[Product Documentation]] · [[Documentación de proyectos simplificada]]
