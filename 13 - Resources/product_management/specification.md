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
# [[specification]]

> [!abstract] What the system must do
> A specification (spec) defines the expected behaviour of a system or feature: inputs, outputs, edge cases, constraints and acceptance criteria. It removes ambiguity about *what* to build before anyone decides *how*. Key idea: a spec is a contract on observable behaviour, and its acceptance criteria make it testable.

## Definition

Let $F$ be a system or feature, $I$ its input domain and $O$ its output domain. A specification of $F$ is a tuple
$$S = (I, O, B, E, C, A)$$
- $B \subseteq I \times O$: the expected behaviour, the allowed input-output pairs (the functional requirements).
- $E \subseteq I$: the edge cases, inputs at the limits of the domain or inputs that must fail in a defined way.
- $C$: the constraints, conditions that every implementation must respect (performance, security, compatibility).
- $A$: the acceptance criteria, checks that decide if an implementation satisfies $S$.

An implementation $f : I \to O$ satisfies $S$ when $(x, f(x)) \in B$ for all $x \in I$, $f$ respects $C$, and $f$ passes every check in $A$.

## Intuition

- The spec answers "what must $F$ do", not "why" or "how".
- The "why" (user needs, goals, success metrics) stays in the [[product requirements document]].
- The "how" (algorithms, data structures, components) goes to the [[design doc]].
- Without $A$, the spec is a wish: nobody can say when the work is done.

## Links

- Compared with [[product requirements document]]
- Used by [[design doc]]: the design doc proposes how to implement what the spec requires
- Related to [[User Stories VS Requirements]]
- Source: [[Product Documentation]] · [[Documentación de proyectos simplificada]]
