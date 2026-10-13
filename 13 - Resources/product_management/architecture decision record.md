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
# [[architecture decision record]]

> [!abstract] Summary
> An architecture decision record (ADR) is a short document that records one important technical decision. It keeps the context, the alternatives, the decision, the rationale, the consequences and the status. It solves the loss of the "why" behind a system. An accepted ADR is immutable: a new ADR supersedes it.

## Definition

Notation: an ADR is a tuple $a = (C, A, d, r, Q, s)$.

- $C$: the context. The forces and constraints that make a decision necessary.
- $A = \{a_1, \dots, a_n\}$: the alternatives that the team considered.
- $d \in A$: the decision, the selected alternative.
- $r$: the rationale. Why $d$ is better than $A \setminus \{d\}$ under $C$.
- $Q$: the consequences. The positive and negative effects of $d$.
- $s \in \{\text{proposed}, \text{accepted}, \text{rejected}, \text{deprecated}, \text{superseded}\}$: the status.

An ADR records exactly one decision. The set of ADRs of a project is an append-only log, ordered by number.

## Properties

- Immutability: after $s = \text{accepted}$, the content of $a$ does not change. Only the status can change.
- Supersession: to change a decision $a_i$, write a new ADR $a_j$ with $j > i$. Set $s_i = \text{superseded}$ and link $a_i \to a_j$.
- Scope: an ADR records the decision, not the implementation. The implementation goes in a [[design doc]].

## Links

- Compared with [[design doc]]: a design doc describes how to implement a feature and evolves with it; an ADR freezes one decision and its rationale.
- Source: [[Product Documentation]] · [[Documentación de proyectos simplificada]]
