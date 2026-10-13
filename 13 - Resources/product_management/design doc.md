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
# [[design doc]]

> [!abstract] The plan of the implementation
> A design doc (technical design document, TDD) describes how a feature or a component will be built, before the build starts. It answers "how", where the specification answers "what". It covers algorithms, data structures, interfaces, flows, error handling, testing and the alternatives that were rejected.

## Definition

Let $F$ be a feature or a component, and $S_F$ its specification. A design doc $D_F$ is a proposed implementation of $F$ that satisfies $S_F$:

$$D_F = (\text{algorithms}, \text{data structures}, \text{interfaces}, \text{flows}, \text{error handling}, \text{testing}, \text{alternatives})$$

- Scope: one feature or one component, not the full system (that is the architecture document).
- Time: written before the implementation, and reviewed before the work starts.
- Input: the specification gives the required behaviour; the design doc chooses the mechanism.
- Output: the basis for the implementation plan and the task breakdown.

## Intuition

The specification fixes the contract. Many implementations can satisfy it. The design doc selects one, explains it and compares it with the others, so that the reviewers can find problems while a change is still cheap.

## Links

- Uses [[specification]]: the design doc implements the behaviour that the specification defines.
- Compared with [[architecture decision record]]: a design doc proposes a whole implementation before it is built; an ADR records one decision and its rationale, and stays as history.
- Source: [[Product Documentation]] · [[Documentación de proyectos simplificada]]
